<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('revisiones', function (Blueprint $table) {
            $table->increments('id_revision');
            $table->unsignedInteger('id_seguimiento');
            $table->date('fecha_envio');
            $table->text('observaciones')->nullable();
            $table->boolean('revisado')->default(false);

            $table->foreign('id_seguimiento')
                  ->references('id_seguimiento')->on('seguimientos')
                  ->onDelete('cascade');
        });

        // Resuelve la dependencia circular: documentos → revisiones
        Schema::table('documentos', function (Blueprint $table) {
            $table->unsignedInteger('id_revision')->nullable()->after('id_usuario');

            $table->foreign('id_revision')
                  ->references('id_revision')->on('revisiones')
                  ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('documentos', function (Blueprint $table) {
            $table->dropForeign(['id_revision']);
            $table->dropColumn('id_revision');
        });

        Schema::dropIfExists('revisiones');
    }
};
