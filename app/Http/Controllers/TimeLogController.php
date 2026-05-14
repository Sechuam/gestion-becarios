<?php

namespace App\Http\Controllers;

use App\Models\CalendarEvent;
use App\Models\Intern;
use App\Models\TimeLog;
use App\Services\TimeTrackingService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TimeLogController extends Controller
{
    public function index(Request $request, TimeTrackingService $service)
    {
        $user = $request->user();
        $today = Carbon::today();
        $todayLogs = $user->timeLogs()
            ->whereDate('date', '=', $today->toDateString())
            ->orderBy('clock_in')
            ->get();

        $currentLog = $todayLogs->firstWhere('clock_out', null);
        $todayTotalHours = $todayLogs->sum(function ($log) {
            return (float) ($log->total_hours ?? 0);
        });

        $manageableInterns = collect();

        $canManage = $user->can('manage interns');
        $canEdit = $user->can('edit time logs') || $user->can('validate time logs');

        if ($canManage) {
            $manageableInterns = Intern::query()
                ->with(['user', 'educationCenter'])
                ->where('status', 'active')
                ->orderBy('start_date')
                ->get();
        } elseif ($user->isTutor() || $canEdit) {
            $manageableInterns = $user->assignedInterns()
                ->with(['user', 'educationCenter'])
                ->where('status', 'active')
                ->orderBy('start_date')
                ->get();
        }

        return Inertia::render('attendance/index', [
            'today_logs' => $todayLogs->map(fn (TimeLog $log) => [
                'id' => $log->id,
                'date' => $log->date->format('Y-m-d'),
                'clock_in' => $log->clock_in,
                'clock_out' => $log->clock_out,
                'total_hours' => $log->total_hours,
                'notes' => $log->notes,
            ])->values(),
            'current_log' => $currentLog ? [
                'id' => $currentLog->id,
                'date' => $currentLog->date->format('Y-m-d'),
                'clock_in' => $currentLog->clock_in,
                'clock_out' => $currentLog->clock_out,
                'total_hours' => $currentLog->total_hours,
                'notes' => $currentLog->notes,
            ] : null,
            'today_total_hours' => round($todayTotalHours, 2),
            'can_manage_attendance' => $user->can('manage interns') || $user->isTutor() || $user->can('edit time logs') || $user->can('validate time logs'),
            'manageable_interns' => $manageableInterns->map(fn (Intern $intern) => [
                'id' => $intern->id,
                'user_id' => $intern->user_id,
                'name' => $intern->user->name,
                'avatar' => $intern->user->getFirstMediaUrl('avatar'),
                'education_center' => $intern->educationCenter?->name,
            ])->values(),
            'non_compliant_interns' => $service->getNonCompliantInternsForUser($user),
            'absences' => $user->absences()->latest('date')->get()->map(fn ($absence) => [
                'id' => $absence->id,
                'date' => $absence->date->format('Y-m-d'),
                'reason' => $absence->reason,
                'status' => $absence->status,
                'justification_url' => $absence->getFirstMediaUrl('justifications'),
            ]),
        ]);
    }

    public function clockIn(Request $request)
    {
        $user = $request->user();
        $today = Carbon::today();
        $openLog = TimeLog::where('user_id', $user->id)
            ->whereDate('date', '=', $today->toDateString())
            ->whereNull('clock_out')
            ->first();

        if ($openLog) {
            return back()->with('error', 'Ya tienes una jornada abierta');
        }

        TimeLog::create([
            'user_id' => $user->id,
            'date' => $today,
            'clock_in' => Carbon::now()->format('H:i:s'),
        ]);

        return back()->with('success', 'Entrada registrada correctamente.');
    }

    public function clockOut(Request $request)
    {
        $user = $request->user();
        $today = Carbon::today();
        $log = TimeLog::where('user_id', $user->id)
            ->whereDate('date', '=', $today->toDateString())
            ->whereNull('clock_out')
            ->latest('id')
            ->first();

        if (! $log) {
            return back()->with('error', 'No has registrado la entrada hoy.');
        }

        $now = Carbon::now();
        $clockInTime = Carbon::createFromFormat('Y-m-d H:i:s', $today->format('Y-m-d').' '.$log->clock_in);
        $totalHours = $clockInTime->diffInMinutes($now) / 60;

        $log->update([
            'clock_out' => $now->format('H:i:s'),
            'total_hours' => round($totalHours, 2),
        ]);

        return back()->with('success', 'Salida registrada correctamente.');
    }

    public function storeManual(Request $request)
    {
        $validated = $request->validate([
            'intern_id' => 'required|exists:interns,id',
            'date' => 'required|date',
            'clock_in' => 'nullable|date_format:H:i',
            'clock_out' => 'nullable|date_format:H:i|after:clock_in',
            'notes' => 'nullable|string|max:1000',
        ]);

        if (! $validated['clock_in'] && ! $validated['clock_out']) {
            return back()->with('error', 'Debes indicar al menos una hora de entrada o de salida.');
        }

        $intern = Intern::with('user')->findOrFail($validated['intern_id']);
        $this->authorizeAttendanceManagement($request->user(), $intern);

        $log = TimeLog::firstOrNew([
            'user_id' => $intern->user_id,
            'date' => Carbon::parse($validated['date'])->toDateString(),
        ]);

        $log->fill([
            'clock_in' => isset($validated['clock_in']) && $validated['clock_in']
                ? "{$validated['clock_in']}:00"
                : $log->clock_in,
            'clock_out' => isset($validated['clock_out']) && $validated['clock_out']
                ? "{$validated['clock_out']}:00"
                : $log->clock_out,
            'notes' => $validated['notes'] ?? $log->notes,
            'tutor_user_id' => $request->user()->id,
        ]);

        if ($log->clock_in && $log->clock_out) {
            $clockIn = Carbon::createFromFormat('Y-m-d H:i:s', "{$validated['date']} {$log->clock_in}");
            $clockOut = Carbon::createFromFormat('Y-m-d H:i:s', "{$validated['date']} {$log->clock_out}");
            $log->total_hours = round($clockIn->diffInMinutes($clockOut) / 60, 2);
        } else {
            $log->total_hours = null;
        }

        $log->save();

        return back()->with('success', 'Registro manual guardado correctamente.');
    }

    public function getEvents(Request $request)
    {
        $user = $request->user();

        // Obtenemos Fichajes Y Ausencias
        $logs = TimeLog::where('user_id', $user->id)->get();
        $absences = \App\Models\Absence::where('user_id', $user->id)->get();

        $events = [];

        $absenceDates = $absences->filter(fn($abs) => $abs->status !== 'rejected')
            ->pluck('date')
            ->map(fn($d) => $d->format('Y-m-d'))
            ->toArray();

        // 1. Procesar fichajes (franja de tiempo)
        foreach ($logs as $log) {
            if ($log->clock_in) {
                $start = $log->date->format('Y-m-d').'T'.$log->clock_in;
                $end = null;

                if ($log->clock_out) {
                    $end = $log->date->format('Y-m-d').'T'.$log->clock_out;
                } elseif ($log->date->isToday()) {
                    $end = now()->format('Y-m-d\TH:i:s');
                }

                $isConflict = in_array($log->date->format('Y-m-d'), $absenceDates);
                $className = $isConflict ? 'is-jornada has-conflict' : 'is-jornada';

                $events[] = [
                    'id' => 'log_'.$log->id,
                    'title' => $isConflict ? 'Jornada (Conflicto)' : 'Jornada',
                    'start' => $start,
                    'end' => $end,
                    'className' => $className,
                ];
            }
        }

        foreach ($absences as $abs) {
            $color = '#f59e0b';
            $title = "Ausencia ({$abs->reason}) - Pendiente";
            $className = 'is-absence';

            if ($abs->status === 'approved') {
                $color = '#10b981';
                $title = "Ausencia ({$abs->reason}) - Aprobada";
            } elseif ($abs->status === 'rejected') {
                $color = '#ef4444';
                $title = "Ausencia ({$abs->reason}) - Denegada";
            }

            $events[] = [
                'id' => 'abs_'.$abs->id,
                'title' => $title,
                'start' => $abs->date->format('Y-m-d'),
                'allDay' => true,
                'color' => $color,
                'className' => $className,
            ];
        }

        // Resumen de horas diarias
        $logsByDate = $logs->groupBy(fn($log) => $log->date->format('Y-m-d'));
        foreach ($logsByDate as $date => $dayLogs) {
            $totalHours = $dayLogs->sum('total_hours');
            if ($totalHours > 0) {
                $hours = floor($totalHours);
                $minutes = round(($totalHours - $hours) * 60);
                $timeString = $hours . 'h ' . ($minutes > 0 ? $minutes . 'm' : '');
                
                $events[] = [
                    'id' => 'summary_'.$date,
                    'title' => '+ ' . trim($timeString),
                    'start' => $date,
                    'allDay' => true,
                    'className' => 'daily-summary-event',
                ];
            }
        }

        // 3. Procesar Eventos Personales
        $personalEvents = CalendarEvent::where('user_id', $user->id)->get();
        foreach ($personalEvents as $event) {
            $start = $event->start_date->format('Y-m-d');
            if (!$event->all_day && $event->start_time) {
                $start .= 'T' . $event->start_time;
            }

            $end = null;
            if ($event->end_date) {
                $end = $event->end_date->format('Y-m-d');
                if (!$event->all_day && $event->end_time) {
                    $end .= 'T' . $event->end_time;
                }
            }

            $events[] = [
                'id' => 'evt_'.$event->id,
                'title' => $event->title,
                'start' => $start,
                'end' => $end,
                'allDay' => $event->all_day,
                'backgroundColor' => $event->color,
                'borderColor' => $event->color,
                'className' => 'is-personal-event',
                'extendedProps' => [
                    'description' => $event->description,
                    'isPersonal' => true,
                ],
            ];
        }

        return response()->json($events);
    }

    protected function authorizeAttendanceManagement($user, Intern $intern): void
    {
        $hasPermission = $user->can('edit time logs') || $user->can('validate time logs') || $user->can('manage interns');

        // Admin con permiso: acceso a todos
        if ($user->isAdmin() && $hasPermission) {
            return;
        }

        // Tutor asignado: solo sus becarios vinculados
        if ($user->isTutor() && $intern->company_tutor_user_id === $user->id) {
            return;
        }

        // Usuario con solo el permiso (sin ser admin/tutor): solo sus becarios asignados
        if ($hasPermission && $user->assignedInterns()->where('id', $intern->id)->exists()) {
            return;
        }

        abort(403);
    }

    public function updateEvent(Request $request, TimeLog $timeLog)
    {
        $user = $request->user();
        
        $intern = Intern::where('user_id', $timeLog->user_id)->first();
        if ($intern) {
            $this->authorizeAttendanceManagement($user, $intern);
        } elseif (!$user->isStaff()) {
            abort(403); // If no intern profile, only staff can manage. Or if it's the user's own log? 
            // Wait, this is for drag & drop. Usually admins/tutors modify intern logs.
        }

        $validated = $request->validate([
            'start' => 'required|date',
            'end' => 'nullable|date',
        ]);

        $start = Carbon::parse($validated['start']);
        $timeLog->date = $start->copy()->startOfDay();
        $timeLog->clock_in = $start->format('H:i:s');

        if (!empty($validated['end'])) {
            $end = Carbon::parse($validated['end']);
            $timeLog->clock_out = $end->format('H:i:s');
            
            // Prevent end time before start time if they drop it weirdly (FullCalendar usually prevents this)
            if ($end->greaterThan($start)) {
                $timeLog->total_hours = round($start->diffInMinutes($end) / 60, 2);
            } else {
                $timeLog->total_hours = 0;
            }
        } else {
            $timeLog->clock_out = null;
            $timeLog->total_hours = null;
        }

        $timeLog->save();

        return response()->json(['success' => true]);
    }
}
