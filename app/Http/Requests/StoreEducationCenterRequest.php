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
            'code' => 'required|string|max:50|unique:education_centers,code,' . $schoolId,
            'address' => 'required|string|max:255',
            'city' => 'required|string|max:255',
            'contact_person' => 'required|string|max:255',
            'contact_position' => 'nullable|string|max:255',
            'email' => 'required|email|max:255|unique:education_centers,email,' . $schoolId,
            'phone' => 'required|string|max:255',
            'web' => 'nullable|string|max:255',
        ];
    }
}
