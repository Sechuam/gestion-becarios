<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MessageConversation extends Model
{
    use HasFactory;

    protected $fillable = [
        'intern_user_id',
        'tutor_user_id',
        'user_id_a',
        'user_id_b',
        'practice_type_id',
        'subject',
        'last_message_at',
    ];

    protected function casts(): array
    {
        return [
            'last_message_at' => 'datetime',
        ];
    }

    public function internUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'intern_user_id');
    }

    public function tutorUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'tutor_user_id');
    }

    public function userA(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id_a');
    }

    public function userB(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id_b');
    }

    public function practiceType(): BelongsTo
    {
        return $this->belongsTo(PracticeType::class);
    }

    public function participants(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'message_conversation_participants')
            ->withTimestamps();
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class);
    }

    public function latestMessage(): HasMany
    {
        return $this->messages()->latest();
    }

    public function isGroup(): bool
    {
        return $this->participants()->count() > 2;
    }
}
