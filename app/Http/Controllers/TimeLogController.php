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
        $todayLog = $user->timeLogs()
            ->whereDate('date', $today)
            ->first();

        $manageableInterns = collect();

        if ($user->can('manage interns')) {
            $manageableInterns = Intern::query()
                ->with(['user', 'educationCenter'])
                ->where('status', 'active')
                ->orderBy('start_date')
                ->get();
        } elseif ($user->isTutor()) {
            $manageableInterns = $user->assignedInterns()
                ->with(['user', 'educationCenter'])
                ->where('status', 'active')
                ->orderBy('start_date')
                ->get();
        }

        return Inertia::render('attendance/index', [
            'today_log' => $todayLog ? [
                'date' => $todayLog->date->format('Y-m-d'),
                'clock_in' => $todayLog->clock_in,
                'clock_out' => $todayLog->clock_out,
                'total_hours' => $todayLog->total_hours,
                'notes' => $todayLog->notes,
            ] : null,
            'can_manage_attendance' => $user->can('manage interns') || $user->isTutor(),
            'manageable_interns' => $manageableInterns->map(fn(Intern $intern) => [
                'id' => $intern->id,
                'user_id' => $intern->user_id,
                'name' => $intern->user->name,
                'education_center' => $intern->educationCenter?->name,
            ])->values(),
            'non_compliant_interns' => $service->getNonCompliantInternsForUser($user),
        ]);
    }

    public function clockIn(Request $request)
    {
        $user = $request->user();
        $today = Carbon::today();
        $existingLog = TimeLog::where("user_id", $user->id)
            ->where('date', $today)
            ->first();

        if ($existingLog) {
            return back()->with('error', 'Ya has fichado la entrada hoy');
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
            ->where('date', $today)
            ->first();

        if (!$log) {
            return back()->with('error', 'No has registrado la entrada hoy.');
        }

        if ($log->clock_out) {
            return back()->with('error', 'Ya has registrado la salida hoy.');
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

        if (! $validated['clock_in'] && ! $validated['clock_out']) {
            return back()->with('error', 'Debes indicar al menos una hora de entrada o de salida.');
        }

        $intern = Intern::with('user')->findOrFail($validated['intern_id']);
        $this->authorizeAttendanceManagement($request->user(), $intern);

        $log = TimeLog::firstOrNew([
            'user_id' => $intern->user_id,
            'date' => $validated['date'],
        ]);

        $log->fill([
            'clock_in' => $validated['clock_in'] ?? $log->clock_in,
            'clock_out' => $validated['clock_out'] ?? $log->clock_out,
            'notes' => $validated['notes'] ?? $log->notes,
            'tutor_user_id' => $request->user()->id,
        ]);

        if ($log->clock_in && $log->clock_out) {
            $clockIn = Carbon::createFromFormat('Y-m-d H:i:s', "{$validated['date']} {$log->clock_in}:00");
            $clockOut = Carbon::createFromFormat('Y-m-d H:i:s', "{$validated['date']} {$log->clock_out}:00");
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
        abort_unless(
            $user->can('manage interns') || ($user->isTutor() && $intern->company_tutor_user_id === $user->id),
            403
        );
    }

}
