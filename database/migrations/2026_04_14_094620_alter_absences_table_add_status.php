<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('absences', function (Blueprint $table) {
            // Quitamos el booleano simple
            $table->dropColumn('is_approved');
            // Añadimos nuestro estado con enumeraciones de texto
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending')->after('reason');
        });
    }

    public function down(): void
    {
        Schema::table('absences', function (Blueprint $table) {
            $table->dropColumn('status');
            $table->boolean('is_approved')->default(false);
        });
    }
};
