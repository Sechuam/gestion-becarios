<?php

use App\Models\Invitation;
use App\Models\User;
use App\Notifications\UserInvited;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();

    Permission::findOrCreate('manage users');
    Role::findOrCreate('admin')->givePermissionTo('manage users');
    Role::findOrCreate('intern');
    Role::findOrCreate('becario');
    Role::findOrCreate('tutor');
});

it('allows admins to send invitations without creating duplicate pending tokens', function () {
    Notification::fake();

    $admin = User::factory()->create();
    $admin->assignRole('admin');

    Invitation::create([
        'email' => 'nuevo@example.test',
        'token' => 'old-token',
        'role' => 'tutor',
        'expires_at' => now()->addDay(),
    ]);

    $this->actingAs($admin)
        ->post(route('invitations.store'), [
            'email' => 'nuevo@example.test',
            'role' => 'intern',
        ])
        ->assertRedirect()
        ->assertSessionHas('success', 'Invitación enviada correctamente al correo.');

    expect(Invitation::where('email', 'nuevo@example.test')->get())->toHaveCount(1)
        ->and(Invitation::where('email', 'nuevo@example.test')->first()->role)->toBe('intern');

    Notification::assertSentOnDemand(UserInvited::class);
});

it('shows the invitation registration form for valid tokens', function () {
    $invitation = Invitation::create([
        'email' => 'registro@example.test',
        'token' => Str::random(32),
        'role' => 'intern',
        'expires_at' => now()->addDay(),
    ]);

    $this->get(route('register.invitation', $invitation->token))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('auth/RegisterByInvitation')
            ->where('email', 'registro@example.test')
            ->where('token', $invitation->token)
        );
});

it('registers invited interns and creates their empty intern profile', function () {
    $invitation = Invitation::create([
        'email' => 'becario@example.test',
        'token' => Str::random(32),
        'role' => 'intern',
        'expires_at' => now()->addDay(),
    ]);

    $this->post(route('register.invitation.store'), [
        'token' => $invitation->token,
        'name' => 'Nuevo Becario',
        'password' => 'Password123!',
        'password_confirmation' => 'Password123!',
    ])
        ->assertRedirect(route('interns.complete-profile'));

    $user = User::where('email', 'becario@example.test')->firstOrFail();

    expect($user->hasVerifiedEmail())->toBeTrue()
        ->and($user->hasRole('intern'))->toBeTrue()
        ->and($user->intern)->not->toBeNull()
        ->and($invitation->fresh()->accepted_at)->not->toBeNull();
});

it('normalizes legacy becario invitations to the intern role', function () {
    $invitation = Invitation::create([
        'email' => 'legacy@example.test',
        'token' => Str::random(32),
        'role' => 'becario',
        'expires_at' => now()->addDay(),
    ]);

    $this->post(route('register.invitation.store'), [
        'token' => $invitation->token,
        'name' => 'Legacy Becario',
        'password' => 'Password123!',
        'password_confirmation' => 'Password123!',
    ])
        ->assertRedirect(route('interns.complete-profile'));

    expect(User::where('email', 'legacy@example.test')->firstOrFail()->hasRole('intern'))->toBeTrue();
});

it('rejects expired and already accepted invitations', function () {
    $expired = Invitation::create([
        'email' => 'expired@example.test',
        'token' => Str::random(32),
        'role' => 'intern',
        'expires_at' => now()->subMinute(),
    ]);

    $accepted = Invitation::create([
        'email' => 'accepted@example.test',
        'token' => Str::random(32),
        'role' => 'intern',
        'expires_at' => now()->addDay(),
        'accepted_at' => now(),
    ]);

    $this->get(route('register.invitation', $expired->token))->assertNotFound();
    $this->get(route('register.invitation', $accepted->token))->assertNotFound();
});
