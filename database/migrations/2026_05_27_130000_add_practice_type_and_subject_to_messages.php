<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('message_conversations', function (Blueprint $table) {
            $table->foreignId('practice_type_id')
                ->nullable()
                ->after('tutor_user_id')
                ->constrained()
                ->nullOnDelete();
            $table->string('subject')
                ->nullable()
                ->after('practice_type_id');
        });

        Schema::table('messages', function (Blueprint $table) {
            $table->timestamp('edited_at')
                ->nullable()
                ->after('read_at');
        });
    }

    public function down(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->dropColumn('edited_at');
        });

        Schema::table('message_conversations', function (Blueprint $table) {
            $table->dropConstrainedForeignId('practice_type_id');
            $table->dropColumn('subject');
        });
    }
};
