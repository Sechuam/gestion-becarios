<?php

namespace Database\Factories;

use Faker\Factory as FakerFactory;
use Faker\Generator;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Intern>
 */
class InternFactory extends Factory
{
    private static ?Generator $generator = null;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $faker = self::$generator ??= FakerFactory::create(config('app.faker_locale', 'en_US'));

        return [
            'user_id' => \App\Models\User::factory(),
            'education_center_id' => \App\Models\EducationCenter::inRandomOrder()->first()->id,

            'dni' => $faker->unique()->bothify('#########?'),
            'birth_date' => $faker->date('Y-m-d', '-18 years'),
            'phone' => $faker->phoneNumber(),
            'address' => $faker->address(),
            'city' => $faker->city(),

            'academic_degree' => $faker->randomElement(['DAM', 'DAW', 'ADE', 'Derecho', 'Magisterio']),
            'academic_year' => '2024-2025',

            'start_date' => now()->addDays(rand(1, 30)),
            'end_date' => now()->addMonths(rand(3, 6)),
            'status' => $faker->randomElement(['active', 'completed', 'abandoned']),
            'tutor_name' => $faker->name(),
        ];
    }
}
