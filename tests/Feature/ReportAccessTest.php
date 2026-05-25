<?php

use App\Models\EducationCenter;
use App\Models\Intern;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Role::findOrCreate('intern');
});

it('allows interns to access reports with their own scoped data', function () {
    $center = EducationCenter::factory()->create();
    $user = User::factory()->create();
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
        ->get(route('reports.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('reports/index')
            ->where('summary.interns', 1)
        );

    $this->actingAs($user)
        ->getJson(route('reports.preview', [
            'dataset' => 'interns',
            'columns' => 'id,name,email,status',
        ]))
        ->assertOk()
        ->assertJsonPath('total', 1)
        ->assertJsonPath('rows.0.id', $intern->id);
});

it('prevents users without an operational role from accessing reports', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('reports.index'))
        ->assertForbidden();
});
