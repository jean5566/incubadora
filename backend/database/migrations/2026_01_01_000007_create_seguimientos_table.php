<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('seguimientos', function (Blueprint $table) {
            $table->increments('id_seguimiento');
            $table->unsignedInteger('id_proyecto');
            $table->unsignedInteger('id_etapa');
            $table->date('fecha_inicio');
            $table->date('fecha_fin')->nullable();
            $table->unsignedInteger('id_mentor');

            $table->foreign('id_proyecto')
                  ->references('id_proyecto')->on('proyectos')
                  ->onDelete('cascade');

            $table->foreign('id_etapa')
                  ->references('id_etapa')->on('etapas');

            $table->foreign('id_mentor')
                  ->references('id_usuario')->on('usuarios')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('seguimientos');
    }
};
