<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('roles', static function (Blueprint $table) {
            if (! Schema::hasColumn('roles', 'display_name')) {
                $table->string('display_name')->nullable()->after('name');
            }
        });
    }

    public function down(): void
    {
        Schema::table('roles', static function (Blueprint $table) {
            if (Schema::hasColumn('roles', 'display_name')) {
                $table->dropColumn('display_name');
            }
        });
    }
};
