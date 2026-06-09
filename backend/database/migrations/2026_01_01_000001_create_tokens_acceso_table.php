<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tokens_acceso', function (Blueprint $table) {
            $table->bigIncrements('id_token');
            $table->string('tipo_modelo');
            $table->unsignedBigInteger('id_modelo');
            $table->string('nombre');
            $table->string('token', 64)->unique();
            $table->text('permisos')->nullable();
            $table->timestamp('ultimo_uso')->nullable();
            $table->timestamp('expira_en')->nullable();
            $table->timestamp('creado_en')->nullable();
            $table->timestamp('actualizado_en')->nullable();

            $table->index(['tipo_modelo', 'id_modelo'], 'idx_tokenable');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tokens_acceso');
    }
};
