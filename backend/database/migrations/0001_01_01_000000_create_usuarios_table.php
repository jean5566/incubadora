<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('usuarios', function (Blueprint $table) {
            $table->increments('id_usuario');
            $table->string('nombre', 150);
            $table->string('correo', 150)->unique();
            $table->string('clave', 255);
            $table->enum('rol', ['administrador', 'mentor', 'emprendedor']);
            $table->enum('estado', ['activo', 'inactivo'])->default('activo');
            $table->timestamp('fecha_registro')->nullable()->useCurrent();
        });

        Schema::create('tokens_restablecimiento', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sesiones', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->unsignedBigInteger('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sesiones');
        Schema::dropIfExists('tokens_restablecimiento');
        Schema::dropIfExists('usuarios');
    }
};
