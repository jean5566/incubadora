<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notificaciones', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('id_usuario');
            $table->string('tipo', 50);
            $table->string('mensaje', 500);
            $table->string('url', 255)->nullable();
            $table->boolean('leida')->default(false);
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('id_usuario', 'fk_notificaciones_usuario')
                  ->references('id_usuario')->on('usuarios')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notificaciones');
    }
};
