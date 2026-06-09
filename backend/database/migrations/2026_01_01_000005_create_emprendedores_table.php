<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('emprendedores', function (Blueprint $table) {
            $table->increments('id_emprendedor');
            $table->unsignedInteger('id_usuario')->unique();
            $table->string('telefono', 20)->nullable();
            $table->string('carrera', 150)->nullable();
            $table->string('semestre', 50)->nullable();
            $table->text('bio')->nullable();
            $table->timestamp('fecha_actualizacion')->useCurrent()->useCurrentOnUpdate();

            $table->foreign('id_usuario', 'fk_emprendedores_usuario')
                  ->references('id_usuario')->on('usuarios')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('emprendedores');
    }
};
