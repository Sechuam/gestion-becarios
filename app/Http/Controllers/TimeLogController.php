<?php

namespace App\Http\Controllers;

use App\Models\TimeLog;
use Illuminate\Http\Request;
use Carbon\Carbon;

class TimeLogController extends Controller
{
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
        $totalHours = $clockInTime->diffInHours($now) / 60;

        $log->update([
            'clock_out' => $now->format('H:i:s'),
            'total_hours' => round($totalHours, 2),
        ]);

        return back()->with('success', 'Salida registrada correctamente.');
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


}
