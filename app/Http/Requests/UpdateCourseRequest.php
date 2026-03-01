<?php
// app/Http/Requests/UpdateCourseRequest.php — REPLACE existing

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCourseRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'title'        => ['sometimes', 'string', 'max:200'],
            'category'     => ['nullable', 'string', 'max:100'],
            'description'  => ['nullable', 'string'],
            'is_published' => ['sometimes', 'boolean'],
        ];
    }
}
