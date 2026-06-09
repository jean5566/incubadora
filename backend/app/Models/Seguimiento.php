<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Seguimiento extends Model
{
    protected $table      = 'seguimientos';
    protected $primaryKey = 'id_seguimiento';
    public    $timestamps = false;

    protected $fillable = [
        'id_proyecto',
        'id_etapa',
        'id_mentor',
        'fecha_inicio',
        'fecha_fin',
    ];

    public function proyecto(): BelongsTo
    {
        return $this->belongsTo(Proyecto::class, 'id_proyecto', 'id_proyecto');
    }

    public function etapa(): BelongsTo
    {
        return $this->belongsTo(Etapa::class, 'id_etapa', 'id_etapa');
    }

    public function mentor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_mentor', 'id_usuario');
    }
}
