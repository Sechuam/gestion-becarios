<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreInternRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'education_center_id' => 'required|exists:education_centers,id',
            'dni' => 'required|string|regex:/^[XYZ]?\d{7,8}[A-Z]$/i|unique:interns,dni',
            'birth_date' => 'required|date', 
            'phone' => 'required|string',
            'address' => 'required|string', 
            'city' => 'required|string',   
            'academic_degree' => 'required|string',
            'academic_year' => 'required|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'total_hours' => 'required|integer|min:1',
            'status' => 'required|in:active,completed,abandoned',
            'abandon_reason' => 'nullable|string|max:255',
            'dni_file' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
            'agreement_file' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
            'insurance_file' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
            'center_tutor_name' => 'nullable|string|max:255',
            'center_tutor_phone' => 'nullable|string|max:50',
            'center_tutor_email' => 'nullable|email|max:255',
            'company_tutor_user_id' => 'nullable|exists:users,id',
        ];
    }

    public function messages(): array
    {
        return [
            'dni.regex' => 'El DNI/NIE no tiene un formato válido.',
        ];
    }
}
