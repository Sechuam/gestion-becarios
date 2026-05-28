<?php

namespace Database\Seeders;

use App\Models\EducationCenter;
use App\Models\Intern;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class InternSeeder extends Seeder
{
    public function run(): void
    {
        $centers = EducationCenter::orderBy('id')->get();
        $tutors = User::role('tutor')->orderBy('id')->get();

        if ($centers->isEmpty() || $tutors->isEmpty()) {
            return;
        }

        $degrees = ['DAM', 'DAW', 'ADE', 'Derecho', 'Magisterio'];
        $cities = ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Bilbao'];
        $names = [
            'Alba Romero', 'Diego Molina', 'Lucia Navarro', 'Mario Castillo',
            'Sara Vega', 'Pablo Ramos', 'Irene Ortega', 'Hugo Marin',
            'Claudia Santos', 'Adrian Gil', 'Nerea Flores', 'Jorge Campos',
            'Marta Rubio', 'Daniel Leon', 'Paula Serrano', 'Ivan Medina',
            'Elena Cruz', 'Sergio Vidal', 'Nuria Castro', 'Raul Prieto',
            'Celia Rios', 'Marcos Nieto', 'Lara Pascual', 'Victor Reyes',
            'Aitana Soler', 'Bruno Fuentes', 'Noa Herrera', 'Alex Moreno',
            'Emma Lozano', 'Joel Ibañez', 'Carla Arias', 'Lucas Cano',
            'Vera Blasco', 'Gael Pardo', 'Julia Calvo', 'Enzo Roman',
            'Olivia Saez', 'Mateo Duran', 'Ines Pastor', 'Leo Benitez',
        ];

        foreach ($names as $index => $name) {
            $number = $index + 1;
            $email = 'becario'.str_pad((string) $number, 2, '0', STR_PAD_LEFT).'@example.com';

            $user = User::updateOrCreate(
                ['email' => $email],
                [
                    'name' => $name,
                    'password' => Hash::make('password123'),
                    'email_verified_at' => now(),
                ]
            );

            $user->assignRole('intern');

            Intern::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'education_center_id' => $centers[$index % $centers->count()]->id,
                    'company_tutor_user_id' => $tutors[$index % $tutors->count()]->id,
                    'dni' => str_pad((string) (10000000 + $number), 8, '0', STR_PAD_LEFT).'A',
                    'birth_date' => now()->subYears(20 + ($index % 8))->subDays($index * 3)->toDateString(),
                    'phone' => '+34 611 '.str_pad((string) $number, 3, '0', STR_PAD_LEFT).' '.str_pad((string) (100 + $number), 3, '0', STR_PAD_LEFT),
                    'address' => ($number + 10).' Calle Demo',
                    'city' => $cities[$index % count($cities)],
                    'academic_degree' => $degrees[$index % count($degrees)],
                    'academic_year' => '2024-2025',
                    'start_date' => now()->subDays(15 + ($index % 10))->toDateString(),
                    'end_date' => now()->addMonths(3 + ($index % 4))->toDateString(),
                    'status' => 'active',
                    'tutor_name' => $tutors[$index % $tutors->count()]->name,
                    'center_tutor_name' => 'Tutor Centro '.str_pad((string) $number, 2, '0', STR_PAD_LEFT),
                    'center_tutor_email' => 'centro.tutor'.str_pad((string) $number, 2, '0', STR_PAD_LEFT).'@example.com',
                    'center_tutor_phone' => '+34 622 '.str_pad((string) $number, 3, '0', STR_PAD_LEFT).' '.str_pad((string) (200 + $number), 3, '0', STR_PAD_LEFT),
                    'total_hours' => 350 + (($index % 5) * 50),
                ]
            );
        }
    }
}
