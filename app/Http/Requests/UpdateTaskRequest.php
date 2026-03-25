<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'sometimes|required|in:pending,in_progress,in_review,completed,rejected',
            'priority' => 'nullable|string|max:50',
            'due_date' => 'nullable|date',
            'practice_type_id' => 'sometimes|required|exists:practice_types,id',
            'intern_ids' => 'nullable|array',
            'intern_ids.*' => 'exists:interns,id',
            'assignment_type' => 'nullable|in:user,module,center',
            'module_id' => 'nullable|string|max:50',
            'education_center_id' => 'nullable|exists:education_centers,id',
        ];
    }
}
