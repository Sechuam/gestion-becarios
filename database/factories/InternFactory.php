<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Intern>
 */
class InternFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $token = self::token();

        return [
            'user_id' => \App\Models\User::factory(),
            'education_center_id' => \App\Models\EducationCenter::inRandomOrder()->first()->id,

            'dni' => 'DNI'.$token,
            'birth_date' => now()->subYears(random_int(18, 30))->subDays(random_int(0, 365))->toDateString(),
            'phone' => '+34 600 '.random_int(100, 999).' '.random_int(100, 999),
            'address' => random_int(1, 250).' Calle '.self::pick(['Mayor', 'Real', 'Norte', 'Sur', 'Central']),
            'city' => self::pick(['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Bilbao']),

            'academic_degree' => self::pick(['DAM', 'DAW', 'ADE', 'Derecho', 'Magisterio']),
            'academic_year' => '2024-2025',

            'start_date' => now()->addDays(rand(1, 30)),
            'end_date' => now()->addMonths(rand(3, 6)),
            'status' => self::pick(['active', 'completed', 'abandoned']),
            'tutor_name' => self::pick(['Ana Garcia', 'Carlos Lopez', 'Marta Sanchez', 'Luis Martin']),
        ];
    }

    private static function token(): string
    {
        return strtoupper(bin2hex(random_bytes(4)));
    }

    /**
     * @template T
     *
     * @param  array<int, T>  $items
     * @return T
     */
    private static function pick(array $items): mixed
    {
        return $items[array_rand($items)];
    }
}
