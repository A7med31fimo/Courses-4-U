<?php
// database/seeders/DatabaseSeeder.php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\LiveSession;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ── Demo Users ──────────────────────────────────────────────
        $admin = User::create([
            'name'     => 'Admin User',
            'email'    => 'admin@learnyou.com',
            'password' => Hash::make('password'),
            'role'     => 'admin',
        ]);

        $instructor = User::create([
            'name'     => 'Jane Smith',
            'email'    => 'instructor@learnyou.com',
            'password' => Hash::make('password'),
            'role'     => 'instructor',
        ]);

        $student = User::create([
            'name'     => 'John Doe',
            'email'    => 'student@learnyou.com',
            'password' => Hash::make('password'),
            'role'     => 'student',
        ]);

        // ── Demo Course 1: Published ────────────────────────────────
        $course1 = Course::create([
            'instructor_id' => $instructor->id,
            'title'         => 'Introduction to Laravel 11',
            'description'   => 'Learn Laravel from scratch. Build APIs, work with Eloquent, and ship real applications.',
            'is_published'  => true,
        ]);

        // Lessons with Google Drive placeholders
        Lesson::create([
            'course_id'     => $course1->id,
            'title'         => 'Setting Up Your Environment',
            'description'   => 'Install PHP, Composer, and create your first Laravel project.',
            'video_file_id' => 'REPLACE_WITH_GOOGLE_DRIVE_FILE_ID',
            'video_source'  => 'google_drive',
            'sort_order'    => 1,
        ]);

        Lesson::create([
            'course_id'     => $course1->id,
            'title'         => 'Routing & Controllers',
            'description'   => 'Understand how Laravel routes requests and how controllers respond.',
            'video_file_id' => 'dQw4w9WgXcQ',   // YouTube example
            'video_source'  => 'youtube',
            'sort_order'    => 2,
        ]);

        Lesson::create([
            'course_id'     => $course1->id,
            'title'         => 'Eloquent ORM Basics',
            'description'   => 'Models, relationships, and querying your database.',
            'video_file_id' => null,
            'video_source'  => 'google_drive',
            'sort_order'    => 3,
        ]);

        // Live Session
        LiveSession::create([
            'course_id' => $course1->id,
            'title'     => 'Live Q&A: Laravel Fundamentals',
            'join_url'  => 'https://meet.jit.si/laravel-learnyou-demo',
            'starts_at' => now()->addDays(3),
        ]);

        // Enroll student
        Enrollment::create([
            'student_id'  => $student->id,
            'course_id'   => $course1->id,
            'enrolled_at' => now(),
        ]);

        // ── Demo Course 2: Draft (not published) ────────────────────
        $course2 = Course::create([
            'instructor_id' => $instructor->id,
            'title'         => 'Advanced React Patterns',
            'description'   => 'Deep dive into hooks, context, and performance optimisation.',
            'is_published'  => false,
        ]);

        Lesson::create([
            'course_id'   => $course2->id,
            'title'       => 'Custom Hooks in Depth',
            'description' => 'Build reusable logic with custom hooks.',
            'sort_order'  => 1,
        ]);

        $this->command->info('✅ Seeded demo data!');
        $this->command->table(
            ['Role', 'Email', 'Password'],
            [
                ['Admin',      'admin@learnyou.com',      'password'],
                ['Instructor', 'instructor@learnyou.com', 'password'],
                ['Student',    'student@learnyou.com',    'password'],
            ]
        );
    }
}
