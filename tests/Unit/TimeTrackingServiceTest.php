<?php

use App\Models\Absence;
use App\Models\EducationCenter;
use App\Models\Intern;
use App\Models\Schedule;
use App\Models\TimeLog;
use App\Models\User;
use App\Services\TimeTrackingService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

it('calculates worked justified and pending hours', function () {
    Carbon::setTestNow('2026-05-06 12:00:00');

    $center = EducationCenter::create([
        'name' => 'IES Mediterráneo',
        'code' => 'IES-MED',
        'address' => 'Calle Mayor 1',
        'city' => 'Valencia',
        'contact_person' => 'Laura Gómez',
        'contact_email' => 'laura@example.test',
        'email' => 'centro@example.test',
        'phone' => '960000000',
    ]);

    /** @var User $internUser */
    $internUser = User::factory()->create();

    /** @var Intern $intern */
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
        'reason' => 'Cita académica',
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
