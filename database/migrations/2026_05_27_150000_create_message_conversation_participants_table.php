<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('message_conversation_participants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('message_conversation_id')
                ->constrained()
                ->cascadeOnDelete();
            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['message_conversation_id', 'user_id'], 'conv_user_unique');
            $table->index('user_id');
        });

        // Migrar participantes existentes a la nueva tabla
        DB::table('message_conversations')->get()->each(function ($conv) {
            $participants = collect();

            if ($conv->intern_user_id) {
                $participants->push($conv->intern_user_id);
            }
            if ($conv->tutor_user_id) {
                $participants->push($conv->tutor_user_id);
            }
            if ($conv->user_id_a) {
                $participants->push($conv->user_id_a);
            }
            if ($conv->user_id_b) {
                $participants->push($conv->user_id_b);
            }

            $participants->unique()->each(function ($userId) use ($conv) {
                DB::table('message_conversation_participants')->insert([
                    'message_conversation_id' => $conv->id,
                    'user_id' => $userId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            });
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('message_conversation_participants');
    }
};
