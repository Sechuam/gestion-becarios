<?php

use App\Models\Absence;
use App\Models\EducationCenter;
use App\Models\Intern;
use App\Models\Schedule;
use App\Models\User;
use App\Services\TimeTrackingService;
use Carbon\Carbon;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();

    Permission::findOrCreate('validate time logs');

    Role::findOrCreate('intern');
    Role::findOrCreate('tutor')->givePermissionTo('validate time logs');
});

it('allows interns to request absences pending tutor approval', function () {
    $tutor = User::factory()->create();
    $tutor->assignRole('tutor');

    $internUser = User::factory()->create();
    $internUser->assignRole('intern');

    $center = EducationCenter::factory()->create();

    Intern::factory()->create([
        'user_id' => $internUser->id,
        'education_center_id' => $center->id,
        'company_tutor_user_id' => $tutor->id,
        'start_date' => '2026-04-01',
        'end_date' => '2026-06-30',
        'status' => 'active',
        'total_hours' => 300,
    ]);

    $response = $this->actingAs($internUser)->post(route('absences.store'), [
        'date' => '2026-04-20',
        'reason' => 'Cita médica',
    ]);

    $response->assertRedirect()
        ->assertSessionHas('success', 'Solicitud de ausencia enviada correctamente al tutor.');

    $absence = Absence::query()->where('user_id', $internUser->id)->first();

    expect($absence)->not->toBeNull()
        ->and($absence->date->toDateString())->toBe('2026-04-20')
        ->and($absence->reason)->toBe('Cita médica')
        ->and($absence->status)->toBe('pending')
        ->and($absence->approved_by)->toBeNull();
});

it('allows assigned tutors to approve pending absences', function () {
    $tutor = User::factory()->create();
    $tutor->assignRole('tutor');

    $internUser = User::factory()->create();
    $internUser->assignRole('intern');

    $center = EducationCenter::factory()->create();

    Intern::factory()->create([
        'user_id' => $internUser->id,
        'education_center_id' => $center->id,
        'company_tutor_user_id' => $tutor->id,
        'start_date' => '2026-04-01',
        'end_date' => '2026-06-30',
        'status' => 'active',
        'total_hours' => 300,
    ]);

    $absence = Absence::create([
        'user_id' => $internUser->id,
        'date' => '2026-04-20',
        'reason' => 'Cita médica',
        'status' => 'pending',
    ]);

    $response = $this->actingAs($tutor)
        ->patch(route('absences.updateStatus', $absence), [
            'status' => 'approved',
        ]);

    $response->assertRedirect()
        ->assertSessionHas('success', 'Estado de la ausencia actualizado.');

    expect($absence->fresh()->status)->toBe('approved')
        ->and($absence->fresh()->approved_by)->toBe($tutor->id);
});

it('does not count rejected absences as justified hours', function () {
    Carbon::setTestNow('2026-04-20 12:00:00');

    $internUser = User::factory()->create();
    $internUser->assignRole('intern');

    $center = EducationCenter::factory()->create();

    $intern = Intern::factory()->create([
        'user_id' => $internUser->id,
        'education_center_id' => $center->id,
        'start_date' => '2026-04-20',
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

    Absence::create([
        'user_id' => $internUser->id,
        'date' => '2026-04-20',
        'reason' => 'Sin justificar',
        'status' => 'rejected',
    ]);

    $stats = app(TimeTrackingService::class)->getStats($intern->fresh('user'));

    expect($stats['expected_hours'])->toBe(8.0)
        ->and($stats['justified_hours'])->toBe(0.0)
        ->and($stats['total_done'])->toBe(0.0)
        ->and($stats['debt'])->toBe(8.0)
        ->and($stats['is_non_compliant'])->toBeTrue();

    Carbon::setTestNow();
});
