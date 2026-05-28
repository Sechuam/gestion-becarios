<?php

namespace App\Http\Controllers;

use App\Models\Absence;
use App\Notifications\AbsenceRequested;
use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\Facades\Log;
use Throwable;

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
        $isStaff = $user->isStaff();

        $absence = Absence::create([
            'user_id' => $user->id,
            'date' => $validated['date'],
            'reason' => $validated['reason'],
            'status' => $isStaff ? 'approved' : 'pending',
            'approved_by' => $isStaff ? $user->id : null,
        ]);

        if ($request->hasFile('justification_file')) {
            $absence->addMediaFromRequest('justification_file')->toMediaCollection('justifications');
        }

        if (!$isStaff && $user->intern && $user->intern->companyTutor) {
            try {
                $user->intern->companyTutor->notify(new AbsenceRequested($absence));
            } catch (Throwable $exception) {
                Log::warning('No se pudo notificar la solicitud de ausencia.', [
                    'absence_id' => $absence->id,
                    'tutor_user_id' => $user->intern->companyTutor->id,
                    'error' => $exception->getMessage(),
                ]);
            }
        }

        $message = $isStaff
            ? 'Ausencia registrada correctamente.'
            : 'Solicitud de ausencia enviada correctamente al tutor.';

        return back()->with('success', $message);
    }

    public function updateStatus(Request $request, Absence $absence)
    {
        $validated = $request->validate([
            'status' => 'required|in:approved,rejected',
        ]);

        $this->authorizeAbsenceManagement($request, $absence);

        $absence->update([
            'status' => $validated['status'],
            'approved_by' => $request->user()->id,
        ]);

        $request->user()->unreadNotifications
            ->where('data.absence_id', $absence->id)
            ->markAsRead();


        return back()->with('success', 'Estado de la ausencia actualizado.');
    }

    public function destroy(Request $request, Absence $absence)
    {
        $this->authorizeAbsenceManagement($request, $absence);

        DatabaseNotification::query()
            ->where('type', AbsenceRequested::class)
            ->where(function ($query) use ($absence) {
                $query
                    ->where('data', 'like', '%"absence_id":'.$absence->id.',%')
                    ->orWhere('data', 'like', '%"absence_id":'.$absence->id.'}%')
                    ->orWhere('data', 'like', '%"absence_id": '.$absence->id.',%')
                    ->orWhere('data', 'like', '%"absence_id": '.$absence->id.'}%');
            })
            ->delete();

        $absence->delete();

        return back()->with('success', 'Ausencia cancelada correctamente.');
    }

    public function uploadJustification(Request $request, Absence $absence)
    {
        $request->validate([
            'justification_file' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ]);

        abort_unless($request->user()->id === $absence->user_id, 403);

        if ($request->hasFile('justification_file')) {
            // Eliminar justificantes anteriores si existieran (opcional, Spatie lo gestiona si usamos la misma colección)
            $absence->clearMediaCollection('justifications');
            $absence->addMediaFromRequest('justification_file')->toMediaCollection('justifications');
        }

        return back()->with('success', 'Justificante subido correctamente.');
    }

    protected function authorizeAbsenceManagement(Request $request, Absence $absence): void
    {
        $intern = $absence->user?->intern;
        $hasPermission = $request->user()->can('validate time logs') || $request->user()->can('manage interns');
        $isAssignedTutor = $request->user()->isTutor()
            && $intern
            && (int) $intern->company_tutor_user_id === (int) $request->user()->id;

        abort_unless(
            ($hasPermission && $request->user()->isAdmin()) || $isAssignedTutor,
            403
        );
    }
}
