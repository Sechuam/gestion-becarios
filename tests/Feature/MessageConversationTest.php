<?php

use App\Models\EducationCenter;
use App\Models\Intern;
use App\Models\MessageConversation;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

it('keeps a conversation available for the remaining participant when another user leaves it', function () {
    $tutor = User::factory()->create();
    $intern = User::factory()->create();

    $conversation = MessageConversation::create([
        'last_message_at' => now(),
    ]);

    $conversation->participants()->attach([$tutor->id, $intern->id]);
    $conversation->messages()->create([
        'sender_user_id' => $tutor->id,
        'body' => 'Hola, seguimos por aqui.',
    ]);

    $this->actingAs($tutor)
        ->delete(route('messages.destroy-conversation', $conversation))
        ->assertRedirect(route('messages.index'));

    expect(MessageConversation::query()->whereKey($conversation->id)->exists())->toBeTrue()
        ->and($conversation->fresh()->participants()->pluck('users.id')->all())->toBe([$intern->id]);

    $this->actingAs($intern)
        ->get(route('messages.index', ['conversation' => $conversation->id]))
        ->assertOk();
});

it('allows interns to reply to group conversations they participate in', function () {
    $tutor = User::factory()->create();
    $internUser = User::factory()->create();
    $otherInternUser = User::factory()->create();
    $center = EducationCenter::factory()->create();

    Intern::factory()->create([
        'user_id' => $internUser->id,
        'education_center_id' => $center->id,
        'company_tutor_user_id' => $tutor->id,
    ]);

    $conversation = MessageConversation::create([
        'subject' => 'Grupo de seguimiento',
        'last_message_at' => now(),
    ]);

    $conversation->participants()->attach([
        $tutor->id,
        $internUser->id,
        $otherInternUser->id,
    ]);

    $this->actingAs($internUser)
        ->post(route('messages.store'), [
            'conversation_id' => $conversation->id,
            'body' => 'Recibido.',
        ])
        ->assertRedirect(route('messages.index', ['conversation' => $conversation->id]));

    expect($conversation->messages()->where('body', 'Recibido.')->exists())->toBeTrue();
});

it('clears the unread count in the conversation list when opening a chat', function () {
    $sender = User::factory()->create();
    $recipient = User::factory()->create();

    $conversation = MessageConversation::create([
        'last_message_at' => now(),
    ]);

    $conversation->participants()->attach([$sender->id, $recipient->id]);
    $message = $conversation->messages()->create([
        'sender_user_id' => $sender->id,
        'body' => 'Tienes un mensaje pendiente.',
        'read_at' => null,
    ]);

    $this->actingAs($recipient)
        ->get(route('messages.index', ['conversation' => $conversation->id]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('messages/index')
            ->where('conversations.0.id', $conversation->id)
            ->where('conversations.0.unread_count', 0)
        );

    expect($message->fresh()->read_at)->not->toBeNull();
});
