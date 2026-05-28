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
        $token = self::token();

        return [
            'name' => 'Centro Educativo '.$token,
            'code' => 'EC-'.$token,
            'address' => random_int(1, 250).' Calle '.self::pick(['Mayor', 'Real', 'Norte', 'Sur', 'Central']),
            'city' => self::pick(['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Bilbao']),
            'contact_person' => self::pick(['Ana Garcia', 'Carlos Lopez', 'Marta Sanchez', 'Luis Martin']),
            'contact_email' => 'contacto-'.$token.'@example.test',
            'email' => 'centro-'.$token.'@example.test',
            'phone' => '+34 600 '.random_int(100, 999).' '.random_int(100, 999),
            'web' => 'https://centro-'.$token.'.example.test',
            'contact_position' => self::pick(['Direccion', 'Coordinacion', 'Secretaria', 'Jefatura de estudios']),
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
