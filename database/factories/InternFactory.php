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
        return [
            'user_id' => \App\Models\User::factory(),
            'education_center_id' => \App\Models\EducationCenter::inRandomOrder()->first()->id,

            'dni' => fake()->unique()->bothify('#########?'),
            'birth_date' => fake()->date('Y-m-d', '-18 years'),
            'phone' => fake()->phoneNumber(),
            'address' => fake()->address(),
            'city' => fake()->city(),

            'academic_degree' => fake()->randomElement(['DAM', 'DAW', 'ADE', 'Derecho', 'Magisterio']),
            'academic_year' => '2024-2025',

            'start_date' => now()->addDays(rand(1, 30)),
            'end_date' => now()->addMonths(rand(3, 6)),
            'status' => fake()->randomElement(['active', 'completed', 'abandoned']),
            'tutor_name' => fake()->name(),
        ];
    }
}
