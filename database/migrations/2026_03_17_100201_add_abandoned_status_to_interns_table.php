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
        Schema::table('interns', function (Blueprint $table) {
            $table->string('abandon_reason')->nullable()->after('status');
            
        });

        DB::statement("ALTER TABLE interns DROP CONSTRAINT interns_status_check");
        DB::statement("ALTER TABLE interns ADD CONSTRAINT interns_status_check CHECK (status IN ('pending','active','completed','cancelled','abandoned'))");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("ALTER TABLE interns DROP CONSTRAINT interns_status_check");
        DB::statement("ALTER TABLE interns ADD CONSTRAINT interns_status_check CHECK (status IN ('pending','active','completed','cancelled'))");

        Schema::table('interns', function (Blueprint $table) {
            $table->dropColumn('abandon_reason');
            
        });
    }
};
