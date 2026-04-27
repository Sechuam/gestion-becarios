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
        Schema::create('evaluations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('intern_id')->constrained()->cascadeOnDelete();
            $table->foreignId('evaluator_user_id')->constrained('users')->cascadeOnDelete();
            $table->string('evaluation_type');
            $table->date('period_start')->nullable();
            $table->date('period_end')->nullable();
            $table->date('evaluated_at')->nullable();
            $table->boolean('is_self_evaluation')->default(false);
            $table->decimal('total_score', 7, 2)->nullable();
            $table->decimal('weighted_score', 7, 2)->nullable();
            $table->text('general_comments')->nullable();
            $table->timestamps();

            $table->index(['intern_id', 'evaluation_type']);
            $table->index(['intern_id', 'period_start', 'period_end']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('evaluations');
    }
};
