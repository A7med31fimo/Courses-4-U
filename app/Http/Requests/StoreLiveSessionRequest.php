<?php
// app/Http/Requests/StoreLiveSessionRequest.php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreLiveSessionRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'title'     => ['required', 'string', 'max:200'],
            'join_url'  => ['required', 'url', 'max:500'],
            'starts_at' => ['required', 'date', 'after:now'],
        ];
    }
}
