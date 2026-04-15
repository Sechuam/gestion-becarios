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
            'justification_file' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ]);

        $user = $request->user();

        $absence = Absence::create([
            'user_id' => $user->id,
            'date' => $validated['date'],
            'reason' => $validated['reason'],
            'status' => 'pending',
        ]);

        if ($request->hasFile('justification_file')) {
            $absence->addMediaFromRequest('justification_file')->toMediaCollection('justifications');
        }

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

        $intern = $absence->user?->intern;
        abort_unless(
            $request->user()->can('manage interns')
                || ($request->user()->isTutor() && $intern && $intern->company_tutor_user_id === $request->user()->id),
            403
        );

        $absence->update([
            'status' => $validated['status'],
            'approved_by' => $request->user()->id,
        ]);

        $request->user()->unreadNotifications
            ->where('data.absence_id', $absence->id)
            ->markAsRead();


        return back()->with('success', 'Estado de la ausencia actualizado.');
    }
}
