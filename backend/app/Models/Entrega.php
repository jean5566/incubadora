<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Proyecto;

class Entrega extends Model
{
    protected $table = 'entregas';

    protected $fillable = [
        'proyecto_id',
        'usuario_id',
        'descripcion',
        'archivo_nombre',
        'archivo_path',
    ];

    public function proyecto(): BelongsTo
    {
        return $this->belongsTo(Proyecto::class, 'proyecto_id', 'id_proyecto');
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }
}
