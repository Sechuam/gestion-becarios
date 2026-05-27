<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $permissions = [
            'manage evaluations',
            'view evaluations',
            'delete evaluations',
            'manage evaluation criteria',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Assign to Admin
        $admin = Role::where('name', 'admin')->first();
        if ($admin) {
            $admin->givePermissionTo($permissions);
        }

        // Assign to Tutor (can view and manage evaluations, but maybe not criteria or delete)
        $tutor = Role::where('name', 'tutor')->first();
        if ($tutor) {
            $tutor->givePermissionTo([
                'manage evaluations',
                'view evaluations',
            ]);
        }

        // Interns can only view evaluations (usually their own, which is handled in logic)
        $intern = Role::where('name', 'intern')->first();
        if ($intern) {
            $intern->givePermissionTo([
                'view evaluations',
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $permissions = [
            'manage evaluations',
            'view evaluations',
            'delete evaluations',
            'manage evaluation criteria',
        ];

        foreach ($permissions as $permission) {
            Permission::where('name', $permission)->delete();
        }
    }
};
