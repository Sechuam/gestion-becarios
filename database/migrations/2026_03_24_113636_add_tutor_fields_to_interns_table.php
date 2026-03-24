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
        Schema::table('interns', function (Blueprint $table) {
            $table->string('center_tutor_name')->nullable()->after('tutor_name');
            $table->string('center_tutor_email')->nullable()->after('center_tutor_name');
            $table->string('center_tutor_phone')->nullable()->after('center_tutor_email');

            $table->foreignId('company_tutor_user_id')
            ->nullable()
            ->constrained('users')
            ->nullOnDelete()
            ->after('center_tutor_phone');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('interns', function (Blueprint $table) {
            $table->dropForeign(['company_tutor_user_id']);
            $table->dropColumn([
                'center_tutor_name',
                'center_tutor_email',
                'center_tutor_phone',
                'company_tutor_user_id',
            ]);
        });
    }
};
