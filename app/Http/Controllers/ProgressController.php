<?php
// app/Http/Controllers/ProgressController.php  — NEW FILE

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Lesson;
use App\Models\LessonCompletion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProgressController extends Controller
{
    /**
     * POST /api/courses/{course}/lessons/{lesson}/complete
     * Mark a lesson as complete for the authenticated student.
     */
    public function markComplete(Request $request, Course $course, Lesson $lesson): JsonResponse
    {
        $this->guardStudent($request, $course, $lesson);

        LessonCompletion::firstOrCreate([
            'student_id' => $request->user()->id,
            'lesson_id'  => $lesson->id,
        ], [
            'completed_at' => now(),
        ]);

        return response()->json([
            'message'  => 'Lesson marked as complete.',
            'progress' => $this->buildProgress($request->user()->id, $course),
        ]);
    }

    /**
     * DELETE /api/courses/{course}/lessons/{lesson}/complete
     * Unmark a lesson (allow re-watching from scratch).
     */
    public function unmarkComplete(Request $request, Course $course, Lesson $lesson): JsonResponse
    {
        $this->guardStudent($request, $course, $lesson);

        LessonCompletion::where('student_id', $request->user()->id)
            ->where('lesson_id', $lesson->id)
            ->delete();

        return response()->json([
            'message'  => 'Lesson marked as incomplete.',
            'progress' => $this->buildProgress($request->user()->id, $course),
        ]);
    }

    /**
     * GET /api/courses/{course}/progress
     * Get the current student's progress for a course.
     */
    public function courseProgress(Request $request, Course $course): JsonResponse
    {
        // Students only; instructors/admins don't track progress
        if (!$request->user()->isStudent()) {
            return response()->json(['message' => 'Only students have progress.'], 403);
        }

        // Must be enrolled
        $enrolled = $request->user()->enrollments()
            ->where('course_id', $course->id)->exists();

        if (!$enrolled) {
            return response()->json(['message' => 'Not enrolled.'], 403);
        }

        return response()->json(
            $this->buildProgress($request->user()->id, $course)
        );
    }

    /**
     * GET /api/student/dashboard
     * Full dashboard: enrolled courses with progress for the current student.
     */
    public function dashboard(Request $request): JsonResponse
    {
        $user = $request->user();

        // Eager-load courses with their lessons
        $enrolledCourses = $user->enrolledCourses()
            ->with(['instructor', 'lessons'])
            ->withCount('lessons')
            ->get();

        // Fetch all completion IDs for this student in one query
        $completedLessonIds = $user->lessonCompletions()
            ->pluck('lesson_id')
            ->flip(); // flip for O(1) lookup

        $data = $enrolledCourses->map(function ($course) use ($completedLessonIds) {
            $totalLessons     = $course->lessons->count();
            $completedCount   = $course->lessons->filter(
                fn($l) => $completedLessonIds->has($l->id)
            )->count();

            $pct = $totalLessons > 0
                ? (int) round(($completedCount / $totalLessons) * 100)
                : 0;

            return [
                'id'              => $course->id,
                'title'           => $course->title,
                'category'        => $course->category,
                'description'     => $course->description,
                'is_published'    => $course->is_published,
                'instructor'      => [
                    'id'   => $course->instructor?->id,
                    'name' => $course->instructor?->name,
                ],
                'enrolled_at'     => $course->pivot->enrolled_at,
                'total_lessons'   => $totalLessons,
                'completed_count' => $completedCount,
                'progress_pct'    => $pct,
                'is_complete'     => $pct === 100,
            ];
        });

        // Summary stats
        $totalCourses    = $data->count();
        $completedCourses = $data->where('is_complete', true)->count();
        $inProgress       = $data->where('progress_pct', '>', 0)
                                 ->where('is_complete', false)->count();
        $totalLessonsCompleted = $completedLessonIds->count();

        return response()->json([
            'stats' => [
                'enrolled_courses'       => $totalCourses,
                'completed_courses'      => $completedCourses,
                'in_progress'            => $inProgress,
                'total_lessons_completed'=> $totalLessonsCompleted,
            ],
            'courses' => $data->values(),
        ]);
    }

    // ── Private helpers ────────────────────────────────────────────

    private function guardStudent(Request $request, Course $course, Lesson $lesson): void
    {
        if (!$request->user()->isStudent()) {
            abort(403, 'Only students can track progress.');
        }

        if ($lesson->course_id !== $course->id) {
            abort(404, 'Lesson not found in this course.');
        }

        $enrolled = $request->user()->enrollments()
            ->where('course_id', $course->id)->exists();

        if (!$enrolled) {
            abort(403, 'You are not enrolled in this course.');
        }
    }

    private function buildProgress(int $studentId, Course $course): array
    {
        $course->loadMissing('lessons');

        $lessonIds = $course->lessons->pluck('id');

        $completedIds = LessonCompletion::where('student_id', $studentId)
            ->whereIn('lesson_id', $lessonIds)
            ->pluck('lesson_id')
            ->toArray();

        $total     = $lessonIds->count();
        $completed = count($completedIds);
        $pct       = $total > 0 ? (int) round(($completed / $total) * 100) : 0;

        return [
            'course_id'        => $course->id,
            'total_lessons'    => $total,
            'completed_count'  => $completed,
            'progress_pct'     => $pct,
            'is_complete'      => $pct === 100,
            'completed_lesson_ids' => $completedIds,
        ];
    }
}
