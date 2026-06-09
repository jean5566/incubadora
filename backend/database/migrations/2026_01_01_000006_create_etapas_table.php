<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('etapas', function (Blueprint $table) {
            $table->increments('id_etapa');
            $table->string('nombre_etapa', 100);
            $table->unsignedTinyInteger('orden_etapa');
        });

        DB::table('etapas')->insert([
            ['nombre_etapa' => 'Ideación',     'orden_etapa' => 1],
            ['nombre_etapa' => 'Validación',   'orden_etapa' => 2],
            ['nombre_etapa' => 'Prototipo',    'orden_etapa' => 3],
            ['nombre_etapa' => 'Incubación',   'orden_etapa' => 4],
            ['nombre_etapa' => 'Escalamiento', 'orden_etapa' => 5],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('etapas');
    }
};
