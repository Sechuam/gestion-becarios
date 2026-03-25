<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('education_centers', function (Blueprint $table) {
            $table->string('contact_email')->nullable()->after('contact_person');
        });

        // Backfill existing rows with unique placeholder emails to satisfy NOT NULL + UNIQUE.
        DB::table('education_centers')
            ->whereNull('contact_email')
            ->update([
                'contact_email' => DB::raw("'coordinator_' || id || '@example.com'"),
            ]);

        // Enforce not-null and uniqueness after backfill.
        DB::statement('ALTER TABLE education_centers ALTER COLUMN contact_email SET NOT NULL');
        Schema::table('education_centers', function (Blueprint $table) {
            $table->unique('contact_email');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('education_centers', function (Blueprint $table) {
            $table->dropUnique(['contact_email']);
            $table->dropColumn('contact_email');
        });
    }
};
