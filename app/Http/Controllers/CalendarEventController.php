<?php

namespace App\Http\Controllers;

use App\Models\CalendarEvent;
use App\Models\User;
use App\Notifications\AppAlert;
use Illuminate\Http\Request;

class CalendarEventController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:2000',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'start_time' => 'nullable|date_format:H:i',
            'end_time' => 'nullable|date_format:H:i',
            'all_day' => 'boolean',
            'color' => 'nullable|string|max:20',
            'attendee_ids' => 'nullable|array',
            'attendee_ids.*' => 'exists:users,id',
        ]);

        $event = CalendarEvent::create([
            'user_id' => $request->user()->id,
            'title' => $validated['title'],
            'description' => $validated['description'],
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'start_time' => $validated['start_time'],
            'end_time' => $validated['end_time'],
            'all_day' => $validated['all_day'] ?? false,
            'color' => $validated['color'],
        ]);

        if (! empty($validated['attendee_ids'])) {
            $event->attendees()->sync(
                collect($validated['attendee_ids'])
                    ->mapWithKeys(fn ($id) => [$id => ['attendance_status' => 'pending']])
                    ->all()
            );
        }

        $this->notifyEventAttendees($event, 'calendar_event_created', 'Nuevo evento', "Te han incluido en el evento \"{$event->title}\".", $request->user());

        return back();
    }

    public function update(Request $request, CalendarEvent $calendarEvent)
    {
        abort_if($calendarEvent->user_id !== $request->user()->id, 403);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:2000',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'start_time' => 'nullable|date_format:H:i',
            'end_time' => 'nullable|date_format:H:i',
            'all_day' => 'boolean',
            'color' => 'nullable|string|max:20',
            'attendee_ids' => 'nullable|array',
            'attendee_ids.*' => 'exists:users,id',
        ]);

        $calendarEvent->update([
            'title' => $validated['title'],
            'description' => $validated['description'],
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'start_time' => $validated['start_time'],
            'end_time' => $validated['end_time'],
            'all_day' => $validated['all_day'] ?? false,
            'color' => $validated['color'],
        ]);

        $currentStatuses = $calendarEvent->attendees()
            ->pluck('calendar_event_user.attendance_status', 'users.id');

        $calendarEvent->attendees()->sync(
            collect($validated['attendee_ids'] ?? [])
                ->mapWithKeys(fn ($id) => [
                    $id => ['attendance_status' => $currentStatuses[$id] ?? 'pending'],
                ])
                ->all()
        );

        $this->notifyEventAttendees($calendarEvent, 'calendar_event_updated', 'Evento actualizado', "Se ha actualizado el evento \"{$calendarEvent->title}\".", $request->user());

        return back();
    }

    public function destroy(Request $request, CalendarEvent $calendarEvent)
    {
        abort_if($calendarEvent->user_id !== $request->user()->id, 403);

        $calendarEvent->delete();

        return back();
    }

    public function updateAttendance(Request $request, CalendarEvent $calendarEvent)
    {
        $validated = $request->validate([
            'attendance_status' => 'required|in:accepted,rejected',
        ]);

        $userId = $request->user()->id;
        $isAttendee = $calendarEvent->attendees()
            ->where('users.id', $userId)
            ->exists();

        abort_unless($isAttendee, 403);

        $calendarEvent->attendees()->updateExistingPivot($userId, [
            'attendance_status' => $validated['attendance_status'],
        ]);

        return back()->with(
            'success',
            $validated['attendance_status'] === 'accepted'
                ? 'Has confirmado tu asistencia.'
                : 'Has rechazado la asistencia al evento.'
        );
    }

    protected function notifyEventAttendees(CalendarEvent $event, string $type, string $title, string $message, User $actor): void
    {
        $event->loadMissing('attendees');

        foreach ($event->attendees as $attendee) {
            if ((int) $attendee->id === (int) $actor->id) {
                continue;
            }

            $attendee->notify(new AppAlert(
                $type,
                $title,
                $message,
                route('dashboard', absolute: false),
                ['calendar_event_id' => $event->id],
            ));
        }
    }
}
