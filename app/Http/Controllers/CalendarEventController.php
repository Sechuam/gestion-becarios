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
        ]);

        $event = CalendarEvent::create([
            ...$validated,
            'user_id' => $request->user()->id,
        ]);

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
        ]);

        $calendarEvent->update($validated);

        return back();
    }

    public function destroy(Request $request, CalendarEvent $calendarEvent)
    {
        abort_if($calendarEvent->user_id !== $request->user()->id, 403);

        $calendarEvent->delete();

        return back();
    }
}
