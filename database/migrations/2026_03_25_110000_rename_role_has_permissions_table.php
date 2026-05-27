<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('role_has_permissions') && ! Schema::hasTable('role_permissions')) {
            Schema::rename('role_has_permissions', 'role_permissions');
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('role_permissions') && ! Schema::hasTable('role_has_permissions')) {
            Schema::rename('role_permissions', 'role_has_permissions');
        }
    }
};
