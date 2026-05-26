<?php

use App\Models\EducationCenter;
use App\Models\Evaluation;
use App\Models\Intern;
use App\Models\User;
use Spatie\LaravelPdf\Facades\Pdf;
use Spatie\LaravelPdf\PdfBuilder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();

    Role::findOrCreate('intern');
    Role::findOrCreate('tutor');
});

function createInternForEvaluationReport(User $internUser, ?User $tutor = null): Intern
{
    $center = EducationCenter::create([
        'name' => 'IES Mediterraneo',
        'code' => 'IES-'.str()->random(6),
        'address' => 'Calle Mayor 1',
        'city' => 'Malaga',
        'contact_person' => 'Laura Gomez',
        'contact_email' => 'laura-'.str()->random(6).'@example.test',
        'email' => 'centro-'.str()->random(6).'@example.test',
        'phone' => '960000000',
    ]);

    return Intern::factory()->create([
        'user_id' => $internUser->id,
        'education_center_id' => $center->id,
        'company_tutor_user_id' => $tutor?->id,
        'status' => 'active',
    ]);
}

it('allows assigned tutors to download evaluation PDF reports', function () {
    $tutor = User::factory()->create();
    $tutor->assignRole('tutor');

    $internUser = User::factory()->create([
        'name' => 'Ana Perez',
    ]);
    $internUser->assignRole('intern');

    $intern = createInternForEvaluationReport($internUser, $tutor);

    Evaluation::create([
        'intern_id' => $intern->id,
        'evaluator_user_id' => $tutor->id,
        'evaluation_type' => 'weekly',
        'evaluated_at' => '2026-05-01',
        'weighted_score' => 7.5,
    ]);

    $evaluation = Evaluation::create([
        'intern_id' => $intern->id,
        'evaluator_user_id' => $tutor->id,
        'evaluation_type' => 'weekly',
        'evaluated_at' => '2026-05-08',
        'weighted_score' => 8.25,
    ]);

    $pdf = Mockery::mock(PdfBuilder::class);
    $pdf->shouldReceive('driver')
        ->once()
        ->with('dompdf')
        ->andReturnSelf();
    $pdf->shouldReceive('name')
        ->once()
        ->with("evaluacion-{$evaluation->id}-ana-perez.pdf")
        ->andReturnSelf();
    $pdf->shouldReceive('toResponse')
        ->once()
        ->andReturn(response('pdf generated'));

    Pdf::shouldReceive('view')
        ->once()
        ->with('pdfs.evaluation-report', Mockery::on(function (array $data) use ($evaluation) {
            return $data['evaluation']->is($evaluation)
                && $data['history']->count() === 2
                && $data['history']->last()['is_current'] === true;
        }))
        ->andReturn($pdf);

    $this->actingAs($tutor)
        ->get(route('evaluations.pdf', $evaluation))
        ->assertOk()
        ->assertSee('pdf generated');
});

it('prevents interns from downloading evaluation PDF reports for other interns', function () {
    $tutor = User::factory()->create();
    $tutor->assignRole('tutor');

    $ownerUser = User::factory()->create();
    $ownerUser->assignRole('intern');

    $otherInternUser = User::factory()->create();
    $otherInternUser->assignRole('intern');

    $intern = createInternForEvaluationReport($ownerUser, $tutor);

    $evaluation = Evaluation::create([
        'intern_id' => $intern->id,
        'evaluator_user_id' => $tutor->id,
        'evaluation_type' => 'weekly',
        'evaluated_at' => '2026-05-08',
        'weighted_score' => 8.25,
    ]);

    Pdf::shouldReceive('view')->never();

    $this->actingAs($otherInternUser)
        ->get(route('evaluations.pdf', $evaluation))
        ->assertForbidden();
});
