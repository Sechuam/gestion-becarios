<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReportTemplate extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'dataset',
        'columns',
        'filters',
    ];

    protected function casts(): array
    {
        return [
            'columns' => 'array',
            'filters' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
