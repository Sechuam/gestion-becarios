<?php

namespace App\Http\Controllers;

use App\Models\Intern;
use App\Models\Schedule;
use Illuminate\Http\Request;

class ScheduleController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'name' => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'monday_hours' => 'numeric|min:0|max:24',
            'tuesday_hours' => 'numeric|min:0|max:24',
            'wednesday_hours' => 'numeric|min:0|max:24',
            'thursday_hours' => 'numeric|min:0|max:24',
            'friday_hours' => 'numeric|min:0|max:24',
            'saturday_hours' => 'numeric|min:0|max:24',
            'sunday_hours' => 'numeric|min:0|max:24',
        ]);

        $this->authorizeScheduleManagement($request->user(), (int) $validated['user_id']);
        Schedule::create($validated);

        return back()->with('success', 'Horario asignado al becario correctamente.');
    }
    public function update(Request $request, Schedule $schedule)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'monday_hours' => 'numeric|min:0|max:24',
            'tuesday_hours' => 'numeric|min:0|max:24',
            'wednesday_hours' => 'numeric|min:0|max:24',
            'thursday_hours' => 'numeric|min:0|max:24',
            'friday_hours' => 'numeric|min:0|max:24',
            'saturday_hours' => 'numeric|min:0|max:24',
            'sunday_hours' => 'numeric|min:0|max:24',
        ]);

        $this->authorizeScheduleManagement($request->user(), (int) $schedule->user_id);
        $schedule->update($validated);

        return back()->with('success', 'Horario actualizado correctamente.');
    }
    public function destroy(Schedule $schedule)
    {
        $this->authorizeScheduleManagement(request()->user(), (int) $schedule->user_id);
        $schedule->delete();

        return back()->with('success', 'Horario eliminado correctamente.');
    }

    protected function authorizeScheduleManagement($user, int $userId): void
    {
        $intern = Intern::where('user_id', $userId)->first();

        abort_unless(
            $user->can('manage interns')
                || ($user->isTutor() && $intern && $intern->company_tutor_user_id === $user->id),
            403
        );
    }
}
