<?php
// app/Http/Resources/LiveSessionResource.php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LiveSessionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'course_id'  => $this->course_id,
            'title'      => $this->title,
            'join_url'   => $this->join_url,
            'starts_at'  => $this->starts_at?->toISOString(),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
