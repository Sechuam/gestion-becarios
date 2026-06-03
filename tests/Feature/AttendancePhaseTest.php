<?php

use App\Models\Absence;
use App\Models\EducationCenter;
use App\Models\Intern;
use App\Models\Schedule;
use App\Models\TimeLog;
use App\Models\User;
use App\Services\TimeTrackingService;
use Carbon\Carbon;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Role::findOrCreate('tutor');
    Role::findOrCreate('intern');
    Role::findOrCreate('admin');
    Permission::findOrCreate('manage interns');
});

it('allows interns to clock in and clock out for the current day', function () {
    Carbon::setTestNow('2026-04-14 09:00:00');

    $user = User::factory()->create();
    $user->assignRole('intern');

    $this->actingAs($user)
        ->post(route('time-logs.clock-in'))
        ->assertRedirect()
        ->assertSessionHas('success', 'Entrada registrada correctamente.');

    $log = TimeLog::where('user_id', $user->id)->firstOrFail();

    expect($log->date->toDateString())->toBe('2026-04-14')
        ->and($log->clock_in)->toBe('09:00:00')
        ->and($log->clock_out)->toBeNull();

    Carbon::setTestNow('2026-04-14 17:30:00');

    $this->actingAs($user)
        ->post(route('time-logs.clock-out'))
        ->assertRedirect()
        ->assertSessionHas('success', 'Salida registrada correctamente.');

    expect($log->fresh()->clock_out)->toBe('17:30:00')
        ->and((float) $log->fresh()->total_hours)->toBe(8.5);

    Carbon::setTestNow();
});

it('prevents interns from clocking in twice without clocking out', function () {
    Carbon::setTestNow('2026-04-14 09:00:00');

    $user = User::factory()->create();
    $user->assignRole('intern');

    TimeLog::create([
        'user_id' => $user->id,
        'date' => '2026-04-14',
        'clock_in' => '08:55:00',
    ]);

    $this->actingAs($user)
        ->post(route('time-logs.clock-in'))
        ->assertRedirect()
        ->assertSessionHas('error', 'Ya tienes una jornada abierta');

    expect(TimeLog::where('user_id', $user->id)->count())->toBe(1);

    Carbon::setTestNow();
});

it('prevents interns from clocking out without an open log', function () {
    Carbon::setTestNow('2026-04-14 17:00:00');

    $user = User::factory()->create();
    $user->assignRole('intern');

    $this->actingAs($user)
        ->post(route('time-logs.clock-out'))
        ->assertRedirect()
        ->assertSessionHas('error', 'No has registrado la entrada hoy.');

    Carbon::setTestNow();
});

it('allows an assigned tutor to create a manual time log for an intern', function () {
    $center = EducationCenter::factory()->create();
    $tutor = User::factory()->create();
    $tutor->assignRole('tutor');

    $internUser = User::factory()->create();
    $intern = Intern::factory()->create([
        'user_id' => $internUser->id,
        'education_center_id' => $center->id,
        'company_tutor_user_id' => $tutor->id,
        'start_date' => '2026-04-01',
        'end_date' => '2026-06-30',
        'status' => 'active',
        'total_hours' => 300,
    ]);

    $response = $this->actingAs($tutor)->post(route('time-logs.manual'), [
        'intern_id' => $intern->id,
        'date' => '2026-04-14',
        'clock_in' => '09:00',
        'clock_out' => '13:30',
        'notes' => 'Ajuste manual por incidencia',
    ]);

    $response->assertRedirect();

    $timeLog = TimeLog::query()
        ->where('user_id', $internUser->id)
        ->where('tutor_user_id', $tutor->id)
        ->first();

    expect($timeLog)->not->toBeNull()
        ->and($timeLog->date->toDateString())->toBe('2026-04-14')
        ->and($timeLog->clock_in)->toBe('09:00:00')
        ->and($timeLog->clock_out)->toBe('13:30:00')
        ->and($timeLog->notes)->toBe('Ajuste manual por incidencia')
        ->and((float) $timeLog->total_hours)->toBe(4.5);
});

it('prevents a tutor from approving absences for interns not assigned to them', function () {
    $center = EducationCenter::factory()->create();
    $assignedTutor = User::factory()->create();
    $assignedTutor->assignRole('tutor');

    $otherTutor = User::factory()->create();
    $otherTutor->assignRole('tutor');

    $internUser = User::factory()->create();
    Intern::factory()->create([
        'user_id' => $internUser->id,
        'education_center_id' => $center->id,
        'company_tutor_user_id' => $assignedTutor->id,
        'start_date' => '2026-04-01',
        'end_date' => '2026-06-30',
        'status' => 'active',
        'total_hours' => 300,
    ]);

    $absence = Absence::create([
        'user_id' => $internUser->id,
        'date' => '2026-04-14',
        'reason' => 'Examen',
        'status' => 'pending',
    ]);

    $this->actingAs($otherTutor)
        ->patch(route('absences.updateStatus', $absence), ['status' => 'approved'])
        ->assertForbidden();

    expect($absence->fresh()->status)->toBe('pending');
});

it('counts approved absences as justified hours inside the internship period', function () {
    Carbon::setTestNow('2026-04-14 12:00:00');

    $center = EducationCenter::factory()->create();
    $internUser = User::factory()->create();
    $intern = Intern::factory()->create([
        'user_id' => $internUser->id,
        'education_center_id' => $center->id,
        'start_date' => '2026-04-13',
        'end_date' => '2026-06-30',
        'status' => 'active',
        'total_hours' => 300,
    ]);

    Schedule::create([
        'user_id' => $internUser->id,
        'name' => 'Horario base',
        'start_date' => '2026-04-01',
        'monday_hours' => 8,
        'tuesday_hours' => 8,
        'wednesday_hours' => 8,
        'thursday_hours' => 8,
        'friday_hours' => 8,
        'saturday_hours' => 0,
        'sunday_hours' => 0,
    ]);

    TimeLog::create([
        'user_id' => $internUser->id,
        'date' => '2026-04-13',
        'clock_in' => '09:00:00',
        'clock_out' => '17:00:00',
        'total_hours' => 8,
    ]);

    Absence::create([
        'user_id' => $internUser->id,
        'date' => '2026-04-14',
        'reason' => 'Examen',
        'status' => 'approved',
    ]);

    $stats = app(TimeTrackingService::class)->getStats($intern->fresh('user'));

    expect($stats['expected_hours'])->toBe(16.0)
        ->and($stats['worked_hours'])->toBe(8.0)
        ->and($stats['justified_hours'])->toBe(8.0)
        ->and($stats['total_done'])->toBe(16.0)
        ->and($stats['debt'])->toBe(0.0)
        ->and($stats['is_non_compliant'])->toBeFalse();

    Carbon::setTestNow();
});

it('shows non-compliance alerts in the attendance module for tutors', function () {
    Carbon::setTestNow('2026-04-14 12:00:00');

    $center = EducationCenter::factory()->create();
    $tutor = User::factory()->create();
    $tutor->assignRole('tutor');

    $internUser = User::factory()->create();
    Intern::factory()->create([
        'user_id' => $internUser->id,
        'education_center_id' => $center->id,
        'company_tutor_user_id' => $tutor->id,
        'start_date' => '2026-04-09',
        'end_date' => '2026-06-30',
        'status' => 'active',
        'total_hours' => 300,
    ]);

    Schedule::create([
        'user_id' => $internUser->id,
        'name' => 'Horario base',
        'start_date' => '2026-04-01',
        'monday_hours' => 8,
        'tuesday_hours' => 8,
        'wednesday_hours' => 8,
        'thursday_hours' => 8,
        'friday_hours' => 8,
        'saturday_hours' => 0,
        'sunday_hours' => 0,
    ]);

    $this->actingAs($tutor)
        ->get(route('attendance.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('attendance/index')
            ->has('non_compliant_interns', 1)
            ->where('non_compliant_interns.0.name', $internUser->name)
        );

    Carbon::setTestNow();
});

it('returns attendance calendar events for interns', function () {
    Carbon::setTestNow('2026-04-14 12:00:00');

    $user = User::factory()->create();
    $user->assignRole('intern');

    TimeLog::create([
        'user_id' => $user->id,
        'date' => '2026-04-14',
        'clock_in' => '09:00:00',
        'clock_out' => '11:30:00',
        'total_hours' => 2.5,
    ]);

    $response = $this->actingAs($user)
        ->get(route('time-logs.events'))
        ->assertOk()
        ->json();

    expect($response)->toHaveCount(2)
        ->and($response[0]['id'])->toStartWith('log_')
        ->and($response[0]['title'])->toBe('Jornada')
        ->and($response[0]['start'])->toBe('2026-04-14T09:00:00')
        ->and($response[1]['id'])->toBe('summary_2026-04-14')
        ->and($response[1]['title'])->toBe('+ 2h 30m');

    Carbon::setTestNow();
});

it('allows assigned tutors to update calendar time log events', function () {
    $center = EducationCenter::factory()->create();
    $tutor = User::factory()->create();
    $tutor->assignRole('tutor');
    $internUser = User::factory()->create();

    Intern::factory()->create([
        'user_id' => $internUser->id,
        'education_center_id' => $center->id,
        'company_tutor_user_id' => $tutor->id,
        'status' => 'active',
    ]);

    $timeLog = TimeLog::create([
        'user_id' => $internUser->id,
        'date' => '2026-04-14',
        'clock_in' => '09:00:00',
        'clock_out' => '11:00:00',
        'total_hours' => 2,
    ]);

    $this->actingAs($tutor)
        ->patch(route('time-logs.updateEvent', $timeLog), [
            'start' => '2026-04-15T10:00:00',
            'end' => '2026-04-15T14:30:00',
        ])
        ->assertOk()
        ->assertJson(['success' => true]);

    expect($timeLog->fresh()->date->toDateString())->toBe('2026-04-15')
        ->and($timeLog->fresh()->clock_in)->toBe('10:00:00')
        ->and($timeLog->fresh()->clock_out)->toBe('14:30:00')
        ->and((float) $timeLog->fresh()->total_hours)->toBe(4.5);
});

it('prevents tutors from updating time log events for unassigned interns', function () {
    $center = EducationCenter::factory()->create();
    $assignedTutor = User::factory()->create();
    $assignedTutor->assignRole('tutor');
    $otherTutor = User::factory()->create();
    $otherTutor->assignRole('tutor');
    $internUser = User::factory()->create();

    Intern::factory()->create([
        'user_id' => $internUser->id,
        'education_center_id' => $center->id,
        'company_tutor_user_id' => $assignedTutor->id,
        'status' => 'active',
    ]);

    $timeLog = TimeLog::create([
        'user_id' => $internUser->id,
        'date' => '2026-04-14',
        'clock_in' => '09:00:00',
        'clock_out' => '11:00:00',
        'total_hours' => 2,
    ]);

    $this->actingAs($otherTutor)
        ->patch(route('time-logs.updateEvent', $timeLog), [
            'start' => '2026-04-15T10:00:00',
            'end' => '2026-04-15T14:30:00',
        ])
        ->assertForbidden();

    expect($timeLog->fresh()->date->toDateString())->toBe('2026-04-14');
});
