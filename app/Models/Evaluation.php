<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Evaluation extends Model
{
    use HasFactory;

    protected $fillable = [
        'intern_id',
        'evaluator_user_id',
        'evaluation_type',
        'period_start',
        'period_end',
        'evaluated_at',
        'is_self_evaluation',
        'total_score',
        'weighted_score',
        'general_comments',
    ];

    protected function casts(): array
    {
        return [
            'period_start' => 'date',
            'period_end' => 'date',
            'evaluated_at' => 'date',
            'is_self_evaluation' => 'boolean',
            'total_score' => 'decimal:2',
            'weighted_score' => 'decimal:2',
        ];
    }

    public function intern(): BelongsTo
    {
        return $this->belongsTo(Intern::class);
    }

    public function evaluator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'evaluator_user_id');
    }

    public function scores(): HasMany
    {
        return $this->hasMany(EvaluationScore::class);
    }
}
