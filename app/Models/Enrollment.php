<?php
// app/Models/Enrollment.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Enrollment extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = ['student_id', 'course_id', 'enrolled_at'];

    protected $casts = [
        'enrolled_at' => 'datetime',
    ];

    // ── Relationships ─────────────────────────────────────────────
    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function course()
    {
        return $this->belongsTo(Course::class);
    }
}
