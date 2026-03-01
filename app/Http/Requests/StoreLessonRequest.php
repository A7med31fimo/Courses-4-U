<?php
// app/Http/Requests/StoreLessonRequest.php — REPLACE existing

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreLessonRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'title'                => ['required', 'string', 'max:200'],
            'description'          => ['nullable', 'string'],
            'video_source'         => ['sometimes', 'in:google_drive,youtube,url,cloudinary'],
            'video_file_id'        => ['nullable', 'string', 'max:255'],

            // Cloudinary-specific fields
            'video_url'            => ['nullable', 'url', 'max:1000'],
            'cloudinary_public_id' => ['nullable', 'string', 'max:500'],
            'thumbnail_url'        => ['nullable', 'url', 'max:1000'],

            'sort_order'           => ['sometimes', 'integer', 'min:0'],
        ];
    }
}
