<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $roleTable = config('permission.table_names.roles', 'roles');
        $modelHasRoles = config('permission.table_names.model_has_roles', 'model_has_roles');
        $rolePermissions = config('permission.table_names.role_has_permissions', 'role_permissions');

        $mappings = [
            'administrador' => 'admin',
            'tutor' => 'tutor',
            'becario' => 'intern',
        ];

        foreach ($mappings as $from => $to) {
            $fromRole = DB::table($roleTable)
                ->whereRaw('lower(name) = ?', [$from])
                ->first();

            if (! $fromRole) {
                continue;
            }

            $toRole = DB::table($roleTable)
                ->whereRaw('lower(name) = ?', [$to])
                ->first();

            if ($toRole) {
                DB::table($modelHasRoles)
                    ->where('role_id', $fromRole->id)
                    ->update(['role_id' => $toRole->id]);

                DB::table($rolePermissions)
                    ->where('role_id', $fromRole->id)
                    ->update(['role_id' => $toRole->id]);

                DB::table($roleTable)->where('id', $fromRole->id)->delete();
            } else {
                DB::table($roleTable)
                    ->where('id', $fromRole->id)
                    ->update(['name' => $to]);
            }
        }
    }

    public function down(): void
    {
        // No automatic rollback to avoid renaming roles unpredictably.
    }
};
