<?php
// app/Http/Resources/CourseResource.php — REPLACE existing

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CourseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'title'            => $this->title,
            'category'         => $this->category,
            'description'      => $this->description,
            'is_published'     => $this->is_published,
            'instructor'       => new UserResource($this->whenLoaded('instructor')),
            'lessons'          => LessonResource::collection($this->whenLoaded('lessons')),
            'live_sessions'    => LiveSessionResource::collection($this->whenLoaded('liveSessions')),
            'lessons_count'    => $this->whenCounted('lessons'),
            'students_count'   => $this->whenCounted('students'),
            'is_enrolled'      => $this->when(isset($this->is_enrolled), $this->is_enrolled),
            'created_at'       => $this->created_at?->toISOString(),
        ];
    }
}
