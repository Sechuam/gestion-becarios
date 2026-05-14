<?php

namespace App\Http\Controllers;

use App\Models\CalendarEvent;
use Illuminate\Http\Request;

class CalendarEventController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string|max:2000',
            'start_date'  => 'required|date',
            'end_date'    => 'nullable|date|after_or_equal:start_date',
            'start_time'  => 'nullable|date_format:H:i',
            'end_time'    => 'nullable|date_format:H:i',
            'all_day'     => 'boolean',
            'color'       => 'nullable|string|max:20',
            'attendee_ids' => 'nullable|array',
            'attendee_ids.*' => 'exists:users,id',
        ]);

        $event = CalendarEvent::create([
            'user_id'     => $request->user()->id,
            'title'       => $validated['title'],
            'description' => $validated['description'],
            'start_date'  => $validated['start_date'],
            'end_date'    => $validated['end_date'],
            'start_time'  => $validated['start_time'],
            'end_time'    => $validated['end_time'],
            'all_day'     => $validated['all_day'] ?? false,
            'color'       => $validated['color'],
        ]);

        if (!empty($validated['attendee_ids'])) {
            $event->attendees()->sync($validated['attendee_ids']);
        }

        return back();
    }

    public function update(Request $request, CalendarEvent $calendarEvent)
    {
        abort_if($calendarEvent->user_id !== $request->user()->id, 403);

        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string|max:2000',
            'start_date'  => 'required|date',
            'end_date'    => 'nullable|date|after_or_equal:start_date',
            'start_time'  => 'nullable|date_format:H:i',
            'end_time'    => 'nullable|date_format:H:i',
            'all_day'     => 'boolean',
            'color'       => 'nullable|string|max:20',
            'attendee_ids' => 'nullable|array',
            'attendee_ids.*' => 'exists:users,id',
        ]);

        $calendarEvent->update([
            'title'       => $validated['title'],
            'description' => $validated['description'],
            'start_date'  => $validated['start_date'],
            'end_date'    => $validated['end_date'],
            'start_time'  => $validated['start_time'],
            'end_time'    => $validated['end_time'],
            'all_day'     => $validated['all_day'] ?? false,
            'color'       => $validated['color'],
        ]);

        $calendarEvent->attendees()->sync($validated['attendee_ids'] ?? []);

        return back();
    }

    public function destroy(Request $request, CalendarEvent $calendarEvent)
    {
        abort_if($calendarEvent->user_id !== $request->user()->id, 403);

        $calendarEvent->delete();

        return back();
    }
}
