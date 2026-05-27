<?php

namespace App\Http\Controllers;

use App\Models\Absence;
use App\Models\CalendarEvent;
use App\Models\EducationCenter;
use App\Models\Intern;
use App\Models\Schedule;
use App\Models\Task;
use App\Models\TimeLog;
use App\Models\User;
use App\Support\DashboardCache;
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

        $data = Cache::remember(DashboardCache::key($user, $role), now()->addMinutes(5), function () use ($user, $role) {
            $internQuery = $this->scopedInternQuery($user, $role);
            $internIds = (clone $internQuery)->pluck('interns.id');
            $userIds = (clone $internQuery)->pluck('interns.user_id');

            $taskQuery = Task::query()
                ->when(!$user->isAdmin(), function (Builder $query) use ($internIds, $user) {
                    if ($user->isTutor()) {
                        $query->where('created_by', $user->id)
                            ->orWhereHas('interns', fn(Builder $interns) => $interns->whereIn('interns.id', $internIds));

                        return;
                    }

                    $query->whereHas('interns', fn(Builder $interns) => $interns->whereIn('interns.id', $internIds));
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
                'attendance_chart' => $role === 'intern' ? $this->attendanceChart($userIds) : [],
                'task_status_chart' => $this->taskStatusChart($taskQuery),
                'task_progress' => $this->taskProgress($internQuery),
                'alerts' => [
                    ['label' => 'Ausencias pendientes', 'value' => $pendingAbsences, 'tone' => 'warning'],
                    ['label' => 'Jornadas abiertas hoy', 'value' => $openTimeLogs, 'tone' => 'info'],
                    ['label' => 'Tareas sin completar', 'value' => max(0, $totalTasks - $completedTasks), 'tone' => 'danger'],
                ],
            ];
        });

        // Datos en tiempo real para la agenda de hoy
        $today = Carbon::today();
        
        // 1. Jornada activa hoy
        $currentLog = $role === 'intern'
            ? TimeLog::where('user_id', $user->id)
                ->whereDate('date', $today)
                ->whereNotNull('clock_in')
                ->whereNull('clock_out')
                ->first()
            : null;

        // 2. Eventos y Ausencias para hoy (Propios e Invitaciones)
        $todayEvents = CalendarEvent::with(['user', 'attendees'])
            ->where(function($query) use ($user) {
                $query->where('user_id', $user->id)
                      ->orWhereHas('attendees', fn($q) => $q->where('users.id', $user->id));
            })
            ->whereDate('start_date', '<=', $today)
            ->whereDate('end_date', '>=', $today)
            ->get()
            ->map(fn($e) => [
                'type' => 'event',
                'title' => $e->title,
                'creator' => $e->user_id !== $user->id ? $e->user->name : null,
                'time' => $e->all_day ? 'Todo el día' : ($e->start_time . ($e->end_time ? ' - ' . $e->end_time : '')),
                'color' => $e->color ?? '#3b82f6'
            ]);

        $todayAbsences = Absence::where('user_id', $user->id)
            ->whereDate('date', $today)
            ->where('status', 'approved')
            ->get()
            ->map(fn($a) => [
                'type' => 'absence',
                'title' => 'Ausencia: ' . $a->reason,
                'time' => 'Todo el día',
                'color' => '#f59e0b'
            ]);

        $data['today_agenda'] = $todayEvents->concat($todayAbsences);
        $data['current_log'] = $currentLog ? [
            'clock_in' => $currentLog->clock_in,
            'today_logged_hours' => (float) TimeLog::where('user_id', $user->id)
                ->whereDate('date', $today)
                ->whereNotNull('clock_out')
                ->sum('total_hours'),
            'elapsed_seconds' => Carbon::parse($currentLog->clock_in)->diffInSeconds(now())
        ] : null;
        $data['manageable_interns'] = $role === 'admin' || $role === 'tutor'
            ? $this->eventManageableInterns($user, $role)
            : [];
        $data['manageable_tutors'] = $role === 'admin' || $role === 'tutor'
            ? $this->eventManageableTutors($user)
            : [];

        return Inertia::render('dashboard/Index', $data);
    }

    protected function scopedInternQuery(User $user, string $role): Builder
    {
        return Intern::query()
            ->with(['user', 'educationCenter'])
            ->when($role === 'tutor' || $user->isTutor(), fn(Builder $query) => $query->where('company_tutor_user_id', $user->id))
            ->when($role === 'intern' || $user->isIntern(), fn(Builder $query) => $query->where('user_id', $user->id));
    }

    protected function activeCentersCount(Builder $internQuery, User $user): int
    {
        if ($user->isAdmin()) {
            return EducationCenter::count();
        }

        return (clone $internQuery)->distinct('education_center_id')->count('education_center_id');
    }

    protected function eventManageableInterns(User $user, string $role): array
    {
        return $this->scopedInternQuery($user, $role)
            ->where('status', 'active')
            ->orderBy('start_date')
            ->get()
            ->map(fn(Intern $intern) => [
                'id' => $intern->id,
                'user_id' => $intern->user_id,
                'name' => $intern->user->name,
                'avatar' => $intern->user->getFirstMediaUrl('avatar'),
                'education_center' => $intern->educationCenter?->name,
            ])
            ->values()
            ->all();
    }

    protected function eventManageableTutors(User $user): array
    {
        return User::query()
            ->role('tutor')
            ->whereKeyNot($user->id)
            ->orderBy('name')
            ->get(['id', 'name', 'email'])
            ->map(fn(User $tutor) => [
                'id' => $tutor->id,
                'user_id' => $tutor->id,
                'name' => $tutor->name,
                'email' => $tutor->email,
            ])
            ->values()
            ->all();
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
            ->map(fn($row) => ['name' => $row->center, 'becarios' => (int) $row->total])
            ->values()
            ->all();
    }

    protected function attendanceChart(Collection $userIds): array
    {
        $start = Carbon::today()->subDays(29);
        $end = now();

        $rows = TimeLog::query()
            ->selectRaw('date, ROUND(SUM(total_hours), 2) as hours')
            ->whereIn('user_id', $userIds)
            ->whereBetween('date', [$start, $end])
            ->groupBy('date')
            ->pluck('hours', 'date');

        $weekdayLabels = [
            1 => 'L',
            2 => 'M',
            3 => 'M',
            4 => 'J',
            5 => 'V',
            6 => 'S',
            7 => 'D',
        ];

        return collect(range(0, 29))
            ->map(function ($offset) use ($start, $rows, $weekdayLabels) {
                $date = $start->copy()->addDays($offset);

                return [
                    'day' => $weekdayLabels[$date->dayOfWeekIso],
                    'date' => $date->format('d/m'),
                    'iso_date' => $date->format('Y-m-d'),
                    'horas' => (float) ($rows[$date->format('Y-m-d')] ?? 0),
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
            ->where(fn(Builder $query) => $query->whereNull('end_date')->orWhereDate('end_date', '>=', $start))
            ->orderByDesc('start_date')
            ->get()
            ->groupBy('user_id');

        $timeLogsByDay = TimeLog::query()
            ->whereIn('user_id', $userIds)
            ->whereBetween('date', [$start, $end])
            ->get(['user_id', 'date', 'total_hours', 'clock_in'])
            ->groupBy(fn(TimeLog $log) => $log->user_id . '|' . $log->date->format('Y-m-d'));
        $workedHours = $timeLogsByDay->map(fn(Collection $logs) => (float) $logs->sum('total_hours'));

        $expectedDays = 0;
        $completeDays = 0;
        $delays = [];

        foreach ($userIds as $userId) {
            for ($date = $start->copy(); $date->lte($end); $date->addDay()) {
                $schedule = ($schedules[$userId] ?? collect())->first(function (Schedule $schedule) use ($date) {
                    return $schedule->start_date->lte($date)
                        && (!$schedule->end_date || $schedule->end_date->gte($date));
                });

                if (!$schedule) {
                    continue;
                }

                $dayName = strtolower($date->format('l'));
                $entryField = "{$dayName}_entry_time";
                $expectedEntryTime = $schedule->$entryField;

                if ($expectedEntryTime) {
                    $logsToday = $timeLogsByDay[$userId . '|' . $date->format('Y-m-d')] ?? collect();
                    $firstClockIn = $logsToday->whereNotNull('clock_in')->sortBy('clock_in')->first()?->clock_in;

                    if ($firstClockIn) {
                        $actual = Carbon::parse($date->format('Y-m-d') . ' ' . $firstClockIn);
                        $scheduled = Carbon::parse($date->format('Y-m-d') . ' ' . $expectedEntryTime);

                        if ($actual->gt($scheduled)) {
                            $delays[] = $actual->diffInMinutes($scheduled);
                        } else {
                            $delays[] = 0;
                        }
                    }
                }

                $expectedHours = (float) ($schedule->{$weekdayColumns[$dayName]} ?? 0);
                if ($expectedHours <= 0) {
                    continue;
                }

                $expectedDays++;
                $worked = $workedHours[$userId . '|' . $date->format('Y-m-d')] ?? 0;

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
            'average_delay_minutes' => count($delays) > 0 ? (int) round(array_sum($delays) / count($delays)) : 0,
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
            ->map(fn($row) => [
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
                $query->where(fn(Builder $dateQuery) => $dateQuery
                    ->whereDate('evaluated_at', '>=', $monthStart)
                    ->orWhereDate('created_at', '>=', $monthStart));
            })
            ->count();
    }

    protected function upcomingEndingsCount(Builder $internQuery): int
    {
        return (clone $internQuery)
            ->where('status', 'active')
            ->whereBetween('end_date', [Carbon::today(), Carbon::today()->addDays(7)])
            ->count();
    }

    protected function averageTaskResolutionDays(Builder $taskQuery): ?float
    {
        $durations = (clone $taskQuery)
            ->where('status', 'completed')
            ->whereNotNull('completed_at')
            ->get(['created_at', 'completed_at'])
            ->map(fn(Task $task) => $task->created_at->diffInDays($task->completed_at));

        if ($durations->isEmpty()) {
            return null;
        }

        return round((float) $durations->avg(), 1);
    }

    protected function taskProgress(Builder $internQuery): array
    {
        $interns = (clone $internQuery)
            ->select('interns.*')
            ->addSelect([
                'worked_hours' => TimeLog::query()
                    ->selectRaw('COALESCE(SUM(total_hours), 0)')
                    ->whereColumn('time_logs.user_id', 'interns.user_id'),
            ])
            ->withCount([
                'evaluations',
                'tasks',
                'tasks as completed_tasks' => fn(Builder $query) => $query->where('status', 'completed'),
            ])
            ->with(['user', 'educationCenter'])
            ->orderByDesc('updated_at')
            ->get();

        $userIds = $interns->pluck('user_id');
        $start = Carbon::today()->subDays(29);
        $end = Carbon::today();

        $schedules = Schedule::query()
            ->whereIn('user_id', $userIds)
            ->whereDate('start_date', '<=', $end)
            ->where(fn(Builder $query) => $query->whereNull('end_date')->orWhereDate('end_date', '>=', $start))
            ->get()
            ->groupBy('user_id');

        $timeLogs = TimeLog::query()
            ->whereIn('user_id', $userIds)
            ->whereBetween('date', [$start, $end])
            ->whereNotNull('clock_in')
            ->get(['user_id', 'date', 'clock_in'])
            ->groupBy('user_id');

        return $interns->map(function (Intern $intern) use ($schedules, $timeLogs, $start, $end) {
            $totalTasks = (int) $intern->tasks_count;
            $completedTasks = (int) $intern->completed_tasks;

            // Calcular retraso medio para este becario específico
            $userDelays = [];
            $userSchedules = $schedules[$intern->user_id] ?? collect();
            $userLogs = ($timeLogs[$intern->user_id] ?? collect())->groupBy(fn($log) => $log->date->format('Y-m-d'));

            for ($date = $start->copy(); $date->lte($end); $date->addDay()) {
                $schedule = $userSchedules->first(function (Schedule $s) use ($date) {
                    return $s->start_date->lte($date) && (!$s->end_date || $s->end_date->gte($date));
                });

                if (!$schedule)
                    continue;

                $dayName = strtolower($date->format('l'));
                $entryTime = $schedule->{"{$dayName}_entry_time"};

                if ($entryTime) {
                    $log = ($userLogs[$date->format('Y-m-d')] ?? collect())->sortBy('clock_in')->first();
                    if ($log && $log->clock_in) {
                        $actual = Carbon::parse($date->format('Y-m-d') . ' ' . $log->clock_in);
                        $scheduled = Carbon::parse($date->format('Y-m-d') . ' ' . $entryTime);
                        $userDelays[] = $actual->gt($scheduled) ? $actual->diffInMinutes($scheduled) : 0;
                    }
                }
            }

            return [
                'id' => $intern->id,
                'name' => $intern->user?->name ?? 'Sin usuario',
                'center' => $intern->educationCenter?->name ?? 'Sin centro',
                'completed' => $completedTasks,
                'total' => $totalTasks,
                'progress' => $totalTasks > 0 ? (int) round(($completedTasks / $totalTasks) * 100) : 0,
                'hours' => round((float) $intern->worked_hours, 1),
                'average_delay' => count($userDelays) > 0 ? (int) round(array_sum($userDelays) / count($userDelays)) : 0,
            ];
        })->values()->all();
    }
}
