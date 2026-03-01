<?php
// app/Models/LessonCompletion.php  — NEW FILE

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LessonCompletion extends Model
{
    public $timestamps = false;

    protected $fillable = ['student_id', 'lesson_id', 'completed_at'];

    protected $casts = [
        'completed_at' => 'datetime',
    ];

    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function lesson()
    {
        return $this->belongsTo(Lesson::class);
    }
}
