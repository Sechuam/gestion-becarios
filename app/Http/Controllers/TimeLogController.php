<?php

namespace App\Http\Controllers;

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
        $canEdit   = $user->can('edit time logs') || $user->can('validate time logs');

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
            'today_logs' => $todayLogs->map(fn(TimeLog $log) => [
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
            'manageable_interns' => $manageableInterns->map(fn(Intern $intern) => [
                'id' => $intern->id,
                'user_id' => $intern->user_id,
                'name' => $intern->user->name,
                'avatar' => $intern->user->getFirstMediaUrl('avatar'),
                'education_center' => $intern->educationCenter?->name,
            ])->values(),
            'non_compliant_interns' => $service->getNonCompliantInternsForUser($user),
            'absences' => $user->absences()->latest('date')->get()->map(fn($absence) => [
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

        if (!$log) {
            return back()->with('error', 'No has registrado la entrada hoy.');
        }

        $now = Carbon::now();
        $clockInTime = Carbon::createFromFormat('Y-m-d H:i:s', $today->format('Y-m-d') . ' ' . $log->clock_in);
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

        if (!$validated['clock_in'] && !$validated['clock_out']) {
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

        // 1. Procesar fichajes (como ya teníamos)
        foreach ($logs as $log) {
            if ($log->clock_in) {
                $events[] = [
                    'id' => 'in_' . $log->id,
                    'title' => 'Entrada',
                    'start' => $log->date->format('Y-m-d') . 'T' . $log->clock_in,
                    'color' => '#10b981',
                ];
            }
            if ($log->clock_out) {
                $events[] = [
                    'id' => 'out_' . $log->id,
                    'title' => 'Salida',
                    'start' => $log->date->format('Y-m-d') . 'T' . $log->clock_out,
                    'color' => '#f43f5e',
                ];
            }
        }

        foreach ($absences as $abs) {
            $color = '#f59e0b';
            $title = "Ausencia ({$abs->reason}) - Pendiente";

            if ($abs->status === 'approved') {
                $color = '#10b981';
                $title = "Ausencia ({$abs->reason}) - Aprobada";
            } else if ($abs->status === 'rejected') {
                $color = '#ef4444';
                $title = "Ausencia ({$abs->reason}) - Denegada";
            }

            $events[] = [
                'id' => 'abs_' . $abs->id,
                'title' => $title,
                'start' => $abs->date->format('Y-m-d'),
                'allDay' => true,
                'color' => $color,
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

        // Tutor con permiso: solo sus becarios asignados
        if ($user->isTutor() && $hasPermission && $intern->company_tutor_user_id === $user->id) {
            return;
        }

        // Usuario con solo el permiso (sin ser admin/tutor): solo sus becarios asignados
        if ($hasPermission && $user->assignedInterns()->where('id', $intern->id)->exists()) {
            return;
        }

        abort(403);
    }

}
