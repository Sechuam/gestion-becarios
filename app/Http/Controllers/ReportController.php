<?php

namespace App\Http\Controllers;

use App\Exports\CustomReportExport;
use App\Models\Evaluation;
use App\Models\Intern;
use App\Models\ReportTemplate;
use App\Models\Task;
use App\Models\TimeLog;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use Spatie\LaravelPdf\Facades\Pdf;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        return Inertia::render('reports/index', [
            'datasets' => $this->datasets(),
            'templates' => ReportTemplate::query()
                ->where('user_id', $user->id)
                ->latest()
                ->get(['id', 'name', 'dataset', 'columns', 'filters', 'updated_at']),
            'summary' => Cache::remember("reports:summary:{$user->id}", now()->addMinutes(5), fn () => [
                'interns' => $this->scopedInternQuery($user)->count(),
                'tasks' => $this->scopedTaskQuery($user)->count(),
                'time_logs' => TimeLog::query()->whereIn('user_id', $this->scopedInternQuery($user)->pluck('user_id'))->count(),
                'evaluations' => Evaluation::query()->whereIn('intern_id', $this->scopedInternQuery($user)->pluck('id'))->count(),
            ]),
        ]);
    }

    public function storeTemplate(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:120',
            'dataset' => 'required|string|in:interns,tasks,attendance,evaluations',
            'columns' => 'required|array|min:1',
            'columns.*' => 'string',
            'filters' => 'nullable|array',
        ]);

        ReportTemplate::create([
            ...$validated,
            'user_id' => $request->user()->id,
            'filters' => $validated['filters'] ?? [],
        ]);

        return back()->with('success', 'Plantilla de informe guardada correctamente.');
    }

    public function export(Request $request)
    {
        $validated = $request->validate([
            'dataset' => 'required|string|in:interns,tasks,attendance,evaluations',
            'format' => 'required|string|in:xlsx,pdf',
            'columns' => 'nullable',
            'status' => 'nullable|string|max:40',
            'from' => 'nullable|date',
            'to' => 'nullable|date|after_or_equal:from',
            'group_by' => 'nullable|string|max:80',
        ]);

        $availableColumns = $this->datasets()[$validated['dataset']]['columns'];
        $columns = $this->resolveColumns($validated['columns'] ?? null, $availableColumns);
        $groupBy = $this->resolveGroupBy($validated['group_by'] ?? null, $availableColumns);
        $rows = $this->reportRows($request, $validated['dataset']);

        if ($groupBy) {
            $availableColumns = ['group' => ['heading' => 'Grupo']] + $availableColumns;
            $columns = array_values(array_unique(['group', ...$columns]));
            $rows = $this->groupRows($rows, $groupBy);
        }

        $filename = 'reporte-'.$validated['dataset'].'-'.now()->format('Y-m-d');

        if ($validated['format'] === 'pdf') {
            return Pdf::view('pdfs.custom-report', [
                'title' => $this->datasets()[$validated['dataset']]['label'],
                'rows' => $rows,
                'columns' => $columns,
                'availableColumns' => $availableColumns,
                'generatedAt' => now()->format('d/m/Y H:i'),
            ])
                ->driver('dompdf')
                ->name("{$filename}.pdf");
        }

        return Excel::download(new CustomReportExport($rows, $columns, $availableColumns), "{$filename}.xlsx");
    }

    protected function reportRows(Request $request, string $dataset)
    {
        $user = $request->user();

        return match ($dataset) {
            'interns' => $this->scopedInternQuery($user)
                ->when($request->status, fn (Builder $query, string $status) => $query->where('status', $status))
                ->with(['user', 'educationCenter', 'companyTutor'])
                ->latest()
                ->limit(500)
                ->get()
                ->map(fn (Intern $intern) => [
                    'id' => $intern->id,
                    'name' => $intern->user?->name,
                    'email' => $intern->user?->email,
                    'center' => $intern->educationCenter?->name,
                    'tutor' => $intern->companyTutor?->name,
                    'status' => $intern->status,
                    'start_date' => $intern->start_date,
                    'end_date' => $intern->end_date,
                    'total_hours' => $intern->total_hours,
                ]),
            'tasks' => $this->scopedTaskQuery($user)
                ->when($request->status, fn (Builder $query, string $status) => $query->where('status', $status))
                ->with(['creator', 'practiceType', 'interns.user'])
                ->latest()
                ->limit(500)
                ->get()
                ->map(fn (Task $task) => [
                    'id' => $task->id,
                    'title' => $task->title,
                    'status' => $task->status,
                    'priority' => $task->priority,
                    'due_date' => $task->due_date,
                    'creator' => $task->creator?->name,
                    'practice_type' => $task->practiceType?->name,
                    'interns' => $task->interns->pluck('user.name')->filter()->join(', '),
                ]),
            'attendance' => TimeLog::query()
                ->whereIn('user_id', $this->scopedInternQuery($user)->pluck('user_id'))
                ->when($request->from, fn (Builder $query, string $from) => $query->whereDate('date', '>=', $from))
                ->when($request->to, fn (Builder $query, string $to) => $query->whereDate('date', '<=', $to))
                ->with('user')
                ->latest('date')
                ->limit(500)
                ->get()
                ->map(fn (TimeLog $log) => [
                    'id' => $log->id,
                    'intern' => $log->user?->name,
                    'date' => $log->date?->format('Y-m-d'),
                    'clock_in' => $log->clock_in,
                    'clock_out' => $log->clock_out,
                    'total_hours' => $log->total_hours,
                    'notes' => $log->notes,
                ]),
            'evaluations' => Evaluation::query()
                ->whereIn('intern_id', $this->scopedInternQuery($user)->pluck('id'))
                ->when($request->from, fn (Builder $query, string $from) => $query->whereDate('created_at', '>=', $from))
                ->when($request->to, fn (Builder $query, string $to) => $query->whereDate('created_at', '<=', $to))
                ->with(['intern.user', 'evaluator'])
                ->latest()
                ->limit(500)
                ->get()
                ->map(fn (Evaluation $evaluation) => [
                    'id' => $evaluation->id,
                    'intern' => $evaluation->intern?->user?->name,
                    'evaluator' => $evaluation->evaluator?->name,
                    'type' => $evaluation->evaluation_type,
                    'average_score' => $evaluation->weighted_score ?? $evaluation->total_score,
                    'created_at' => $evaluation->created_at?->format('Y-m-d'),
                ]),
            default => collect(),
        };
    }

    protected function resolveColumns($rawColumns, array $availableColumns): array
    {
        $available = array_keys($availableColumns);

        if (is_string($rawColumns)) {
            $rawColumns = array_filter(array_map('trim', explode(',', $rawColumns)));
        }

        if (! is_array($rawColumns) || count($rawColumns) === 0) {
            return $available;
        }

        $columns = array_values(array_intersect($available, $rawColumns));

        return count($columns) > 0 ? $columns : $available;
    }

    protected function resolveGroupBy(?string $groupBy, array $availableColumns): ?string
    {
        if (! $groupBy || ! array_key_exists($groupBy, $availableColumns)) {
            return null;
        }

        return $groupBy;
    }

    protected function groupRows(Collection $rows, string $groupBy): Collection
    {
        return $rows
            ->map(function ($row) use ($groupBy) {
                $group = data_get($row, $groupBy) ?: 'Sin valor';

                return ['group' => $group] + $row;
            })
            ->sortBy('group')
            ->values();
    }

    protected function scopedInternQuery($user): Builder
    {
        return Intern::query()
            ->when($user->isTutor(), fn (Builder $query) => $query->where('company_tutor_user_id', $user->id))
            ->when($user->isIntern(), fn (Builder $query) => $query->where('user_id', $user->id));
    }

    protected function scopedTaskQuery($user): Builder
    {
        $internIds = $this->scopedInternQuery($user)->pluck('id');

        return Task::query()
            ->when($user->isTutor(), function (Builder $query) use ($user, $internIds) {
                $query->where('created_by', $user->id)
                    ->orWhereHas('interns', fn (Builder $interns) => $interns->whereIn('interns.id', $internIds));
            })
            ->when($user->isIntern(), fn (Builder $query) => $query->whereHas('interns', fn (Builder $interns) => $interns->whereIn('interns.id', $internIds)));
    }

    protected function datasets(): array
    {
        return [
            'interns' => [
                'label' => 'Becarios',
                'columns' => [
                    'id' => ['heading' => 'ID'],
                    'name' => ['heading' => 'Nombre'],
                    'email' => ['heading' => 'Email'],
                    'center' => ['heading' => 'Centro educativo'],
                    'tutor' => ['heading' => 'Tutor'],
                    'status' => ['heading' => 'Estado'],
                    'start_date' => ['heading' => 'Inicio'],
                    'end_date' => ['heading' => 'Fin'],
                    'total_hours' => ['heading' => 'Horas objetivo'],
                ],
            ],
            'tasks' => [
                'label' => 'Tareas',
                'columns' => [
                    'id' => ['heading' => 'ID'],
                    'title' => ['heading' => 'Título'],
                    'status' => ['heading' => 'Estado'],
                    'priority' => ['heading' => 'Prioridad'],
                    'due_date' => ['heading' => 'Entrega'],
                    'creator' => ['heading' => 'Creador'],
                    'practice_type' => ['heading' => 'Tipo de práctica'],
                    'interns' => ['heading' => 'Becarios'],
                ],
            ],
            'attendance' => [
                'label' => 'Asistencia',
                'columns' => [
                    'id' => ['heading' => 'ID'],
                    'intern' => ['heading' => 'Becario'],
                    'date' => ['heading' => 'Fecha'],
                    'clock_in' => ['heading' => 'Entrada'],
                    'clock_out' => ['heading' => 'Salida'],
                    'total_hours' => ['heading' => 'Horas'],
                    'notes' => ['heading' => 'Notas'],
                ],
            ],
            'evaluations' => [
                'label' => 'Evaluaciones',
                'columns' => [
                    'id' => ['heading' => 'ID'],
                    'intern' => ['heading' => 'Becario'],
                    'evaluator' => ['heading' => 'Evaluador'],
                    'type' => ['heading' => 'Tipo'],
                    'average_score' => ['heading' => 'Media'],
                    'created_at' => ['heading' => 'Fecha'],
                ],
            ],
        ];
    }
}
