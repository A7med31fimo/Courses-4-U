<?php
// database/migrations/2024_07_01_000003_add_email_verification_to_users.php
//
// Laravel's default users migration already includes email_verified_at.
// This migration is only needed if you skipped it earlier or need to add it.
// Run: php artisan migrate — it will skip if the column already exists.

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('users', 'email_verified_at')) {
            Schema::table('users', function (Blueprint $table) {
                $table->timestamp('email_verified_at')->nullable()->after('email');
            });
        }
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('email_verified_at');
        });
    }
};
