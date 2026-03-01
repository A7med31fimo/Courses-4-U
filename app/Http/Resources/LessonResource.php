<?php
// app/Http/Resources/LessonResource.php — REPLACE existing

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LessonResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                   => $this->id,
            'course_id'            => $this->course_id,
            'title'                => $this->title,
            'description'          => $this->description,
            'video_source'         => $this->video_source,
            'video_file_id'        => $this->video_file_id,
            'video_url'            => $this->video_url,
            'cloudinary_public_id' => $this->cloudinary_public_id,
            'thumbnail_url'        => $this->thumbnail_url,
            'embed_url'            => $this->embed_url,         // computed
            'is_native_video'      => $this->is_native_video,   // computed: true = use <video>, false = use <iframe>
            'sort_order'           => $this->sort_order,
            'created_at'           => $this->created_at?->toISOString(),
        ];
    }
}
