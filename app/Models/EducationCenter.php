<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class EducationCenter extends Model implements HasMedia
{
    use HasFactory, InteractsWithMedia, SoftDeletes;

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
    ];
}
