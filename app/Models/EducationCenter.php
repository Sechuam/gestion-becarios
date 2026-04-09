<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class EducationCenter extends Model implements HasMedia
{
    use HasFactory, InteractsWithMedia, LogsActivity, SoftDeletes;

    public function interns(): HasMany
    {
        return $this->hasMany(Intern::class);
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('agreement_pdf')->singleFile();
    }

    protected $fillable = [
        'name',
        'code',
        'address',
        'city',
        'contact_person',
        'contact_email',
        'contact_position',
        'email',
        'phone',
        'web',
        'agreement_signed_at',
        'agreement_expires_at',
        'agreement_slots',
        'internal_notes',
        'internal_notes_updated_by',
        'internal_notes_updated_at',
    ];

    protected function casts(): array
    {
        return [
            'internal_notes_updated_at' => 'datetime',
        ];
    }

    public function notesUpdatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'internal_notes_updated_by');
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    public function internalNotes(): MorphMany
    {
        return $this->morphMany(InternalNote::class, 'notable')->latest();
    }
}
