<?php

namespace App\Http\Controllers;

use App\Models\Absence;
use App\Notifications\AbsenceRequested;
use Illuminate\Http\Request;

class AbsenceController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'reason' => 'required|string|max:255',
        ]);

        $user = $request->user();

        $absence = Absence::create([
            'user_id' => $user->id,
            'date' => $validated['date'],
            'reason' => $validated['reason'],
            'status' => 'pending',
        ]);

        if ($user->intern && $user->intern->companyTutor) {
            $user->intern->companyTutor->notify(new AbsenceRequested($absence));
        }

        return back()->with('success', 'Solicitud de ausencia enviada correctamente al tutor.');
    }

    public function updateStatus(Request $request, Absence $absence)
    {
        $validated = $request->validate([
            'status' => 'required|in:approved,rejected',
        ]);

        $absence->update([
            'status' => $validated['status'],
            'approved_by' => $request->user()->id,
        ]);

        return back()->with('success', 'Estado de la ausencia actualizado.');
    }
}

