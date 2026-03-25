<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class Intern extends Model implements HasMedia
{
    use HasFactory, InteractsWithMedia, LogsActivity, SoftDeletes;

    protected static function booted(): void
    {
        static::saving(function (Intern $intern) {
            if ($intern->status === 'abandoned') {
                return;
            }

            $end = $intern->end_date ? Carbon::parse($intern->end_date)->endOfDay() : null;
            $today = Carbon::today();

            if ($end && $today->gt($end)) {
                $intern->status = 'completed';
            } else {
                $intern->status = 'active';
            }
        });
    }

    protected $fillable = [
        'user_id',
        'education_center_id',
        'dni',
        'birth_date',
        'phone',
        'address',
        'city',
        'academic_degree',
        'academic_year',
        'start_date',
        'end_date',
        'status',
        'tutor_name',
        'total_hours',
        'abandon_reason',
        'internal_notes',
        'center_tutor_name',
        'center_tutor_email',
        'center_tutor_phone',
        'company_tutor_user_id',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function educationCenter(): BelongsTo
    {
        return $this->belongsTo(EducationCenter::class);
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('dni')
            ->singleFile();
        $this->addMediaCollection('agreement')
            ->singleFile();
        $this->addMediaCollection('insurance')
            ->singleFile();
    }

    public function getProgressAttribute(): int
    {
        if (! $this->start_date || ! $this->end_date) {
            return 0;
        }

        $start = Carbon::parse($this->start_date)->startOfDay();
        $end = Carbon::parse($this->end_date)->endOfDay();
        $today = Carbon::today();

        if ($today->lte($start)) {
            return 0;
        }
        if ($today->gte($end)) {
            return 100;
        }

        $total = $start->diffInDays($end);
        $done = $start->diffInDays($today);

        if ($total === 0) {
            return 100;
        }

        return (int) round(($done / $total) * 100);
    }

    public function getIsDelayedAttribute(): bool
    {
        if (! $this->end_date) {
            return false;
        }

        $end = Carbon::parse($this->end_date)->endOfDay();

        return Carbon::today()->gt($end) && $this->status !== 'completed';
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    public function companyTutor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'company_tutor_user_id');
    }
}
