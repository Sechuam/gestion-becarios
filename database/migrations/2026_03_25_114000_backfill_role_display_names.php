<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $roleTable = config('permission.table_names.roles', 'roles');

        $defaults = [
            'admin' => 'Administrador',
            'tutor' => 'Tutor',
            'intern' => 'Becario',
        ];

        foreach ($defaults as $slug => $label) {
            DB::table($roleTable)
                ->where('name', $slug)
                ->whereNull('display_name')
                ->update(['display_name' => $label]);
        }
    }

    public function down(): void
    {
        // No rollback needed for display labels.
    }
};
