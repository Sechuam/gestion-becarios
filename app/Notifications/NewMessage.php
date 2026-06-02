<?php

namespace App\Notifications;

use App\Models\Message;
use App\Models\MessageConversation;
use Illuminate\Notifications\Notification;

class NewMessage extends Notification
{
    public function __construct(
        public Message $message,
        public MessageConversation $conversation,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        $sender = $this->message->sender;
        $otherUserName = $sender?->name ?? 'Usuario';

        return [
            'type' => 'new_message',
            'conversation_id' => $this->conversation->id,
            'sender_user_id' => $sender?->id,
            'sender_name' => $otherUserName,
            'message_preview' => mb_substr($this->message->body, 0, 120),
            'message' => "{$otherUserName} te ha enviado un mensaje.",
        ];
    }
}
