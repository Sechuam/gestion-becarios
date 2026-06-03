<?php

use App\Models\EducationCenter;
use App\Models\Intern;
use App\Models\Schedule;
use App\Models\User;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();

    Permission::findOrCreate('manage interns');
    Permission::findOrCreate('edit time logs');
    Permission::findOrCreate('validate time logs');
    Role::findOrCreate('admin')->givePermissionTo('manage interns');
    Role::findOrCreate('tutor');
    Role::findOrCreate('intern');
});

function schedulePayload(array $overrides = []): array
{
    return array_merge([
        'name' => 'Horario general',
        'start_date' => '2026-06-01',
        'end_date' => '2026-06-30',
        'monday_hours' => 6,
        'tuesday_hours' => 6,
        'wednesday_hours' => 6,
        'thursday_hours' => 6,
        'friday_hours' => 6,
        'saturday_hours' => 0,
        'sunday_hours' => 0,
        'monday_entry_time' => '09:00',
        'monday_exit_time' => '15:00',
    ], $overrides);
}

it('allows admins with intern management permission to assign schedules', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $center = EducationCenter::factory()->create();
    $internUser = User::factory()->create();
    Intern::factory()->create([
        'user_id' => $internUser->id,
        'education_center_id' => $center->id,
    ]);

    $this->actingAs($admin)
        ->post(route('schedules.store'), schedulePayload([
            'user_id' => $internUser->id,
        ]))
        ->assertRedirect()
        ->assertSessionHas('success', 'Horario asignado al becario correctamente.');

    expect(Schedule::where('user_id', $internUser->id)->where('name', 'Horario general')->exists())->toBeTrue();
});

it('allows assigned tutors to update and delete intern schedules', function () {
    $tutor = User::factory()->create();
    $tutor->assignRole('tutor');
    $center = EducationCenter::factory()->create();
    $internUser = User::factory()->create();

    Intern::factory()->create([
        'user_id' => $internUser->id,
        'education_center_id' => $center->id,
        'company_tutor_user_id' => $tutor->id,
    ]);

    $schedule = Schedule::create(schedulePayload([
        'user_id' => $internUser->id,
    ]));

    $this->actingAs($tutor)
        ->patch(route('schedules.update', $schedule), schedulePayload([
            'name' => 'Horario actualizado',
            'start_date' => '2026-07-01',
            'end_date' => '2026-07-31',
        ]))
        ->assertRedirect()
        ->assertSessionHas('success', 'Horario actualizado correctamente.');

    expect($schedule->fresh()->name)->toBe('Horario actualizado');

    $this->actingAs($tutor)
        ->delete(route('schedules.destroy', $schedule))
        ->assertRedirect()
        ->assertSessionHas('success', 'Horario eliminado correctamente.');

    expect(Schedule::whereKey($schedule->id)->exists())->toBeFalse();
});

it('prevents unassigned tutors from managing intern schedules', function () {
    $assignedTutor = User::factory()->create();
    $assignedTutor->assignRole('tutor');
    $otherTutor = User::factory()->create();
    $otherTutor->assignRole('tutor');
    $center = EducationCenter::factory()->create();
    $internUser = User::factory()->create();

    Intern::factory()->create([
        'user_id' => $internUser->id,
        'education_center_id' => $center->id,
        'company_tutor_user_id' => $assignedTutor->id,
    ]);

    $this->actingAs($otherTutor)
        ->post(route('schedules.store'), schedulePayload([
            'user_id' => $internUser->id,
        ]))
        ->assertForbidden();

    expect(Schedule::where('user_id', $internUser->id)->exists())->toBeFalse();
});

it('validates schedule date overlaps for the same intern', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');
    $center = EducationCenter::factory()->create();
    $internUser = User::factory()->create();

    Intern::factory()->create([
        'user_id' => $internUser->id,
        'education_center_id' => $center->id,
    ]);

    Schedule::create(schedulePayload([
        'user_id' => $internUser->id,
        'start_date' => '2026-06-01',
        'end_date' => '2026-06-30',
    ]));

    $this->actingAs($admin)
        ->post(route('schedules.store'), schedulePayload([
            'user_id' => $internUser->id,
            'start_date' => '2026-06-15',
            'end_date' => '2026-07-15',
        ]))
        ->assertSessionHasErrors('start_date');
});
