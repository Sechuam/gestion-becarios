<?php

namespace App\Http\Controllers;

use App\Models\Intern;
use App\Models\Message;
use App\Models\MessageConversation;
use App\Models\PracticeType;
use App\Models\User;
use App\Notifications\NewMessage;
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
            ->with([
                'internUser', 'tutorUser', 'userA', 'userB',
                'practiceType', 'latestMessage.sender',
                'participants',
            ])
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
                ->with([
                    'internUser', 'tutorUser', 'userA', 'userB',
                    'practiceType', 'messages.sender', 'participants',
                ])
                ->firstOrFail();

            $selectedConversation->messages()
                ->where('sender_user_id', '!=', $user->id)
                ->whereNull('read_at')
                ->update(['read_at' => now()]);
        }

        return Inertia::render('messages/index', [
            'conversations' => $conversations->map(
                fn (MessageConversation $conversation) => $this->conversationPayload($conversation, $user)
            ),
            'selected_conversation' => $selectedConversation
                ? $this->conversationPayload($selectedConversation, $user, true)
                : null,
            'contacts' => $this->availableContacts($user),
            'practice_types' => PracticeType::where('is_active', true)->orderBy('name')->get(['id', 'name', 'color']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        /** @var User $user */
        $user = Auth::user();

        $validated = $request->validate([
            'conversation_id' => ['nullable', 'integer', 'exists:message_conversations,id'],
            'recipient_user_id' => ['nullable', 'integer', 'exists:users,id'],
            'recipient_ids' => ['nullable', 'array'],
            'recipient_ids.*' => ['integer', 'exists:users,id'],
            'body' => ['required', 'string', 'max:5000'],
            'practice_type_id' => ['nullable', 'integer', 'exists:practice_types,id'],
            'subject' => ['nullable', 'string', 'max:255'],
        ]);

        // Determinar destinatarios
        $recipientIds = collect();

        if (! empty($validated['recipient_ids'])) {
            $recipientIds = collect($validated['recipient_ids']);
        } elseif (! empty($validated['recipient_user_id'])) {
            $recipientIds = collect([$validated['recipient_user_id']]);
        }

        // Usar conversación existente o crear una nueva
        if (! empty($validated['conversation_id'])) {
            $conversation = (clone $this->conversationQuery($user))
                ->whereKey($validated['conversation_id'])
                ->firstOrFail();

            abort_unless($this->canReplyToConversation($user, $conversation), 403, 'No puedes responder a esta conversación.');

            // Añadir nuevos participantes si viene con recipient_ids
            if ($recipientIds->isNotEmpty()) {
                $this->authorizeRecipients($user, $recipientIds);

                $existingIds = $conversation->participants()->pluck('users.id');
                $newIds = $recipientIds->reject(fn ($id) => $existingIds->contains($id));
                foreach ($newIds as $newId) {
                    $conversation->participants()->attach($newId);
                }
            }
        } else {
            abort_unless($recipientIds->isNotEmpty(), 422, 'Debes seleccionar al menos un destinatario.');
            $this->authorizeRecipients($user, $recipientIds);

            // Siempre crear nueva conversación (no reutilizar)
            $conversation = MessageConversation::create([
                'practice_type_id' => $validated['practice_type_id'] ?? null,
                'subject' => $validated['subject'] ?? null,
            ]);

            // Añadir creador + destinatarios como participantes
            $allParticipantIds = $recipientIds->push((int) $user->id)->unique();
            $conversation->participants()->attach($allParticipantIds->values()->all());
        }

        // Crear el mensaje
        $conversation->messages()->create([
            'sender_user_id' => $user->id,
            'body' => trim($validated['body']),
        ]);

        $conversation->forceFill(['last_message_at' => now()])->save();

        // Notificar a todos los participantes excepto el remitente
        $this->notifyRecipients($conversation, $user);

        return redirect()
            ->route('messages.index', ['conversation' => $conversation->id])
            ->with('success', 'Mensaje enviado.');
    }

    public function update(Request $request, Message $message): RedirectResponse
    {
        /** @var User $user */
        $user = Auth::user();

        if ((int) $message->sender_user_id !== (int) $user->id) {
            abort(403, 'No puedes editar mensajes de otros usuarios.');
        }

        $validated = $request->validate([
            'body' => ['required', 'string', 'max:5000'],
        ]);

        $message->update([
            'body' => trim($validated['body']),
            'edited_at' => now(),
        ]);

        return redirect()->back()->with('success', 'Mensaje editado.');
    }

    public function destroy(Message $message): RedirectResponse
    {
        /** @var User $user */
        $user = Auth::user();

        if ((int) $message->sender_user_id !== (int) $user->id) {
            abort(403, 'No puedes eliminar mensajes de otros usuarios.');
        }

        $conversationId = $message->message_conversation_id;
        $message->delete();

        return redirect()->route('messages.index', ['conversation' => $conversationId])
            ->with('success', 'Mensaje eliminado.');
    }

    public function destroyConversation(MessageConversation $conversation): RedirectResponse
    {
        /** @var User $user */
        $user = Auth::user();

        $isParticipant = $this->conversationParticipantIds($conversation)
            ->contains((int) $user->id);

        abort_unless($isParticipant, 403, 'No eres participante de esta conversación.');

        $conversation->participants()->detach($user->id);

        if ($conversation->participants()->count() === 0) {
            $conversation->delete();
        }

        return redirect()->route('messages.index')
            ->with('success', 'Has salido de la conversación.');
    }

    private function notifyRecipients(MessageConversation $conversation, User $sender): void
    {
        $message = $conversation->messages()->latest()->first();
        if (! $message) {
            return;
        }

        $participantIds = $conversation->participants()
            ->pluck('users.id')
            ->reject(fn ($id) => (int) $id === (int) $sender->id);

        foreach ($participantIds as $recipientId) {
            $recipient = User::find($recipientId);
            if ($recipient) {
                $recipient->notify(new NewMessage($message, $conversation));
            }
        }
    }

    private function conversationQuery(User $user)
    {
        $userId = (int) $user->id;

        return MessageConversation::query()
            ->where(function ($query) use ($userId) {
                $query->where('intern_user_id', $userId)
                    ->orWhere('tutor_user_id', $userId)
                    ->orWhere('user_id_a', $userId)
                    ->orWhere('user_id_b', $userId)
                    ->orWhereHas('participants', fn ($q) => $q->where('user_id', $userId));
            });
    }

    private function availableContacts(User $user): array
    {
        // Intern: solo su tutor asignado.
        if ($user->isIntern()) {
            $intern = $user->intern()->with('companyTutor')->first();
            $contacts = [];

            if ($intern?->companyTutor) {
                $contacts[] = [
                    'id' => $intern->companyTutor->id,
                    'name' => $intern->companyTutor->name,
                    'email' => $intern->companyTutor->email,
                    'avatar' => $intern->companyTutor->avatar,
                    'role' => 'Tutor',
                    'group' => 'Mi tutor',
                ];
            }

            return $contacts;
        }

        // Admin/Tutor: becarios. El tutor ve solo sus becarios asignados.
        $contacts = [];

        $interns = Intern::query()
            ->with('user')
            ->when(
                $user->isTutor() && ! $user->isAdmin(),
                fn ($query) => $query->where('company_tutor_user_id', $user->id)
            )
            ->orderBy(User::select('name')->whereColumn('users.id', 'interns.user_id'))
            ->get()
            ->filter(fn (Intern $intern) => $intern->user)
            ->map(fn (Intern $intern) => [
                'id' => $intern->user->id,
                'name' => $intern->user->name,
                'email' => $intern->user->email,
                'avatar' => $intern->user->avatar,
                'role' => 'Becario',
                'group' => 'Becarios',
            ]);

        foreach ($interns as $intern) {
            $contacts[] = $intern;
        }

        return $contacts;
    }

    private function authorizeRecipients(User $user, $recipientIds): void
    {
        $allowedIds = collect($this->availableContacts($user))
            ->pluck('id')
            ->map(fn ($id) => (int) $id);

        $invalid = collect($recipientIds)
            ->map(fn ($id) => (int) $id)
            ->reject(fn ($id) => $allowedIds->contains($id));

        abort_unless($invalid->isEmpty(), 403, 'No puedes enviar mensajes a esos destinatarios.');
    }

    private function canReplyToConversation(User $user, MessageConversation $conversation): bool
    {
        if (! $user->isIntern()) {
            return true;
        }

        $intern = $user->intern()->first();
        if (! $intern?->company_tutor_user_id) {
            return false;
        }

        $participantIds = $this->conversationParticipantIds($conversation);

        if ($participantIds->count() > 2) {
            return $participantIds->contains((int) $user->id);
        }

        return $participantIds->count() === 2
            && $participantIds->contains((int) $user->id)
            && $participantIds->contains((int) $intern->company_tutor_user_id);
    }

    private function conversationParticipantIds(MessageConversation $conversation)
    {
        $participantIds = $conversation->participants()
            ->pluck('users.id')
            ->map(fn ($id) => (int) $id);

        return $participantIds
            ->merge([
                $conversation->intern_user_id,
                $conversation->tutor_user_id,
                $conversation->user_id_a,
                $conversation->user_id_b,
            ])
            ->filter()
            ->map(fn ($id) => (int) $id)
            ->unique()
            ->sort()
            ->values();
    }

    private function conversationPayload(MessageConversation $conversation, User $user, bool $withMessages = false): array
    {
        $latest = $conversation->latestMessage->first();
        $participants = $conversation->participants;
        $isGroup = $participants->count() > 2;

        // Determinar el "otro usuario" a mostrar en la lista (para chats 1:1)
        $otherUser = null;
        if (! $isGroup) {
            $otherUser = $participants
                ->first(fn (User $p) => (int) $p->id !== (int) $user->id);
        }

        $payload = [
            'id' => $conversation->id,
            'other_user' => $otherUser ? [
                'id' => $otherUser->id,
                'name' => $otherUser->name,
                'email' => $otherUser->email,
                'avatar' => $otherUser->avatar,
            ] : null,
            'is_group' => $isGroup,
            'participants' => $participants->map(fn (User $p) => [
                'id' => $p->id,
                'name' => $p->name,
                'email' => $p->email,
                'avatar' => $p->avatar,
            ])->values()->toArray(),
            'practice_type' => $conversation->practiceType ? [
                'id' => $conversation->practiceType->id,
                'name' => $conversation->practiceType->name,
                'color' => $conversation->practiceType->color,
            ] : null,
            'subject' => $conversation->subject,
            'last_message_at' => $conversation->last_message_at,
            'unread_count' => $conversation->unread_count ?? 0,
            'can_reply' => $this->canReplyToConversation($user, $conversation),
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
                ->map(fn (Message $message) => [
                    'id' => $message->id,
                    'body' => $message->body,
                    'created_at' => $message->created_at,
                    'read_at' => $message->read_at,
                    'edited_at' => $message->edited_at,
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
