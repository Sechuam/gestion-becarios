<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('message_conversations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('intern_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('tutor_user_id')->constrained('users')->cascadeOnDelete();
            $table->timestamp('last_message_at')->nullable();
            $table->timestamps();

            $table->unique(['intern_user_id', 'tutor_user_id']);
            $table->index(['tutor_user_id', 'last_message_at']);
            $table->index(['intern_user_id', 'last_message_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('message_conversations');
    }
};
