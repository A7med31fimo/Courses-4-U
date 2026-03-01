<?php
// app/Http/Controllers/LessonController.php — REPLACE existing
// Only store() and update() change — add the new Cloudinary fields

namespace App\Http\Controllers;

use App\Http\Requests\StoreLessonRequest;
use App\Http\Requests\UpdateLessonRequest;
use App\Http\Resources\LessonResource;
use App\Models\Course;
use App\Models\Lesson;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LessonController extends Controller
{
    public function index(Request $request, Course $course): JsonResponse
    {
        $user = $request->user();

        if ($user->isStudent()) {
            if (!$course->is_published) {
                return response()->json(['message' => 'Course not found.'], 404);
            }
            $enrolled = $user->enrollments()->where('course_id', $course->id)->exists();
            if (!$enrolled) {
                return response()->json(['message' => 'You are not enrolled in this course.'], 403);
            }
        }

        if ($user->isInstructor() && $course->instructor_id !== $user->id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        return response()->json(LessonResource::collection($course->lessons));
    }

    public function store(StoreLessonRequest $request, Course $course): JsonResponse
    {
        $this->authorizeOwnerOrAdmin($request, $course);

        $lesson = $course->lessons()->create([
            'title'                => $request->title,
            'description'          => $request->description,
            'video_source'         => $request->video_source ?? 'google_drive',
            'video_file_id'        => $request->video_file_id,
            // ── Cloudinary fields ───────────────────────────────
            'video_url'            => $request->video_url,
            'cloudinary_public_id' => $request->cloudinary_public_id,
            'thumbnail_url'        => $request->thumbnail_url,
            // ────────────────────────────────────────────────────
            'sort_order'           => $request->sort_order
                ?? $course->lessons()->max('sort_order') + 1,
        ]);

        return response()->json(new LessonResource($lesson), 201);
    }

    public function show(Request $request, Course $course, Lesson $lesson): JsonResponse
    {
        $this->ensureLessonBelongsToCourse($lesson, $course);
        $user = $request->user();

        if ($user->isStudent()) {
            if (!$course->is_published) {
                return response()->json(['message' => 'Not found.'], 404);
            }
            $enrolled = $user->enrollments()->where('course_id', $course->id)->exists();
            if (!$enrolled) {
                return response()->json(['message' => 'Enroll in the course first.'], 403);
            }
        }

        if ($user->isInstructor() && $course->instructor_id !== $user->id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        return response()->json(new LessonResource($lesson));
    }

    public function update(UpdateLessonRequest $request, Course $course, Lesson $lesson): JsonResponse
    {
        $this->ensureLessonBelongsToCourse($lesson, $course);
        $this->authorizeOwnerOrAdmin($request, $course);

        $lesson->update($request->only([
            'title', 'description', 'video_source', 'video_file_id',
            'video_url', 'cloudinary_public_id', 'thumbnail_url', 'sort_order',
        ]));

        return response()->json(new LessonResource($lesson));
    }

    public function destroy(Request $request, Course $course, Lesson $lesson): JsonResponse
    {
        $this->ensureLessonBelongsToCourse($lesson, $course);
        $this->authorizeOwnerOrAdmin($request, $course);
        $lesson->delete();
        return response()->json(['message' => 'Lesson deleted.']);
    }

    private function authorizeOwnerOrAdmin(Request $request, Course $course): void
    {
        $user = $request->user();
        if ($user->isAdmin()) return;
        if ($user->isInstructor() && $course->instructor_id === $user->id) return;
        abort(403, 'Forbidden.');
    }

    private function ensureLessonBelongsToCourse(Lesson $lesson, Course $course): void
    {
        if ($lesson->course_id !== $course->id) {
            abort(404, 'Lesson not found in this course.');
        }
    }
}
