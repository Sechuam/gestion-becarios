<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'required|in:pending,in_progress,in_review,completed,rejected',
            'priority' => 'nullable|string|max:50',
            'due_date' => 'nullable|date',
            'practice_type_id' => 'required|exists:practice_types,id',
            'intern_ids' => 'nullable|array',
            'intern_ids.*' => 'exists:interns,id',
        ];
    }
}
