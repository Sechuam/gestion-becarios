<?php

namespace App\Http\Controllers;

use App\Models\Absence;
use App\Models\EducationCenter;
use App\Models\Intern;
use App\Models\Schedule;
use App\Models\Task;
use App\Models\TimeLog;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        /** @var User $user */
        $user = Auth::user();
        $role = $user->roles->first()?->name ?? 'intern';

        $data = Cache::remember("dashboard:v2:{$user->id}:{$role}", now()->addMinute(), function () use ($user, $role) {
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
            $attendanceStats = $this->attendanceStats($userIds);

            return [
                'role' => $role,
                'stats' => [
                    'active_interns' => $activeInterns,
                    'active_centers' => $this->activeCentersCount($internQuery, $user),
                    'active_tasks' => (clone $taskQuery)->whereIn('status', ['pending', 'in_progress', 'in_review'])->count(),
                    'pending_evaluations' => $this->pendingEvaluationsCount($internQuery),
                    'upcoming_endings' => $this->upcomingEndingsCount($internQuery),
                    'alerts' => $pendingAbsences + $openTimeLogs,
                    'attendance_compliance' => $attendanceCompliance,
                    'complete_attendance_rate' => $attendanceStats['complete_attendance_rate'],
                    'average_delay_minutes' => $attendanceStats['average_delay_minutes'],
                    'absence_rate' => $attendanceStats['absence_rate'],
                    'completed_tasks' => $completedTasks,
                    'total_tasks' => $totalTasks,
                    'average_task_resolution_days' => $this->averageTaskResolutionDays($taskQuery),
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

    protected function scopedInternQuery(User $user, string $role): Builder
    {
        return Intern::query()
            ->with(['user', 'educationCenter'])
            ->when($role === 'tutor' || $user->isTutor(), fn (Builder $query) => $query->where('company_tutor_user_id', $user->id))
            ->when($role === 'intern' || $user->isIntern(), fn (Builder $query) => $query->where('user_id', $user->id));
    }

    protected function activeCentersCount(Builder $internQuery, User $user): int
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

    protected function attendanceChart(Collection $userIds): array
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

    protected function attendanceStats(Collection $userIds): array
    {
        $start = Carbon::today()->subDays(29);
        $end = Carbon::today();
        $weekdayColumns = [
            'monday' => 'monday_hours',
            'tuesday' => 'tuesday_hours',
            'wednesday' => 'wednesday_hours',
            'thursday' => 'thursday_hours',
            'friday' => 'friday_hours',
            'saturday' => 'saturday_hours',
            'sunday' => 'sunday_hours',
        ];

        $schedules = Schedule::query()
            ->whereIn('user_id', $userIds)
            ->whereDate('start_date', '<=', $end)
            ->where(fn (Builder $query) => $query->whereNull('end_date')->orWhereDate('end_date', '>=', $start))
            ->orderByDesc('start_date')
            ->get()
            ->groupBy('user_id');

        $workedHours = TimeLog::query()
            ->whereIn('user_id', $userIds)
            ->whereBetween('date', [$start, $end])
            ->get(['user_id', 'date', 'total_hours'])
            ->groupBy(fn (TimeLog $log) => $log->user_id.'|'.$log->date->format('Y-m-d'))
            ->map(fn (Collection $logs) => (float) $logs->sum('total_hours'));

        $expectedDays = 0;
        $completeDays = 0;

        foreach ($userIds as $userId) {
            for ($date = $start->copy(); $date->lte($end); $date->addDay()) {
                $schedule = ($schedules[$userId] ?? collect())->first(function (Schedule $schedule) use ($date) {
                    return $schedule->start_date->lte($date)
                        && (! $schedule->end_date || $schedule->end_date->gte($date));
                });

                if (! $schedule) {
                    continue;
                }

                $expectedHours = (float) ($schedule->{$weekdayColumns[strtolower($date->format('l'))]} ?? 0);

                if ($expectedHours <= 0) {
                    continue;
                }

                $expectedDays++;
                $worked = $workedHours[$userId.'|'.$date->format('Y-m-d')] ?? 0;

                if ($worked >= $expectedHours) {
                    $completeDays++;
                }
            }
        }

        $approvedAbsences = Absence::query()
            ->whereIn('user_id', $userIds)
            ->where('status', 'approved')
            ->whereBetween('date', [$start, $end])
            ->count();

        return [
            'complete_attendance_rate' => $expectedDays > 0 ? (int) round(($completeDays / $expectedDays) * 100) : 0,
            'average_delay_minutes' => null,
            'absence_rate' => $expectedDays > 0 ? (int) round(($approvedAbsences / $expectedDays) * 100) : 0,
        ];
    }

    protected function taskStatusChart(Builder $taskQuery): array
    {
        $labels = [
            'pending' => 'Pendientes',
            'in_progress' => 'En curso',
            'completed' => 'Completadas',
            'rejected' => 'Rechazadas',
            'in_review' => 'En revisión',
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

    protected function pendingEvaluationsCount(Builder $internQuery): int
    {
        $monthStart = Carbon::today()->startOfMonth();

        return (clone $internQuery)
            ->where('status', 'active')
            ->whereDoesntHave('evaluations', function (Builder $query) use ($monthStart) {
                $query->where(fn (Builder $dateQuery) => $dateQuery
                    ->whereDate('evaluated_at', '>=', $monthStart)
                    ->orWhereDate('created_at', '>=', $monthStart));
            })
            ->count();
    }

    protected function upcomingEndingsCount(Builder $internQuery): int
    {
        return (clone $internQuery)
            ->where('status', 'active')
            ->whereBetween('end_date', [Carbon::today(), Carbon::today()->addDays(30)])
            ->count();
    }

    protected function averageTaskResolutionDays(Builder $taskQuery): ?float
    {
        $durations = (clone $taskQuery)
            ->where('status', 'completed')
            ->whereNotNull('completed_at')
            ->get(['created_at', 'completed_at'])
            ->map(fn (Task $task) => $task->created_at->floatDiffInDays($task->completed_at));

        if ($durations->isEmpty()) {
            return null;
        }

        return round((float) $durations->avg(), 1);
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
