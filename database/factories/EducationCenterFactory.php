<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\EducationCenter>
 */
class EducationCenterFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->company().' School ',
            'code' => 'EC-'.fake()->unique()->numberBetween(1000, 9999),
            'address' => fake()->streetAddress(),
            'city' => fake()->city(),
            'contact_person' => fake()->name(),
            'contact_email' => fake()->unique()->safeEmail(),
            'email' => fake()->unique()->safeEmail(),
            'phone' => fake()->phoneNumber(),
            'web' => fake()->url(),
            'contact_position' => fake()->jobTitle(),
        ];
    }
}
