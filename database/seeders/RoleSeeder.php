<?php

namespace Database\Seeders; // Le dice a Laravel donde está guardado el archivo

use Illuminate\Database\Seeder; // Importa herramientas básicas 
use Spatie\Permission\Models\Role; // dice que estamos usando el modelo Role de Spatie

class RoleSeeder extends Seeder
{

    /** Run the database seeds. */
    public function run(): void
    {
        // Creamos los tres roles definidos en la fase 1
        Role::create(['name' => 'admin']);
        Role::create(['name' => 'tutor']);
        Role::create(['name' => 'intern']);
    }
}