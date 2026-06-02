<?php

use App\Models\CalendarEvent;
use App\Models\User;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Role::findOrCreate('admin');
    Role::findOrCreate('intern');
});

it('prevents an intern from updating calendar events created by staff', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $intern = User::factory()->create();
    $intern->assignRole('intern');

    $event = CalendarEvent::create([
        'user_id' => $admin->id,
        'title' => 'Reunión de seguimiento',
        'start_date' => now()->toDateString(),
        'end_date' => now()->toDateString(),
        'start_time' => '09:00',
        'end_time' => '10:00',
        'all_day' => false,
        'color' => '#3b82f6',
    ]);
    $event->attendees()->sync([$intern->id]);

    $this->actingAs($intern)
        ->patch(route('calendar-events.update', $event), [
            'title' => 'Cambio indebido',
            'description' => 'No debería permitirse.',
            'start_date' => now()->toDateString(),
            'end_date' => now()->toDateString(),
            'start_time' => '11:00',
            'end_time' => '12:00',
            'all_day' => false,
            'color' => '#ef4444',
        ])
        ->assertForbidden();

    expect($event->fresh()->title)->toBe('Reunión de seguimiento');
});

it('prevents an intern from deleting calendar events created by staff', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $intern = User::factory()->create();
    $intern->assignRole('intern');

    $event = CalendarEvent::create([
        'user_id' => $admin->id,
        'title' => 'Evento de tutoría',
        'start_date' => now()->toDateString(),
        'end_date' => now()->toDateString(),
        'all_day' => true,
        'color' => '#3b82f6',
    ]);
    $event->attendees()->sync([$intern->id]);

    $this->actingAs($intern)
        ->delete(route('calendar-events.destroy', $event))
        ->assertForbidden();

    expect(CalendarEvent::query()->whereKey($event->id)->exists())->toBeTrue();
});

it('notifies attendees when they are included in a calendar event', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $intern = User::factory()->create();
    $intern->assignRole('intern');

    $this->actingAs($admin)
        ->post(route('calendar-events.store'), [
            'title' => 'Reunión de prácticas',
            'description' => 'Seguimiento mensual.',
            'start_date' => now()->toDateString(),
            'end_date' => now()->toDateString(),
            'start_time' => '09:00',
            'end_time' => '10:00',
            'all_day' => false,
            'color' => '#3b82f6',
            'attendee_ids' => [$intern->id],
        ])
        ->assertRedirect();

    $notification = $intern->notifications()->first();

    expect($notification)->not->toBeNull()
        ->and($notification->data['type'])->toBe('calendar_event_created');
});

it('allows attendees to accept or reject calendar event attendance', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $intern = User::factory()->create();
    $intern->assignRole('intern');

    $event = CalendarEvent::create([
        'user_id' => $admin->id,
        'title' => 'Reunión de seguimiento',
        'start_date' => now()->toDateString(),
        'end_date' => now()->toDateString(),
        'all_day' => true,
        'color' => '#3b82f6',
    ]);
    $event->attendees()->attach($intern->id, [
        'attendance_status' => 'pending',
    ]);

    $this->actingAs($intern)
        ->patch(route('calendar-events.attendance', $event), [
            'attendance_status' => 'accepted',
        ])
        ->assertRedirect();

    expect($event->attendees()->whereKey($intern->id)->first()->pivot->attendance_status)
        ->toBe('accepted');
});

it('prevents users from responding to events they are not attending', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $intern = User::factory()->create();
    $intern->assignRole('intern');

    $event = CalendarEvent::create([
        'user_id' => $admin->id,
        'title' => 'Reunión privada',
        'start_date' => now()->toDateString(),
        'end_date' => now()->toDateString(),
        'all_day' => true,
        'color' => '#3b82f6',
    ]);

    $this->actingAs($intern)
        ->patch(route('calendar-events.attendance', $event), [
            'attendance_status' => 'rejected',
        ])
        ->assertForbidden();
});
