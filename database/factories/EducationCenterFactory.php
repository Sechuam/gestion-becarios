<?php

namespace Database\Factories;

use Faker\Factory as FakerFactory;
use Faker\Generator;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\EducationCenter>
 */
class EducationCenterFactory extends Factory
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
            'name' => $faker->company().' School ',
            'code' => 'EC-'.$faker->unique()->numberBetween(1000, 9999),
            'address' => $faker->streetAddress(),
            'city' => $faker->city(),
            'contact_person' => $faker->name(),
            'contact_email' => $faker->unique()->safeEmail(),
            'email' => $faker->unique()->safeEmail(),
            'phone' => $faker->phoneNumber(),
            'web' => $faker->url(),
            'contact_position' => $faker->jobTitle(),
        ];
    }
}
