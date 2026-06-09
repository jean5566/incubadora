<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mentores', function (Blueprint $table) {
            $table->increments('id_mentor');
            $table->unsignedInteger('id_usuario')->unique();
            $table->string('especialidad', 255)->nullable();
            $table->timestamp('fecha_creacion')->useCurrent();
            $table->timestamp('fecha_actualizacion')->useCurrent()->useCurrentOnUpdate();

            $table->foreign('id_usuario', 'fk_mentores_usuario')
                  ->references('id_usuario')->on('usuarios')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mentores');
    }
};
