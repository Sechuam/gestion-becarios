<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class TutorSeeder extends Seeder
{
    public function run(): void
    {
        $this->syncUserIdSequence();

        $tutors = [
            ['name' => 'Laura Morales', 'email' => 'laura.morales@acme.com'],
            ['name' => 'Carlos Dominguez', 'email' => 'carlos.dominguez@acme.com'],
            ['name' => 'Maria Sanchez', 'email' => 'maria.sanchez@acme.com'],
            ['name' => 'David Herrera', 'email' => 'david.herrera@acme.com'],
            ['name' => 'Elena Ruiz', 'email' => 'elena.ruiz@acme.com'],
            ['name' => 'Javier Martin', 'email' => 'javier.martin@acme.com'],
            ['name' => 'Paula Gomez', 'email' => 'paula.gomez@acme.com'],
            ['name' => 'Sergio Navarro', 'email' => 'sergio.navarro@acme.com'],
            ['name' => 'Isabel Ortega', 'email' => 'isabel.ortega@acme.com'],
            ['name' => 'Miguel Torres', 'email' => 'miguel.torres@acme.com'],
        ];

        foreach ($tutors as $tutor) {
            $user = User::firstOrCreate(
                ['email' => $tutor['email']],
                [
                    'name' => $tutor['name'],
                    'password' => Hash::make('password123'),
                    'email_verified_at' => now(),
                ]
            );

            $user->assignRole('tutor');
        }
    }

    private function syncUserIdSequence(): void
    {
        if (DB::getDriverName() !== 'pgsql') {
            return;
        }

        DB::statement(<<<'SQL'
            SELECT setval(
                pg_get_serial_sequence('users', 'id'),
                COALESCE((SELECT MAX(id) FROM users), 1),
                (SELECT MAX(id) IS NOT NULL FROM users)
            )
        SQL);
    }
}
