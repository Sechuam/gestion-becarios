<?php

namespace App\Http\Controllers;

use App\Models\Intern;
use App\Models\MessageConversation;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class MessageController extends Controller
{
    public function index(Request $request): Response
    {
        /** @var User $user */
        $user = Auth::user();
        $selectedConversation = null;

        $conversations = $this->conversationQuery($user)
            ->with(['internUser', 'tutorUser', 'latestMessage.sender'])
            ->withCount([
                'messages as unread_count' => fn ($query) => $query
                    ->where('sender_user_id', '!=', $user->id)
                    ->whereNull('read_at'),
            ])
            ->orderByDesc('last_message_at')
            ->orderByDesc('updated_at')
            ->get();

        $selectedId = $request->integer('conversation');

        if ($selectedId) {
            $selectedConversation = (clone $this->conversationQuery($user))
                ->whereKey($selectedId)
                ->with(['internUser', 'tutorUser', 'messages.sender'])
                ->firstOrFail();

            $selectedConversation->messages()
                ->where('sender_user_id', '!=', $user->id)
                ->whereNull('read_at')
                ->update(['read_at' => now()]);
        }

        return Inertia::render('messages/index', [
            'conversations' => $conversations->map(fn (MessageConversation $conversation) => $this->conversationPayload($conversation, $user)),
            'selected_conversation' => $selectedConversation
                ? $this->conversationPayload($selectedConversation, $user, true)
                : null,
            'contacts' => $this->availableContacts($user),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        /** @var User $user */
        $user = Auth::user();

        $validated = $request->validate([
            'conversation_id' => ['nullable', 'integer', 'exists:message_conversations,id'],
            'recipient_user_id' => ['nullable', 'integer', 'exists:users,id'],
            'body' => ['required', 'string', 'max:5000'],
        ]);

        $conversation = $this->resolveConversation($user, $validated);

        $conversation->messages()->create([
            'sender_user_id' => $user->id,
            'body' => trim($validated['body']),
        ]);

        $conversation->forceFill(['last_message_at' => now()])->save();

        return redirect()
            ->route('messages.index', ['conversation' => $conversation->id])
            ->with('success', 'Mensaje enviado.');
    }

    private function conversationQuery(User $user)
    {
        return MessageConversation::query()
            ->where(function ($query) use ($user) {
                $query->where('intern_user_id', $user->id)
                    ->orWhere('tutor_user_id', $user->id);
            });
    }

    private function resolveConversation(User $user, array $validated): MessageConversation
    {
        if (! empty($validated['conversation_id'])) {
            return (clone $this->conversationQuery($user))
                ->whereKey($validated['conversation_id'])
                ->firstOrFail();
        }

        abort_unless(! empty($validated['recipient_user_id']), 422);

        $recipient = User::findOrFail($validated['recipient_user_id']);

        if ($user->isIntern()) {
            $intern = $user->intern()->firstOrFail();
            abort_unless((int) $intern->company_tutor_user_id === (int) $recipient->id, 403);

            return MessageConversation::firstOrCreate([
                'intern_user_id' => $user->id,
                'tutor_user_id' => $recipient->id,
            ]);
        }

        abort_unless($user->isTutor() || $user->isAdmin(), 403);

        $intern = Intern::query()
            ->where('user_id', $recipient->id)
            ->when($user->isTutor() && ! $user->isAdmin(), fn ($query) => $query->where('company_tutor_user_id', $user->id))
            ->firstOrFail();

        return MessageConversation::firstOrCreate([
            'intern_user_id' => $intern->user_id,
            'tutor_user_id' => $intern->company_tutor_user_id ?: $user->id,
        ]);
    }

    private function availableContacts(User $user): array
    {
        if ($user->isIntern()) {
            $intern = $user->intern()->with('companyTutor')->first();

            return $intern?->companyTutor ? [[
                'id' => $intern->companyTutor->id,
                'name' => $intern->companyTutor->name,
                'email' => $intern->companyTutor->email,
                'avatar' => $intern->companyTutor->avatar,
                'role' => 'Tutor',
            ]] : [];
        }

        if (! ($user->isTutor() || $user->isAdmin())) {
            return [];
        }

        return Intern::query()
            ->with('user')
            ->when($user->isTutor() && ! $user->isAdmin(), fn ($query) => $query->where('company_tutor_user_id', $user->id))
            ->orderBy(User::select('name')->whereColumn('users.id', 'interns.user_id'))
            ->get()
            ->filter(fn (Intern $intern) => $intern->user)
            ->map(fn (Intern $intern) => [
                'id' => $intern->user->id,
                'name' => $intern->user->name,
                'email' => $intern->user->email,
                'avatar' => $intern->user->avatar,
                'role' => 'Becario',
            ])
            ->values()
            ->all();
    }

    private function conversationPayload(MessageConversation $conversation, User $user, bool $withMessages = false): array
    {
        $otherUser = (int) $conversation->intern_user_id === (int) $user->id
            ? $conversation->tutorUser
            : $conversation->internUser;
        $latest = $conversation->latestMessage->first();

        $payload = [
            'id' => $conversation->id,
            'other_user' => [
                'id' => $otherUser?->id,
                'name' => $otherUser?->name,
                'email' => $otherUser?->email,
                'avatar' => $otherUser?->avatar,
            ],
            'last_message_at' => $conversation->last_message_at,
            'unread_count' => $conversation->unread_count ?? 0,
            'latest_message' => $latest ? [
                'body' => $latest->body,
                'sender_name' => $latest->sender?->name,
                'created_at' => $latest->created_at,
            ] : null,
        ];

        if ($withMessages) {
            $payload['messages'] = $conversation->messages
                ->sortBy('created_at')
                ->values()
                ->map(fn ($message) => [
                    'id' => $message->id,
                    'body' => $message->body,
                    'created_at' => $message->created_at,
                    'read_at' => $message->read_at,
                    'is_mine' => (int) $message->sender_user_id === (int) $user->id,
                    'sender' => [
                        'id' => $message->sender?->id,
                        'name' => $message->sender?->name,
                        'avatar' => $message->sender?->avatar,
                    ],
                ]);
        }

        return $payload;
    }
}
