<?php
// app/Models/User.php — REPLACE existing

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = ['name', 'email', 'password', 'role'];

    protected $hidden = ['password', 'remember_token'];

    protected $casts = [
        'password'          => 'hashed',
        'email_verified_at' => 'datetime',
    ];

    // ── Role helpers ──────────────────────────────────────────────
    public function isAdmin(): bool      { return $this->role === 'admin'; }
    public function isInstructor(): bool { return $this->role === 'instructor'; }
    public function isStudent(): bool    { return $this->role === 'student'; }

    // ── Relationships ─────────────────────────────────────────────
    public function courses()
    {
        return $this->hasMany(Course::class, 'instructor_id');
    }

    public function enrollments()
    {
        return $this->hasMany(Enrollment::class, 'student_id');
    }

    public function enrolledCourses()
    {
        return $this->belongsToMany(Course::class, 'enrollments', 'student_id', 'course_id')
                    ->withPivot('enrolled_at');
    }

    public function lessonCompletions()
    {
        return $this->hasMany(LessonCompletion::class, 'student_id');
    }
}
