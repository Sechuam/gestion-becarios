<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $permissions = [
            'manage tasks',
            'validate time logs',
            'edit time logs',
            'view reports',
            'manage users',
            'view internal notes',
            'manage tutors',
        ];

        foreach ($permissions as $permission) {
            \Spatie\Permission\Models\Permission::firstOrCreate(['name' => $permission]);
        }

        $admin = \Spatie\Permission\Models\Role::where('name', 'admin')->first();
        if ($admin) {
            $admin->givePermissionTo($permissions);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $permissions = [
            'manage tasks',
            'validate time logs',
            'edit time logs',
            'view reports',
            'manage users',
            'view internal notes',
            'manage tutors',
        ];

        foreach ($permissions as $permission) {
            \Spatie\Permission\Models\Permission::where('name', $permission)->delete();
        }
    }
};
