<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('task_comments', function (Blueprint $table) {
            $table->foreignId('parent_id')
                ->nullable()
                ->after('user_id')
                ->constrained('task_comments')
                ->nullOnDelete();
            $table->timestamp('edited_at')->nullable()->after('comment');
        });

        Schema::table('tasks', function (Blueprint $table) {
            $table->text('reject_reason')->nullable()->after('description');
            $table->unsignedInteger('kanban_position')->nullable()->after('reject_reason');
        });

        Schema::table('task_status_logs', function (Blueprint $table) {
            $table->text('reason')->nullable()->after('to_status');
        });

        Schema::table('interns', function (Blueprint $table) {
            $table->foreignId('internal_notes_updated_by')
                ->nullable()
                ->after('internal_notes')
                ->constrained('users')
                ->nullOnDelete();
            $table->timestamp('internal_notes_updated_at')
                ->nullable()
                ->after('internal_notes_updated_by');
        });

        Schema::table('education_centers', function (Blueprint $table) {
            $table->foreignId('internal_notes_updated_by')
                ->nullable()
                ->after('internal_notes')
                ->constrained('users')
                ->nullOnDelete();
            $table->timestamp('internal_notes_updated_at')
                ->nullable()
                ->after('internal_notes_updated_by');
        });
    }

    public function down(): void
    {
        Schema::table('education_centers', function (Blueprint $table) {
            $table->dropForeign(['internal_notes_updated_by']);
            $table->dropColumn(['internal_notes_updated_by', 'internal_notes_updated_at']);
        });

        Schema::table('interns', function (Blueprint $table) {
            $table->dropForeign(['internal_notes_updated_by']);
            $table->dropColumn(['internal_notes_updated_by', 'internal_notes_updated_at']);
        });

        Schema::table('task_status_logs', function (Blueprint $table) {
            $table->dropColumn('reason');
        });

        Schema::table('tasks', function (Blueprint $table) {
            $table->dropColumn(['reject_reason', 'kanban_position']);
        });

        Schema::table('task_comments', function (Blueprint $table) {
            $table->dropForeign(['parent_id']);
            $table->dropColumn(['parent_id', 'edited_at']);
        });
    }
};
