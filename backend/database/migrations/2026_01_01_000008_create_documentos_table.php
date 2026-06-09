<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('documentos', function (Blueprint $table) {
            $table->increments('id_documento');
            $table->unsignedInteger('id_proyecto');
            $table->string('nombre', 200);
            $table->string('archivo', 500);
            $table->date('fecha');
            $table->unsignedInteger('id_usuario');
            // id_revision se añade en create_revisiones_table (dependencia circular)

            $table->foreign('id_proyecto')
                  ->references('id_proyecto')->on('proyectos')
                  ->onDelete('cascade');

            $table->foreign('id_usuario')
                  ->references('id_usuario')->on('usuarios')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('documentos');
    }
};
