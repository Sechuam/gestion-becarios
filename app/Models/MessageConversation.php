<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MessageConversation extends Model
{
    use HasFactory;

    protected $fillable = [
        'intern_user_id',
        'tutor_user_id',
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

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class);
    }

    public function latestMessage(): HasMany
    {
        return $this->messages()->latest();
    }
}
