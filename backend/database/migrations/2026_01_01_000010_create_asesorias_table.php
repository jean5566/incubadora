<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('asesorias', function (Blueprint $table) {
            $table->increments('id_asesoria');
            $table->unsignedInteger('id_seguimiento');
            $table->string('titulo', 200);
            $table->text('descripcion')->nullable();
            $table->date('fecha');
            $table->time('hora_inicio');
            $table->time('hora_fin')->nullable();
            $table->enum('modalidad', ['virtual', 'presencial'])->default('virtual');
            $table->string('enlace', 500)->nullable();
            $table->string('lugar', 300)->nullable();
            $table->enum('estado', ['programada', 'realizada', 'cancelada'])->default('programada');
            $table->text('notas')->nullable();

            $table->foreign('id_seguimiento', 'fk_asesorias_seguimiento')
                  ->references('id_seguimiento')->on('seguimientos')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('asesorias');
    }
};
