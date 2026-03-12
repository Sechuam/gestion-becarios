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
        Schema::table('education_centers', function (Blueprint $table) {
            $table->date('agreement_signed_at')->nullable();
            $table->date('agreement_expires_at')->nullable();
            $table->unsignedInteger('agreement_slots')->nullable();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('education_centers', function (Blueprint $table) {
            //
        });
    }
};
