<?php
// app/Models/Course.php — REPLACE existing

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    use HasFactory;

    protected $fillable = [
        'instructor_id', 'title', 'category', 'description', 'is_published',
    ];

    protected $casts = [
        'is_published' => 'boolean',
    ];

    // ── Relationships ─────────────────────────────────────────────
    public function instructor()
    {
        return $this->belongsTo(User::class, 'instructor_id');
    }

    public function lessons()
    {
        return $this->hasMany(Lesson::class)->orderBy('sort_order');
    }

    public function liveSessions()
    {
        return $this->hasMany(LiveSession::class)->orderBy('starts_at');
    }

    public function enrollments()
    {
        return $this->hasMany(Enrollment::class);
    }

    public function students()
    {
        return $this->belongsToMany(User::class, 'enrollments', 'course_id', 'student_id')
                    ->withPivot('enrolled_at');
    }

    // ── Scopes ───────────────────────────────────────────────────
    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }

    public function scopeByCategory($query, ?string $category)
    {
        if ($category && $category !== 'all') {
            $query->where('category', $category);
        }
        return $query;
    }

    public function scopeSearch($query, ?string $term)
    {
        if ($term) {
            $query->where(function ($q) use ($term) {
                $q->where('title', 'like', "%{$term}%")
                  ->orWhere('description', 'like', "%{$term}%");
            });
        }
        return $query;
    }
}
