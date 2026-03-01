<?php
// routes/api.php — REPLACE existing

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\EnrollmentController;
use App\Http\Controllers\LessonController;
use App\Http\Controllers\LiveSessionController;
use App\Http\Controllers\ProgressController;
use App\Http\Controllers\UploadController;
use Illuminate\Support\Facades\Route;

// ── Public: Auth ──────────────────────────────────────────────────
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

// ── Email verification link (arrives from email, no auth token yet) ──
// Signed URL — Laravel validates the signature automatically
Route::get('/email/verify/{id}/{hash}', [AuthController::class, 'verify'])
     ->name('verification.verify');

// ── Protected: all authenticated users ───────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/logout',                             [AuthController::class, 'logout']);
    Route::get('/me',                                  [AuthController::class, 'me']);
    Route::post('/email/verification-notification',    [AuthController::class, 'resendVerification']);

    // Upload (Cloudinary)
    Route::middleware('role:admin,instructor')->group(function () {
        Route::post('/uploads/sign',         [UploadController::class, 'sign']);
        Route::delete('/uploads/{publicId}', [UploadController::class, 'destroy'])
             ->where('publicId', '.*');
    });

    // Courses (search + category via ?search=&category=)
    Route::get('/courses',          [CourseController::class, 'index']);
    Route::get('/courses/{course}', [CourseController::class, 'show']);

    Route::middleware('role:admin,instructor')->group(function () {
        Route::post('/courses',            [CourseController::class, 'store']);
        Route::put('/courses/{course}',    [CourseController::class, 'update']);
        Route::delete('/courses/{course}', [CourseController::class, 'destroy']);
    });

    // Lessons
    Route::get('/courses/{course}/lessons',          [LessonController::class, 'index']);
    Route::get('/courses/{course}/lessons/{lesson}', [LessonController::class, 'show']);

    Route::middleware('role:admin,instructor')->group(function () {
        Route::post('/courses/{course}/lessons',            [LessonController::class, 'store']);
        Route::put('/courses/{course}/lessons/{lesson}',    [LessonController::class, 'update']);
        Route::delete('/courses/{course}/lessons/{lesson}', [LessonController::class, 'destroy']);
    });

    // ── Progress tracking (students only) ────────────────────────
    Route::middleware('role:student')->group(function () {
        // Student dashboard — enrolled courses + progress stats
        Route::get('/student/dashboard', [ProgressController::class, 'dashboard']);

        // Per-course progress
        Route::get('/courses/{course}/progress',                              [ProgressController::class, 'courseProgress']);

        // Mark / unmark individual lessons
        Route::post('/courses/{course}/lessons/{lesson}/complete',            [ProgressController::class, 'markComplete']);
        Route::delete('/courses/{course}/lessons/{lesson}/complete',          [ProgressController::class, 'unmarkComplete']);

        // Enrollment
        Route::get('/my-courses',                 [EnrollmentController::class, 'myCourses']);
        Route::post('/courses/{course}/enroll',   [EnrollmentController::class, 'enroll']);
        Route::delete('/courses/{course}/enroll', [EnrollmentController::class, 'unenroll']);
    });

    // Live sessions
    Route::get('/courses/{course}/live-sessions', [LiveSessionController::class, 'index']);

    Route::middleware('role:admin,instructor')->group(function () {
        Route::post('/courses/{course}/live-sessions',                 [LiveSessionController::class, 'store']);
        Route::put('/courses/{course}/live-sessions/{liveSession}',    [LiveSessionController::class, 'update']);
        Route::delete('/courses/{course}/live-sessions/{liveSession}', [LiveSessionController::class, 'destroy']);
        Route::get('/courses/{course}/students',                       [EnrollmentController::class, 'courseStudents']);
    });
});
