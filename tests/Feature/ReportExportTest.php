<?php

use App\Exports\CustomReportExport;
use App\Models\EducationCenter;
use App\Models\Intern;
use App\Models\User;
use Carbon\Carbon;
use Maatwebsite\Excel\Facades\Excel;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();

    Role::findOrCreate('intern');
});

it('exports report data to Excel scoped to the authenticated intern', function () {
    Carbon::setTestNow('2026-05-26 10:00:00');
    Excel::fake();

    $center = EducationCenter::factory()->create();

    $user = User::factory()->create([
        'name' => 'Becario Visible',
        'email' => 'visible@example.test',
    ]);
    $user->assignRole('intern');

    $intern = Intern::factory()->create([
        'user_id' => $user->id,
        'education_center_id' => $center->id,
        'status' => 'active',
    ]);

    Intern::factory()->create([
        'education_center_id' => $center->id,
        'status' => 'active',
    ]);

    $this->actingAs($user)
        ->get(route('reports.export', [
            'dataset' => 'interns',
            'format' => 'xlsx',
            'columns' => 'id,name,email,status',
        ]))
        ->assertOk();

    Excel::assertDownloaded('reporte-interns-2026-05-26.xlsx', function (CustomReportExport $export) use ($intern) {
        $rows = $export->collection();

        return $rows->count() === 1
            && $rows->first()['id'] === $intern->id
            && $rows->first()['email'] === 'visible@example.test'
            && $export->headings() === ['ID', 'Nombre', 'Email', 'Estado']
            && $export->map($rows->first()) === [$intern->id, 'Becario Visible', 'visible@example.test', 'active'];
    });

    Carbon::setTestNow();
});
