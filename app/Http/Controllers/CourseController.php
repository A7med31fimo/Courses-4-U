<?php
// app/Http/Controllers/CourseController.php — REPLACE existing

namespace App\Http\Controllers;

use App\Http\Requests\StoreCourseRequest;
use App\Http\Requests\UpdateCourseRequest;
use App\Http\Resources\CourseResource;
use App\Models\Course;
use App\Models\LessonCompletion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CourseController extends Controller
{
    /**
     * GET /api/courses?search=laravel&category=programming
     *
     * Query params:
     *   search    — full-text search on title + description
     *   category  — exact category match
     */
    public function index(Request $request): JsonResponse
    {
        $user     = $request->user();
        $search   = $request->query('search');
        $category = $request->query('category');

        $query = Course::with('instructor')
            ->withCount(['lessons', 'students'])
            ->search($search)
            ->byCategory($category);

        if ($user->isStudent()) {
            $query->published();

            $courses = $query->get();

            // Attach per-course progress for the student
            $enrolledIds = $user->enrollments()->pluck('course_id')->flip();

            // Batch-fetch all completions for this student in one query
            $completedLessonIds = $user->lessonCompletions()->pluck('lesson_id')->flip();

            $courses = $courses->map(function (Course $course) use ($enrolledIds, $completedLessonIds) {
                $course->is_enrolled = $enrolledIds->has($course->id);

                if ($course->is_enrolled && $course->lessons_count > 0) {
                    // We don't have the lesson IDs without loading lessons here.
                    // Keep it lean: just attach enrollment flag; full progress comes from /progress endpoint.
                }

                return $course;
            });

        } elseif ($user->isInstructor()) {
            $courses = $query->where('instructor_id', $user->id)->get();
        } else {
            $courses = $query->get();
        }

        // Return available categories for the filter UI (from all published courses)
        $categories = Course::published()
            ->whereNotNull('category')
            ->distinct()
            ->pluck('category')
            ->sort()
            ->values();

        return response()->json([
            'courses'    => CourseResource::collection($courses),
            'categories' => $categories,
        ]);
    }

    /**
     * POST /api/courses
     */
    public function store(StoreCourseRequest $request): JsonResponse
    {
        $course = Course::create([
            'instructor_id' => $request->user()->id,
            'title'         => $request->title,
            'category'      => $request->category,
            'description'   => $request->description,
            'is_published'  => $request->boolean('is_published', false),
        ]);

        return response()->json(
            new CourseResource($course->load('instructor')),
            201
        );
    }

    /**
     * GET /api/courses/{course}
     */
    public function show(Request $request, Course $course): JsonResponse
    {
        $user = $request->user();

        if ($user->isStudent() && !$course->is_published) {
            return response()->json(['message' => 'Course not found.'], 404);
        }

        if ($user->isInstructor() && $course->instructor_id !== $user->id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $course->load(['instructor', 'lessons', 'liveSessions'])
               ->loadCount(['students']);

        if ($user->isStudent()) {
            $course->is_enrolled = $user->enrollments()
                ->where('course_id', $course->id)
                ->exists();
        }

        return response()->json(new CourseResource($course));
    }

    /**
     * PUT /api/courses/{course}
     */
    public function update(UpdateCourseRequest $request, Course $course): JsonResponse
    {
        $this->authorizeOwnerOrAdmin($request, $course);
        $course->update($request->only(['title', 'category', 'description', 'is_published']));
        return response()->json(new CourseResource($course->load('instructor')));
    }

    /**
     * DELETE /api/courses/{course}
     */
    public function destroy(Request $request, Course $course): JsonResponse
    {
        $this->authorizeOwnerOrAdmin($request, $course);
        $course->delete();
        return response()->json(['message' => 'Course deleted.']);
    }

    private function authorizeOwnerOrAdmin(Request $request, Course $course): void
    {
        $user = $request->user();
        if ($user->isAdmin()) return;
        if ($user->isInstructor() && $course->instructor_id === $user->id) return;
        abort(403, 'You do not own this course.');
    }
}
