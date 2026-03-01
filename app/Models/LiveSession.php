<?php
// app/Models/LiveSession.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LiveSession extends Model
{
    use HasFactory;

    protected $fillable = ['course_id', 'title', 'join_url', 'starts_at'];

    protected $casts = [
        'starts_at' => 'datetime',
    ];

    // ── Relationships ─────────────────────────────────────────────
    public function course()
    {
        return $this->belongsTo(Course::class);
    }
}
