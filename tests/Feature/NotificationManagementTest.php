<?php

use App\Models\EducationCenter;
use App\Models\Intern;
use App\Models\MessageConversation;
use App\Models\User;
use App\Notifications\AppAlert;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;

it('marks a notification as read and redirects to its explicit app url', function () {
    $user = User::factory()->create();
    $user->notify(new AppAlert(
        'custom',
        'Accion pendiente',
        'Revisa esta zona.',
        '/reportes',
    ));

    $notification = $user->notifications()->firstOrFail();

    $this->actingAs($user)
        ->post(route('notifications.read', $notification->id))
        ->assertRedirect('/reportes');

    expect($notification->fresh()->read_at)->not->toBeNull();
});

it('redirects message notifications to the selected conversation', function () {
    Notification::fake();

    $user = User::factory()->create();
    $conversation = MessageConversation::create(['last_message_at' => now()]);
    $conversation->participants()->attach($user->id);

    $user->notifications()->create([
        'id' => (string) Str::uuid(),
        'type' => 'database',
        'data' => [
            'type' => 'new_message',
            'conversation_id' => $conversation->id,
        ],
    ]);

    $notification = $user->notifications()->firstOrFail();

    $this->actingAs($user)
        ->post(route('notifications.read', $notification->id))
        ->assertRedirect(route('messages.index', ['conversation' => $conversation->id]));

    expect($notification->fresh()->read_at)->not->toBeNull();
});

it('redirects absence request notifications to the intern attendance section', function () {
    $user = User::factory()->create();
    $center = EducationCenter::factory()->create();
    $intern = Intern::factory()->create([
        'education_center_id' => $center->id,
    ]);

    $user->notifications()->create([
        'id' => (string) Str::uuid(),
        'type' => 'database',
        'data' => [
            'type' => 'absence_request',
            'intern_id' => $intern->id,
        ],
    ]);

    $notification = $user->notifications()->firstOrFail();

    $this->actingAs($user)
        ->post(route('notifications.read', $notification->id))
        ->assertRedirect(route('interns.show', $intern).'#asistencia');
});

it('marks all unread notifications as read', function () {
    $user = User::factory()->create();
    $user->notify(new AppAlert('one', 'Uno', 'Primera notificacion.'));
    $user->notify(new AppAlert('two', 'Dos', 'Segunda notificacion.'));

    $this->actingAs($user)
        ->from(route('dashboard'))
        ->post(route('notifications.read-all'))
        ->assertRedirect(route('dashboard'))
        ->assertSessionHas('success', 'Todas las notificaciones marcadas como leídas.');

    expect($user->fresh()->unreadNotifications)->toHaveCount(0);
});

it('handles unknown notification ids safely', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('notifications.read', (string) Str::uuid()))
        ->assertRedirect(route('dashboard'))
        ->assertSessionHas('error', 'Notificación no encontrada.');
});
