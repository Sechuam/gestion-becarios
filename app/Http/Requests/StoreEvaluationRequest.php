<?php

namespace App\Http\Requests;

use App\Models\Evaluation;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreEvaluationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'intern_id' => ['required', 'exists:interns,id'],
            'evaluation_type' => ['required', 'string', Rule::in(Evaluation::TYPES)],
            'period_start' => ['nullable', 'date'],
            'period_end' => ['nullable', 'date', 'after_or_equal:period_start'],
            'evaluated_at' => ['required', 'date'],
            'is_self_evaluation' => ['nullable', 'boolean'],
            'general_comments' => ['nullable', 'string'],
            'scores' => ['required', 'array', 'min:1'],
            'scores.*.criterion_id' => ['required', 'exists:evaluation_criteria,id'],
            'scores.*.score' => ['required', 'numeric', 'min:0'],
            'scores.*.comment' => ['nullable', 'string'],
        ];
    }
}
