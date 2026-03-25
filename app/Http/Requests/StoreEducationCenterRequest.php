<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreEducationCenterRequest extends FormRequest
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
        $schoolId = $this->route('school') ? $this->route('school')->id : 'NULL';

        return [
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:education_centers,code,'.$schoolId,
            'address' => 'required|string|max:255',
            'city' => 'required|string|max:255',
            'contact_person' => 'required|string|max:255',
            'contact_email' => 'required|email|max:255|unique:education_centers,contact_email,'.$schoolId,
            'contact_position' => 'nullable|string|max:255',
            'email' => 'required|email|max:255|unique:education_centers,email,'.$schoolId,
            'phone' => 'required|string|max:255',
            'web' => 'nullable|string|max:255',
            'agreement_signed_at' => 'nullable|date',
            'agreement_expires_at' => 'nullable|date|after_or_equal:agreement_signed_at',
            'agreement_slots' => 'nullable|integer|min:1',
            'agreement_file' => 'nullable|file|mimes:pdf|max:5120',
        ];
    }

    public function messages(): array
    {
        return [
            'required' => 'El campo :attribute es obligatorio.',
            'email' => 'El campo :attribute debe ser un correo válido.',
            'unique' => 'El campo :attribute ya está en uso.',
            'date' => 'El campo :attribute no es una fecha válida.',
            'after_or_equal' => 'El campo :attribute debe ser posterior o igual a :date.',
            'integer' => 'El campo :attribute debe ser un número entero.',
            'min.numeric' => 'El campo :attribute debe ser al menos :min.',
            'max.string' => 'El campo :attribute no debe superar :max caracteres.',
            'file' => 'El campo :attribute debe ser un archivo.',
            'mimes' => 'El campo :attribute debe ser un archivo de tipo: :values.',
            'max.file' => 'El campo :attribute no debe superar :max kilobytes.',
        ];
    }

    public function attributes(): array
    {
        return [
            'name' => 'nombre del centro',
            'code' => 'código',
            'address' => 'dirección',
            'city' => 'ciudad',
            'contact_person' => 'persona de contacto',
            'contact_email' => 'correo de contacto',
            'contact_position' => 'cargo de contacto',
            'email' => 'correo electrónico',
            'phone' => 'teléfono',
            'web' => 'web',
            'agreement_signed_at' => 'fecha de firma del convenio',
            'agreement_expires_at' => 'fecha de expiración del convenio',
            'agreement_slots' => 'plazas del convenio',
            'agreement_file' => 'archivo de convenio',
        ];
    }
}
