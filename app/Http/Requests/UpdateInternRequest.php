<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateInternRequest extends FormRequest
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
        $intern = $this->route('intern');

        return [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,'.$intern->user_id,
            'education_center_id' => 'required|exists:education_centers,id',
            'dni' => 'required|string|regex:/^[XYZ]?\d{7,8}[A-Z]$/i|unique:interns,dni,'.$intern->id,
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
            'required' => 'El campo :attribute es obligatorio.',
            'email' => 'El campo :attribute debe ser un correo válido.',
            'unique' => 'El campo :attribute ya está en uso.',
            'exists' => 'El campo :attribute no es válido.',
            'date' => 'El campo :attribute no es una fecha válida.',
            'after' => 'El campo :attribute debe ser posterior a :date.',
            'in' => 'El valor seleccionado en :attribute no es válido.',
            'integer' => 'El campo :attribute debe ser un número entero.',
            'min.numeric' => 'El campo :attribute debe ser al menos :min.',
            'max.string' => 'El campo :attribute no debe superar :max caracteres.',
            'regex' => 'El campo :attribute no tiene un formato válido.',
            'file' => 'El campo :attribute debe ser un archivo.',
            'mimes' => 'El campo :attribute debe ser un archivo de tipo: :values.',
            'max.file' => 'El campo :attribute no debe superar :max kilobytes.',
        ];
    }

    public function attributes(): array
    {
        return [
            'name' => 'nombre',
            'email' => 'correo electrónico',
            'education_center_id' => 'centro educativo',
            'dni' => 'DNI/NIE',
            'birth_date' => 'fecha de nacimiento',
            'phone' => 'teléfono',
            'address' => 'dirección',
            'city' => 'ciudad',
            'academic_degree' => 'titulación',
            'academic_year' => 'curso académico',
            'start_date' => 'fecha de inicio',
            'end_date' => 'fecha de fin',
            'total_hours' => 'horas totales',
            'status' => 'estado',
            'abandon_reason' => 'motivo de abandono',
            'dni_file' => 'archivo de DNI',
            'agreement_file' => 'archivo de convenio',
            'insurance_file' => 'archivo de seguro',
            'center_tutor_name' => 'nombre del tutor del centro',
            'center_tutor_phone' => 'teléfono del tutor del centro',
            'center_tutor_email' => 'correo del tutor del centro',
            'company_tutor_user_id' => 'tutor de empresa',
        ];
    }
}
