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
            'period_start' => ['required', 'date'],
            'period_end' => ['required', 'date', 'after_or_equal:period_start'],
            'evaluated_at' => ['required', 'date'],
            'is_self_evaluation' => ['nullable', 'boolean'],
            'general_comments' => ['nullable', 'string'],
            'scores' => ['required', 'array', 'min:1'],
            'scores.*.criterion_id' => ['required', 'exists:evaluation_criteria,id'],
            'scores.*.score' => ['required', 'numeric', 'min:0'],
            'scores.*.comment' => ['nullable', 'string'],
        ];
    }

    public function after(): array
    {
        return [
            function ($validator) {
                $scores = $this->input('scores', []);
                $errors = [];
                
                foreach ($scores as $index => $scoreData) {
                    $score = (float) ($scoreData['score'] ?? 0);
                    $comment = trim($scoreData['comment'] ?? '');
                    
                    // Require comment for extreme scores (< 4 or > 8)
                    if (($score < 4 || $score > 8) && empty($comment)) {
                        $errors["scores.$index.comment"] = 
                            'El comentario es obligatorio para puntuaciones extremas (menor a 4 o mayor a 8).';
                    }
                }
                
                if (!empty($errors)) {
                    $validator->errors()->add('scores', 'Hay errores en los comentarios de puntuaciones extremas.');
                    foreach ($errors as $field => $message) {
                        $validator->errors()->add($field, $message);
                    }
                }
            }
        ];
    }

    public function messages(): array
    {
        return [
            'period_start.required' => 'Debes indicar el inicio del periodo evaluado.',
            'period_end.required' => 'Debes indicar el fin del periodo evaluado.',
        ];
    }
}
