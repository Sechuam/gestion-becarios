<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateEvaluationCriterionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'category' => 'required|string|max:255',
            'description' => 'nullable|string',
            'rubric' => 'nullable|string',
            'weight' => 'required|numeric|min:0.01|max:100',
            'max_score' => 'required|integer|min:1|max:100',
            'sort_order' => 'nullable|integer|min:0|max:9999',
            'is_active' => 'nullable|boolean',
        ];
    }
}
