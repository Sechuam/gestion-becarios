<?php

namespace Database\Seeders; // Le dice a Laravel donde está guardado el archivo

use Illuminate\Database\Seeder; // Importa herramientas básicas
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role; // dice que estamos usando el modelo Role de Spatie

class RoleSeeder extends Seeder
{
    /** Run the database seeds. */
    public function run(): void
    {
        // Crear permisos
        Permission::create(['name' => 'manage schools']);

        // Creamos los tres roles definidos en la fase 1
        $admin = Role::firstOrCreate(['name' => 'admin']);
        Role::firstOrCreate(['name' => 'tutor']);
        Role::firstOrCreate(['name' => 'intern']);

        // Asignar permisos
        $admin->givePermissionTo('manage schools');
    }
}
