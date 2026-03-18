<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('interns', function (Blueprint $table) {
            $table->text('internal_notes')->nullable()->after('abandon_reason');
        });
    }

    public function down(): void
    {
        Schema::table('interns', function (Blueprint $table) {
            $table->dropColumn('internal_notes');
        });
    }
};
