<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Normalize existing data to the allowed states.
        DB::statement("UPDATE interns SET status = 'active' WHERE status = 'pending'");
        DB::statement("UPDATE interns SET status = 'abandoned', abandon_reason = COALESCE(abandon_reason, 'Cancelado') WHERE status = 'cancelled'");

        // Update constraint and default to match the spec.
        DB::statement("ALTER TABLE interns DROP CONSTRAINT interns_status_check");
        DB::statement("ALTER TABLE interns ADD CONSTRAINT interns_status_check CHECK (status IN ('active','completed','abandoned'))");
        DB::statement("ALTER TABLE interns ALTER COLUMN status SET DEFAULT 'active'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Bring data back within the old constraint.
        DB::statement("UPDATE interns SET status = 'cancelled' WHERE status = 'abandoned'");

        DB::statement("ALTER TABLE interns DROP CONSTRAINT interns_status_check");
        DB::statement("ALTER TABLE interns ADD CONSTRAINT interns_status_check CHECK (status IN ('pending','active','completed','cancelled'))");
        DB::statement("ALTER TABLE interns ALTER COLUMN status SET DEFAULT 'pending'");
    }
};
