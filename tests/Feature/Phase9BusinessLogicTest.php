<?php

use App\Models\Absence;
use App\Models\EducationCenter;
use App\Models\Evaluation;
use App\Models\EvaluationCriterion;
use App\Models\Intern;
use App\Models\Schedule;
use App\Models\TimeLog;
use App\Models\User;
use App\Services\TimeTrackingService;
use Carbon\Carbon;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();

    foreach (['view evaluations', 'manage evaluations'] as $permission) {
        Permission::findOrCreate($permission);
    }

    Role::findOrCreate('tutor')->syncPermissions(['view evaluations', 'manage evaluations']);
    Role::findOrCreate('intern')->syncPermissions(['view evaluations']);
});

it('calculates worked, justified, and pending hours for an active internship', function () {
    Carbon::setTestNow('2026-05-06 12:00:00');

    $center = EducationCenter::factory()->create();
    $internUser = User::factory()->create();
    $intern = Intern::factory()->create([
        'user_id' => $internUser->id,
        'education_center_id' => $center->id,
        'start_date' => '2026-05-04',
        'end_date' => '2026-06-19',
        'status' => 'active',
        'total_hours' => 300,
    ]);

    Schedule::create([
        'user_id' => $internUser->id,
        'name' => 'Horario semanal',
        'start_date' => '2026-05-01',
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
        'date' => '2026-05-04',
        'clock_in' => '09:00:00',
        'clock_out' => '15:00:00',
        'total_hours' => 6,
    ]);

    Absence::create([
        'user_id' => $internUser->id,
        'date' => '2026-05-05',
        'reason' => 'Cita academica',
        'status' => 'approved',
    ]);

    $stats = app(TimeTrackingService::class)->getStats($intern->fresh('user'));

    expect($stats['expected_hours'])->toBe(24.0)
        ->and($stats['worked_hours'])->toBe(6.0)
        ->and($stats['justified_hours'])->toBe(8.0)
        ->and($stats['total_done'])->toBe(14.0)
        ->and($stats['debt'])->toBe(10.0)
        ->and($stats['is_non_compliant'])->toBeTrue();

    Carbon::setTestNow();
});

it('stores weighted evaluation scores from rubric criteria', function () {
    $center = EducationCenter::factory()->create();
    $tutor = User::factory()->create();
    $tutor->assignRole('tutor');

    $internUser = User::factory()->create();
    $internUser->assignRole('intern');

    $intern = Intern::factory()->create([
        'user_id' => $internUser->id,
        'education_center_id' => $center->id,
        'company_tutor_user_id' => $tutor->id,
        'status' => 'active',
    ]);

    $technical = EvaluationCriterion::create([
        'name' => 'Calidad tecnica',
        'category' => 'Competencias',
        'rubric' => 'Evalua autonomia y calidad de entrega.',
        'weight' => 60,
        'max_score' => 10,
        'sort_order' => 1,
        'is_active' => true,
    ]);
    $communication = EvaluationCriterion::create([
        'name' => 'Comunicacion',
        'category' => 'Actitud',
        'rubric' => 'Evalua comunicacion con el equipo.',
        'weight' => 40,
        'max_score' => 10,
        'sort_order' => 2,
        'is_active' => true,
    ]);

    $this->actingAs($tutor)
        ->post(route('evaluations.store'), [
            'intern_id' => $intern->id,
            'evaluation_type' => 'weekly',
            'period_start' => '2026-05-04',
            'period_end' => '2026-05-08',
            'evaluated_at' => '2026-05-08',
            'general_comments' => 'Buena evolucion semanal.',
            'scores' => [
                [
                    'criterion_id' => $technical->id,
                    'score' => 8,
                    'comment' => 'Entrega solida.',
                ],
                [
                    'criterion_id' => $communication->id,
                    'score' => 6,
                    'comment' => 'Puede anticipar bloqueos.',
                ],
            ],
        ])
        ->assertRedirect(route('evaluations.index'));

    $evaluation = Evaluation::query()->with('scores')->firstOrFail();

    expect((float) $evaluation->total_score)->toBe(14.0)
        ->and((float) $evaluation->weighted_score)->toBe(72.0)
        ->and($evaluation->scores)->toHaveCount(2);
});

