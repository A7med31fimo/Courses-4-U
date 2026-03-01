<?php
// app/Http/Requests/StoreCourseRequest.php — REPLACE existing

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCourseRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'title'        => ['required', 'string', 'max:200'],
            'category'     => ['nullable', 'string', 'max:100'],
            'description'  => ['nullable', 'string'],
            'is_published' => ['sometimes', 'boolean'],
        ];
    }
}
