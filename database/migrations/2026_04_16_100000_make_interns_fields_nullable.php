<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('interns', function (Blueprint $table) {
            $table->unsignedBigInteger('education_center_id')->nullable()->change();
            $table->string('dni')->nullable()->change();
            $table->string('phone')->nullable()->change();
            $table->string('academic_degree')->nullable()->change();
            $table->string('academic_year')->nullable()->change();
            $table->date('start_date')->nullable()->change();
            $table->date('end_date')->nullable()->change();
            // Evitar problemas de DNI único nulo en Postgres modificando el constraint si fuera necesario, 
            // pero usualmente Laravel + Postgres manejan nulos en unique keys sin colisionar
        });
    }

    public function down(): void
    {
        // Revertir a estricto
        Schema::table('interns', function (Blueprint $table) {
            $table->unsignedBigInteger('education_center_id')->nullable(false)->change();
            $table->string('dni')->nullable(false)->change();
            $table->string('phone')->nullable(false)->change();
            $table->string('academic_degree')->nullable(false)->change();
            $table->string('academic_year')->nullable(false)->change();
            $table->date('start_date')->nullable(false)->change();
            $table->date('end_date')->nullable(false)->change();
        });
    }
};
