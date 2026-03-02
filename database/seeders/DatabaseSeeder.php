<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**Seed the application's database. */
    public function run(): void
    {
        // Ejecutamos la creación de roles
        $this->call(RoleSeeder::class);

        // No vamos a crear usuarios en esta fase, solo roles
    }
}
