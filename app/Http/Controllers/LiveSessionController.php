<?php
// app/Http/Controllers/LiveSessionController.php

namespace App\Http\Controllers;

use App\Http\Requests\StoreLiveSessionRequest;
use App\Http\Resources\LiveSessionResource;
use App\Models\Course;
use App\Models\LiveSession;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LiveSessionController extends Controller
{
    /**
     * GET /api/courses/{course}/live-sessions
     * Students must be enrolled
     */
    public function index(Request $request, Course $course): JsonResponse
    {
        $user = $request->user();

        if ($user->isStudent()) {
            if (!$course->is_published) {
                return response()->json(['message' => 'Course not found.'], 404);
            }

            $enrolled = $user->enrollments()->where('course_id', $course->id)->exists();
            if (!$enrolled) {
                return response()->json(['message' => 'Enroll in the course first.'], 403);
            }
        }

        if ($user->isInstructor() && $course->instructor_id !== $user->id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        return response()->json(
            LiveSessionResource::collection($course->liveSessions)
        );
    }

    /**
     * POST /api/courses/{course}/live-sessions
     * Instructor (owner) or Admin
     */
    public function store(StoreLiveSessionRequest $request, Course $course): JsonResponse
    {
        $this->authorizeOwnerOrAdmin($request, $course);

        $session = $course->liveSessions()->create([
            'title'     => $request->title,
            'join_url'  => $request->join_url,
            'starts_at' => $request->starts_at,
        ]);

        return response()->json(new LiveSessionResource($session), 201);
    }

    /**
     * PUT /api/courses/{course}/live-sessions/{liveSession}
     */
    public function update(StoreLiveSessionRequest $request, Course $course, LiveSession $liveSession): JsonResponse
    {
        $this->ensureBelongsToCourse($liveSession, $course);
        $this->authorizeOwnerOrAdmin($request, $course);

        $liveSession->update($request->only(['title', 'join_url', 'starts_at']));

        return response()->json(new LiveSessionResource($liveSession));
    }

    /**
     * DELETE /api/courses/{course}/live-sessions/{liveSession}
     */
    public function destroy(Request $request, Course $course, LiveSession $liveSession): JsonResponse
    {
        $this->ensureBelongsToCourse($liveSession, $course);
        $this->authorizeOwnerOrAdmin($request, $course);

        $liveSession->delete();

        return response()->json(['message' => 'Live session deleted.']);
    }

    // ── Helpers ────────────────────────────────────────────────────

    private function authorizeOwnerOrAdmin(Request $request, Course $course): void
    {
        $user = $request->user();
        if ($user->isAdmin()) return;
        if ($user->isInstructor() && $course->instructor_id === $user->id) return;
        abort(403, 'Forbidden.');
    }

    private function ensureBelongsToCourse(LiveSession $session, Course $course): void
    {
        if ($session->course_id !== $course->id) {
            abort(404, 'Live session not found in this course.');
        }
    }
}
