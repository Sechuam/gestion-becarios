<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreEvaluationCriterionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'weight' => $this->input('weight') === '' ? null : $this->input('weight'),
            'max_score' => $this->input('max_score') === '' ? null : $this->input('max_score'),
            'sort_order' => $this->input('sort_order') === '' ? 0 : $this->input('sort_order'),
            'is_active' => $this->boolean('is_active'),
        ]);
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'rubric' => ['nullable', 'string'],
            'weight' => ['required', 'numeric', 'min:0.01', 'max:100'],
            'max_score' => ['required', 'integer', 'min:1', 'max:100'],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:9999'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
