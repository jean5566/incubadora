<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'nombre' => 'Administrador',
            'correo' => 'admin@uniincubadora.edu.ec',
            'clave'  => 'password1234',
            'rol'    => 'administrador',
        ]);
    }
}
