<?php
// app/Http/Controllers/EnrollmentController.php

namespace App\Http\Controllers;

use App\Http\Resources\CourseResource;
use App\Models\Course;
use App\Models\Enrollment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EnrollmentController extends Controller
{
    /**
     * GET /api/my-courses
     * Student's enrolled courses
     */
    public function myCourses(Request $request): JsonResponse
    {
        $courses = $request->user()
            ->enrolledCourses()
            ->with('instructor')
            ->withCount('lessons')
            ->get()
            ->map(function (Course $course) {
                $course->is_enrolled = true;
                return $course;
            });

        return response()->json(CourseResource::collection($courses));
    }

    /**
     * POST /api/courses/{course}/enroll
     * Student only
     */
    public function enroll(Request $request, Course $course): JsonResponse
    {
        if (!$course->is_published) {
            return response()->json(['message' => 'Course is not available.'], 404);
        }

        $already = Enrollment::where('student_id', $request->user()->id)
            ->where('course_id', $course->id)
            ->exists();

        if ($already) {
            return response()->json(['message' => 'Already enrolled.'], 409);
        }

        Enrollment::create([
            'student_id'  => $request->user()->id,
            'course_id'   => $course->id,
            'enrolled_at' => now(),
        ]);

        return response()->json(['message' => 'Enrolled successfully.'], 201);
    }

    /**
     * DELETE /api/courses/{course}/enroll
     * Student unenrolls
     */
    public function unenroll(Request $request, Course $course): JsonResponse
    {
        $deleted = Enrollment::where('student_id', $request->user()->id)
            ->where('course_id', $course->id)
            ->delete();

        if (!$deleted) {
            return response()->json(['message' => 'You are not enrolled.'], 404);
        }

        return response()->json(['message' => 'Unenrolled successfully.']);
    }

    /**
     * GET /api/courses/{course}/students
     * Admin or course owner instructor
     */
    public function courseStudents(Request $request, Course $course): JsonResponse
    {
        $user = $request->user();

        if ($user->isInstructor() && $course->instructor_id !== $user->id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $students = $course->students()->get();

        return response()->json([
            'course_id' => $course->id,
            'count'     => $students->count(),
            'students'  => $students->map(fn ($s) => [
                'id'          => $s->id,
                'name'        => $s->name,
                'email'       => $s->email,
                'enrolled_at' => $s->pivot->enrolled_at,
            ]),
        ]);
    }
}
