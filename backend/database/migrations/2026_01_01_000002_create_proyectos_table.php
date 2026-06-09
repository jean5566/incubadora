<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('proyectos', function (Blueprint $table) {
            $table->increments('id_proyecto');
            $table->unsignedInteger('id_usuario');
            $table->unsignedInteger('id_docente')->nullable();
            $table->string('nombre_proyecto', 200);
            $table->text('descripcion');
            $table->string('sector_tecnologico', 200)->nullable();
            $table->text('problema_resuelve')->nullable();
            $table->text('propuesta_valor')->nullable();
            $table->enum('estado', ['pendiente', 'activo', 'finalizado', 'rechazado'])->default('pendiente');
            $table->timestamp('fecha_registro')->useCurrent();

            $table->foreign('id_usuario', 'fk_proyectos_usuario')
                  ->references('id_usuario')->on('usuarios')
                  ->onDelete('cascade');

            $table->foreign('id_docente', 'fk_proyectos_docente')
                  ->references('id_usuario')->on('usuarios')
                  ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('proyectos');
    }
};
