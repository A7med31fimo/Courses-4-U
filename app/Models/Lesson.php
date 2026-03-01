<?php
// app/Models/Lesson.php  — REPLACE your existing file with this

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Lesson extends Model
{
    use HasFactory;

    protected $fillable = [
        'course_id',
        'title',
        'description',
        'video_file_id',
        'video_url',
        'cloudinary_public_id',
        'thumbnail_url',
        'video_source',
        'sort_order',
    ];

    // ── Relationships ─────────────────────────────────────────────
    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    // ── Computed: embed URL ───────────────────────────────────────
    /**
     * Returns the correct embed/src URL based on video_source.
     *
     * Cloudinary  → direct streaming URL  (use <video> tag)
     * Google Drive → iframe preview URL   (use <iframe>)
     * YouTube      → embed URL            (use <iframe>)
     * url          → raw URL              (use <video> or <iframe>)
     */
    public function getEmbedUrlAttribute(): ?string
    {
        return match ($this->video_source) {
            'cloudinary'   => $this->video_url,   // direct mp4/hls URL from Cloudinary
            'google_drive' => $this->video_file_id
                ? "https://drive.google.com/file/d/{$this->video_file_id}/preview"
                : null,
            'youtube'      => $this->video_file_id
                ? "https://www.youtube.com/embed/{$this->video_file_id}"
                : null,
            'url'          => $this->video_file_id,
            default        => null,
        };
    }

    /**
     * Whether to use a <video> tag instead of <iframe>.
     * Cloudinary and direct URLs stream natively in the browser.
     */
    public function getIsNativeVideoAttribute(): bool
    {
        return in_array($this->video_source, ['cloudinary', 'url']);
    }

    protected $appends = ['embed_url', 'is_native_video'];
}
