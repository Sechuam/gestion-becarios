<?php

namespace App\Http\Controllers;

use App\Models\Absence;
use App\Models\EducationCenter;
use App\Models\Intern;
use App\Models\Task;
use App\Models\TimeLog;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $role = $user->roles->first()?->name ?? 'intern';

        $data = Cache::remember("dashboard:v1:{$user->id}:{$role}", now()->addMinutes(5), function () use ($user, $role) {
            $internQuery = $this->scopedInternQuery($user, $role);
            $internIds = (clone $internQuery)->pluck('interns.id');
            $userIds = (clone $internQuery)->pluck('interns.user_id');

            $taskQuery = Task::query()
                ->when(! $user->isAdmin(), function (Builder $query) use ($internIds, $user) {
                    if ($user->isTutor()) {
                        $query->where('created_by', $user->id)
                            ->orWhereHas('interns', fn (Builder $interns) => $interns->whereIn('interns.id', $internIds));

                        return;
                    }

                    $query->whereHas('interns', fn (Builder $interns) => $interns->whereIn('interns.id', $internIds));
                });

            $activeInterns = (clone $internQuery)->where('status', 'active')->count();
            $totalTasks = (clone $taskQuery)->count();
            $completedTasks = (clone $taskQuery)->where('status', 'completed')->count();
            $pendingAbsences = Absence::query()
                ->whereIn('user_id', $userIds)
                ->where('status', 'pending')
                ->count();
            $openTimeLogs = TimeLog::query()
                ->whereIn('user_id', $userIds)
                ->whereDate('date', Carbon::today())
                ->whereNotNull('clock_in')
                ->whereNull('clock_out')
                ->count();

            $expectedHours = max(1, (clone $internQuery)->sum('total_hours'));
            $workedHours = TimeLog::query()->whereIn('user_id', $userIds)->sum('total_hours');
            $attendanceCompliance = min(100, round(($workedHours / $expectedHours) * 100));

            return [
                'role' => $role,
                'stats' => [
                    'active_interns' => $activeInterns,
                    'active_centers' => $this->activeCentersCount($internQuery, $user),
                    'active_tasks' => (clone $taskQuery)->whereIn('status', ['pending', 'active', 'in_progress', 'review'])->count(),
                    'alerts' => $pendingAbsences + $openTimeLogs,
                    'attendance_compliance' => $attendanceCompliance,
                    'completed_tasks' => $completedTasks,
                    'total_tasks' => $totalTasks,
                ],
                'interns_by_center' => $this->internsByCenter($internQuery),
                'attendance_chart' => $this->attendanceChart($userIds),
                'task_status_chart' => $this->taskStatusChart($taskQuery),
                'task_progress' => $this->taskProgress($internQuery),
                'alerts' => [
                    ['label' => 'Ausencias pendientes', 'value' => $pendingAbsences, 'tone' => 'warning'],
                    ['label' => 'Jornadas abiertas hoy', 'value' => $openTimeLogs, 'tone' => 'info'],
                    ['label' => 'Tareas sin completar', 'value' => max(0, $totalTasks - $completedTasks), 'tone' => 'danger'],
                ],
            ];
        });

        return Inertia::render('dashboard/Index', $data);
    }

    protected function scopedInternQuery($user, string $role): Builder
    {
        return Intern::query()
            ->with(['user', 'educationCenter'])
            ->when($role === 'tutor' || $user->isTutor(), fn (Builder $query) => $query->where('company_tutor_user_id', $user->id))
            ->when($role === 'intern' || $user->isIntern(), fn (Builder $query) => $query->where('user_id', $user->id));
    }

    protected function activeCentersCount(Builder $internQuery, $user): int
    {
        if ($user->isAdmin()) {
            return EducationCenter::count();
        }

        return (clone $internQuery)->distinct('education_center_id')->count('education_center_id');
    }

    protected function internsByCenter(Builder $internQuery): array
    {
        return (clone $internQuery)
            ->selectRaw("COALESCE(education_centers.name, 'Sin centro') as center, COUNT(*) as total")
            ->leftJoin('education_centers', 'education_centers.id', '=', 'interns.education_center_id')
            ->groupBy('education_centers.name')
            ->orderByDesc('total')
            ->limit(8)
            ->get()
            ->map(fn ($row) => ['name' => $row->center, 'becarios' => (int) $row->total])
            ->values()
            ->all();
    }

    protected function attendanceChart($userIds): array
    {
        $start = Carbon::now()->subMonths(5)->startOfMonth();
        $monthExpression = match (DB::getDriverName()) {
            'sqlite' => 'strftime("%Y-%m", date)',
            'pgsql' => "to_char(date, 'YYYY-MM')",
            default => 'DATE_FORMAT(date, "%Y-%m")',
        };

        $rows = TimeLog::query()
            ->selectRaw("{$monthExpression} as month, ROUND(SUM(total_hours), 2) as hours")
            ->whereIn('user_id', $userIds)
            ->whereDate('date', '>=', $start)
            ->groupBy('month')
            ->pluck('hours', 'month');

        return collect(range(0, 5))
            ->map(function ($offset) use ($start, $rows) {
                $month = $start->copy()->addMonths($offset);

                return [
                    'month' => $month->translatedFormat('M'),
                    'horas' => (float) ($rows[$month->format('Y-m')] ?? 0),
                ];
            })
            ->values()
            ->all();
    }

    protected function taskStatusChart(Builder $taskQuery): array
    {
        $labels = [
            'pending' => 'Pendientes',
            'active' => 'Activas',
            'in_progress' => 'En curso',
            'review' => 'Revisión',
            'completed' => 'Completadas',
            'rejected' => 'Rechazadas',
        ];

        return (clone $taskQuery)
            ->select('status', DB::raw('COUNT(*) as total'))
            ->groupBy('status')
            ->get()
            ->map(fn ($row) => [
                'name' => $labels[$row->status] ?? ucfirst((string) $row->status),
                'value' => (int) $row->total,
            ])
            ->values()
            ->all();
    }

    protected function taskProgress(Builder $internQuery): array
    {
        return (clone $internQuery)
            ->select('interns.*')
            ->addSelect([
                'worked_hours' => TimeLog::query()
                    ->selectRaw('COALESCE(SUM(total_hours), 0)')
                    ->whereColumn('time_logs.user_id', 'interns.user_id'),
            ])
            ->withCount([
                'evaluations',
                'tasks',
                'tasks as completed_tasks' => fn (Builder $query) => $query->where('status', 'completed'),
            ])
            ->orderByDesc('updated_at')
            ->limit(8)
            ->get()
            ->map(function (Intern $intern) {
                $totalTasks = (int) $intern->tasks_count;
                $completedTasks = (int) $intern->completed_tasks_count;

                return [
                    'id' => $intern->id,
                    'name' => $intern->user?->name ?? 'Sin usuario',
                    'center' => $intern->educationCenter?->name ?? 'Sin centro',
                    'completed' => $completedTasks,
                    'total' => $totalTasks,
                    'progress' => $totalTasks > 0 ? (int) round(($completedTasks / $totalTasks) * 100) : 0,
                    'hours' => round((float) $intern->worked_hours, 1),
                ];
            })
            ->values()
            ->all();
    }
}
