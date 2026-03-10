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
        Schema::create('interns', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('education_center_id')->constrained()->onDelete('cascade');

            $table->string('dni')->unique();
            $table->date('birth_date')->nullable();
            $table->string('phone');
            $table->string('address')->nullable();
            $table->string('city')->nullable();

            $table->string('academic_degree');
            $table->string('academic_year');

            $table->date('start_date');
            $table->date('end_date');
            $table->enum('status', ['pending', 'active', 'completed', 'cancelled'])->default('pending');
            $table->string('tutor_name')->nullable();

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('interns');
    }
};
