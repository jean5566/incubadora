<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Asesoria extends Model
{
    protected $table      = 'asesorias';
    protected $primaryKey = 'id_asesoria';
    public    $timestamps = false;

    protected $fillable = [
        'id_seguimiento',
        'titulo',
        'descripcion',
        'fecha',
        'hora_inicio',
        'hora_fin',
        'modalidad',
        'enlace',
        'lugar',
        'estado',
        'notas',
    ];

    public function seguimiento(): BelongsTo
    {
        return $this->belongsTo(Seguimiento::class, 'id_seguimiento', 'id_seguimiento');
    }
}
