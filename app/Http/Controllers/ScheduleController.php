<?php

namespace App\Http\Controllers;

use App\Models\Intern;
use App\Models\Schedule;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

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
        $this->ensureNoScheduleOverlap(
            (int) $validated['user_id'],
            $validated['start_date'],
            $validated['end_date'] ?? null,
        );
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
        $this->ensureNoScheduleOverlap(
            (int) $schedule->user_id,
            $validated['start_date'],
            $validated['end_date'] ?? null,
            $schedule->id,
        );
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

    protected function ensureNoScheduleOverlap(
        int $userId,
        string $startDate,
        ?string $endDate,
        ?int $ignoreScheduleId = null,
    ): void {
        $start = Carbon::parse($startDate)->startOfDay();
        $end = $endDate ? Carbon::parse($endDate)->endOfDay() : null;

        $query = Schedule::query()
            ->where('user_id', $userId)
            ->when($ignoreScheduleId, fn($builder) => $builder->where('id', '!=', $ignoreScheduleId));

        $hasOverlap = $query->get()->contains(function (Schedule $schedule) use ($start, $end) {
            $existingStart = $schedule->start_date->copy()->startOfDay();
            $existingEnd = $schedule->end_date?->copy()->endOfDay();

            return $start->lte($existingEnd ?? Carbon::maxValue())
                && ($end ?? Carbon::maxValue())->gte($existingStart);
        });

        if ($hasOverlap) {
            throw ValidationException::withMessages([
                'start_date' => 'Ya existe un horario activo en parte de ese periodo.',
            ]);
        }
    }
}
