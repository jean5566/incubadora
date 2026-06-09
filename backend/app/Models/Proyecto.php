<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Proyecto extends Model
{
    protected $table      = 'proyectos';
    protected $primaryKey = 'id_proyecto';
    public    $timestamps = false;

    protected $fillable = [
        'id_usuario',
        'id_docente',
        'nombre_proyecto',
        'descripcion',
        'sector_tecnologico',
        'problema_resuelve',
        'propuesta_valor',
        'estado',
    ];

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_usuario', 'id_usuario');
    }

    public function docente(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_docente', 'id_usuario');
    }

    public function asignaciones(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(\App\Models\Asignacion::class, 'id_proyecto', 'id_proyecto');
    }

    public function seguimientos(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(\App\Models\Seguimiento::class, 'id_proyecto', 'id_proyecto');
    }
}
