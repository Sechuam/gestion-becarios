<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('education_centers', function (Blueprint $table) {
            $table->text('internal_notes')->nullable()->after('agreement_slots');
        });
    }

    public function down(): void
    {
        Schema::table('education_centers', function (Blueprint $table) {
            $table->dropColumn('internal_notes');
        });
    }
};
