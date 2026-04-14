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

        Timelog::create([
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

}
