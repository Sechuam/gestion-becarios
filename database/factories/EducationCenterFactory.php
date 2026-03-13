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
            'name' => $this->faker->company().' School ',
            'code' => 'EC-'.$this->faker->unique()->numberBetween(1000, 9999),
            'address' => $this->faker->streetAddress(),
            'city' => $this->faker->city(),
            'contact_person' => $this->faker->name(),
            'email' => $this->faker->unique()->safeEmail(),
            'phone' => $this->faker->phoneNumber(),
            'web' => $this->faker->url(),
            'contact_position' => $this->faker->jobTitle(),
        ];
    }
}
