<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::firstOrCreate(
            ['correo' => env('ADMIN_SEED_EMAIL', 'admin@unesum.edu.ec')],
            [
                'nombre' => 'Administrador',
                'clave'  => env('ADMIN_SEED_PASSWORD', 'Inc4bad0ra#Admin2026'),
                'rol'    => 'administrador',
            ]
        );
    }
}
