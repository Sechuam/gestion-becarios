<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // SQLite doesn't support ALTER COLUMN, so we need to recreate the table
        Schema::dropIfExists('messages');
        Schema::dropIfExists('message_conversations');

        Schema::create('message_conversations', function (Blueprint $table) {
            $table->id();
            // Keep intern/tutor for backward compatibility but make nullable
            $table->foreignId('intern_user_id')
                ->nullable()
                ->constrained('users')
                ->cascadeOnDelete();
            $table->foreignId('tutor_user_id')
                ->nullable()
                ->constrained('users')
                ->cascadeOnDelete();
            // New generic user references for peer/group conversations
            $table->foreignId('user_id_a')
                ->nullable()
                ->constrained('users')
                ->cascadeOnDelete();
            $table->foreignId('user_id_b')
                ->nullable()
                ->constrained('users')
                ->cascadeOnDelete();
            // Practice type for forum-like grouping
            $table->foreignId('practice_type_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();
            $table->string('subject')->nullable();
            $table->timestamp('last_message_at')->nullable();
            $table->timestamps();
        });

        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('message_conversation_id')
                ->constrained()
                ->cascadeOnDelete();
            $table->foreignId('sender_user_id')
                ->constrained('users')
                ->cascadeOnDelete();
            $table->text('body');
            $table->timestamp('read_at')->nullable();
            $table->timestamp('edited_at')->nullable();
            $table->timestamps();

            $table->index(['message_conversation_id', 'created_at']);
            $table->index(['sender_user_id', 'created_at']);
        });
    }

    public function down(): void
    {
        // This would be destructive, but we're already past the point of no return
    }
};
