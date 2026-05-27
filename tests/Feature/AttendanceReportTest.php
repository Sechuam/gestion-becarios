<?php

use App\Models\EducationCenter;
use App\Models\Intern;
use App\Models\Schedule;
use App\Models\TimeLog;
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

function createInternForAttendanceReport(User $internUser, ?User $tutor = null): Intern
{
    $center = EducationCenter::create([
        'name' => 'IES Costa del Sol',
        'code' => 'IES-'.str()->random(6),
        'address' => 'Calle Principal 1',
        'city' => 'Malaga',
        'contact_person' => 'Maria Gomez',
        'contact_email' => 'maria-'.str()->random(6).'@example.test',
        'email' => 'centro-'.str()->random(6).'@example.test',
        'phone' => '951000000',
    ]);

    return Intern::factory()->create([
        'user_id' => $internUser->id,
        'education_center_id' => $center->id,
        'company_tutor_user_id' => $tutor?->id,
        'start_date' => '2026-05-04',
        'end_date' => '2026-06-30',
        'status' => 'active',
        'total_hours' => 300,
    ]);
}

it('allows interns to download their own attendance PDF report', function () {
    $internUser = User::factory()->create([
        'name' => 'Luis Garcia',
    ]);
    $internUser->assignRole('intern');

    $intern = createInternForAttendanceReport($internUser);

    Schedule::create([
        'user_id' => $internUser->id,
        'name' => 'Horario base',
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
        'clock_out' => '17:00:00',
        'total_hours' => 8,
    ]);

    $pdf = Mockery::mock(PdfBuilder::class);
    $pdf->shouldReceive('driver')
        ->once()
        ->with('dompdf')
        ->andReturnSelf();
    $pdf->shouldReceive('name')
        ->once()
        ->with('reporte-asistencia-Luis Garcia.pdf')
        ->andReturnSelf();
    $pdf->shouldReceive('toResponse')
        ->once()
        ->andReturn(response('attendance pdf generated'));

    Pdf::shouldReceive('view')
        ->once()
        ->with('pdfs.attendance-report', Mockery::on(function (array $data) use ($intern) {
            return $data['intern']->is($intern)
                && $data['total_worked'] === 8.0
                && $data['grand_total'] === 8.0
                && count($data['days']) === 1;
        }))
        ->andReturn($pdf);

    $this->actingAs($internUser)
        ->get(route('interns.report', [
            'intern' => $intern,
            'start_date' => '2026-05-04',
            'end_date' => '2026-05-04',
        ]))
        ->assertOk()
        ->assertSee('attendance pdf generated');
});

it('prevents tutors from downloading attendance reports for unassigned interns', function () {
    $assignedTutor = User::factory()->create();
    $assignedTutor->assignRole('tutor');

    $otherTutor = User::factory()->create();
    $otherTutor->assignRole('tutor');

    $internUser = User::factory()->create();
    $internUser->assignRole('intern');

    $intern = createInternForAttendanceReport($internUser, $assignedTutor);

    Pdf::shouldReceive('view')->never();

    $this->actingAs($otherTutor)
        ->get(route('interns.report', [
            'intern' => $intern,
            'start_date' => '2026-05-04',
            'end_date' => '2026-05-04',
        ]))
        ->assertForbidden();
});
