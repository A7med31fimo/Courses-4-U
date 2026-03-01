<?php
// database/migrations/2024_01_01_000003_create_lessons_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lessons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')
                ->constrained('courses')
                ->cascadeOnDelete();
            $table->string('title', 200);
            $table->text('description')->nullable();
            $table->string('video_file_id', 255)->nullable();  // Google Drive / YouTube file_id
            $table->enum('video_source', ['google_drive', 'youtube', 'url'])->default('google_drive');
            $table->smallInteger('sort_order')->unsigned()->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lessons');
    }
};
