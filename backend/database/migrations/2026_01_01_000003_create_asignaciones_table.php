<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('asignaciones', function (Blueprint $table) {
            $table->increments('id_asignacion');
            $table->unsignedInteger('id_proyecto');
            $table->unsignedInteger('id_usuario');
            $table->timestamp('fecha')->nullable()->useCurrent();
            $table->enum('activo', ['si', 'no'])->default('si');

            $table->foreign('id_proyecto', 'fk_asignaciones_proyecto')
                  ->references('id_proyecto')->on('proyectos')
                  ->onDelete('cascade');

            $table->foreign('id_usuario', 'fk_asignaciones_usuario')
                  ->references('id_usuario')->on('usuarios')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('asignaciones');
    }
};
