<?php

use App\Models\EducationCenter;
use App\Models\Intern;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('internal_notes', function (Blueprint $table) {
            $table->id();
            $table->morphs('notable');
            $table->foreignId('user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->text('content');
            $table->timestamp('edited_at')->nullable();
            $table->timestamps();
        });

        $this->migrateLegacyInternNotes();
        $this->migrateLegacyEducationCenterNotes();
    }

    public function down(): void
    {
        Schema::dropIfExists('internal_notes');
    }

    private function migrateLegacyInternNotes(): void
    {
        DB::table('interns')
            ->whereNotNull('internal_notes')
            ->where('internal_notes', '!=', '')
            ->orderBy('id')
            ->chunkById(100, function ($interns) {
                $rows = $interns->map(function ($intern) {
                    $timestamp = $intern->internal_notes_updated_at
                        ?? $intern->updated_at
                        ?? $intern->created_at
                        ?? now();

                    return [
                        'notable_type' => Intern::class,
                        'notable_id' => $intern->id,
                        'user_id' => $intern->internal_notes_updated_by,
                        'content' => $intern->internal_notes,
                        'edited_at' => null,
                        'created_at' => $timestamp,
                        'updated_at' => $timestamp,
                    ];
                })->all();

                if ($rows !== []) {
                    DB::table('internal_notes')->insert($rows);
                }
            });
    }

    private function migrateLegacyEducationCenterNotes(): void
    {
        DB::table('education_centers')
            ->whereNotNull('internal_notes')
            ->where('internal_notes', '!=', '')
            ->orderBy('id')
            ->chunkById(100, function ($centers) {
                $rows = $centers->map(function ($center) {
                    $timestamp = $center->internal_notes_updated_at
                        ?? $center->updated_at
                        ?? $center->created_at
                        ?? now();

                    return [
                        'notable_type' => EducationCenter::class,
                        'notable_id' => $center->id,
                        'user_id' => $center->internal_notes_updated_by,
                        'content' => $center->internal_notes,
                        'edited_at' => null,
                        'created_at' => $timestamp,
                        'updated_at' => $timestamp,
                    ];
                })->all();

                if ($rows !== []) {
                    DB::table('internal_notes')->insert($rows);
                }
            });
    }
};
