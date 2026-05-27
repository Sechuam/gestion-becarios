<?php

use App\Models\EducationCenter;
use App\Models\Evaluation;
use App\Models\EvaluationCriterion;
use App\Models\Intern;
use App\Models\User;
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

function createEvaluationCriterionForPermissions(): EvaluationCriterion
{
    return EvaluationCriterion::create([
        'name' => 'Responsabilidad',
        'category' => 'Actitud',
        'rubric' => 'Evalua responsabilidad y autonomia.',
        'weight' => 100,
        'max_score' => 10,
        'sort_order' => 1,
        'is_active' => true,
    ]);
}

function createInternForEvaluationPermissions(?User $tutor = null): array
{
    $center = EducationCenter::create([
        'name' => 'IES Mediterraneo',
        'code' => 'IES-MED-'.str()->random(6),
        'address' => 'Calle Mayor 1',
        'city' => 'Valencia',
        'contact_person' => 'Laura Gomez',
        'contact_email' => 'laura-'.str()->random(6).'@example.test',
        'email' => 'centro-'.str()->random(6).'@example.test',
        'phone' => '960000000',
    ]);

    /** @var User $internUser */
    $internUser = User::factory()->create();
    $internUser->assignRole('intern');

    /** @var Intern $intern */
    $intern = Intern::factory()->create([
        'user_id' => $internUser->id,
        'education_center_id' => $center->id,
        'company_tutor_user_id' => $tutor?->id,
        'status' => 'active',
    ]);

    return [$internUser, $intern];
}

function validEvaluationPayload(Intern $intern, EvaluationCriterion $criterion, string $type = 'weekly'): array
{
    return [
        'intern_id' => $intern->id,
        'evaluation_type' => $type,
        'period_start' => '2026-05-04',
        'period_end' => '2026-05-08',
        'evaluated_at' => '2026-05-08',
        'is_self_evaluation' => $type === 'self',
        'general_comments' => 'Evolucion correcta.',
        'scores' => [
            [
                'criterion_id' => $criterion->id,
                'score' => 7,
                'comment' => 'Buen seguimiento.',
            ],
        ],
    ];
}

it('allows interns to create self evaluations for themselves', function () {
    $criterion = createEvaluationCriterionForPermissions();
    [$internUser, $intern] = createInternForEvaluationPermissions();

    $response = $this->actingAs($internUser)
        ->post(route('evaluations.store'), validEvaluationPayload($intern, $criterion, 'self'));

    $response->assertRedirect(route('evaluations.index'));

    $evaluation = Evaluation::query()->firstOrFail();

    expect($evaluation->intern_id)->toBe($intern->id)
        ->and($evaluation->evaluator_user_id)->toBe($internUser->id)
        ->and($evaluation->evaluation_type)->toBe('self')
        ->and($evaluation->is_self_evaluation)->toBeTrue();
});

it('prevents interns from creating non self evaluations', function () {
    $criterion = createEvaluationCriterionForPermissions();
    [$internUser, $intern] = createInternForEvaluationPermissions();

    $response = $this->actingAs($internUser)
        ->post(route('evaluations.store'), validEvaluationPayload($intern, $criterion, 'weekly'));

    $response->assertSessionHasErrors('evaluation_type');

    expect(Evaluation::query()->count())->toBe(0);
});

it('prevents tutors from evaluating interns assigned to another tutor', function () {
    /** @var User $assignedTutor */
    $assignedTutor = User::factory()->create();
    $assignedTutor->assignRole('tutor');

    /** @var User $otherTutor */
    $otherTutor = User::factory()->create();
    $otherTutor->assignRole('tutor');

    $criterion = createEvaluationCriterionForPermissions();
    [$internUser, $intern] = createInternForEvaluationPermissions($assignedTutor);

    $this->actingAs($otherTutor)
        ->post(route('evaluations.store'), validEvaluationPayload($intern, $criterion))
        ->assertForbidden();

    expect(Evaluation::query()->count())->toBe(0);
});

it('prevents users without evaluation permissions from accessing evaluations', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('evaluations.index'))
        ->assertForbidden();
});
