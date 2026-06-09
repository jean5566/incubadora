<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Documento extends Model
{
    protected $table      = 'documentos';
    protected $primaryKey = 'id_documento';
    public    $timestamps = false;

    protected $fillable = [
        'id_proyecto',
        'id_revision',
        'id_usuario',
        'nombre',
        'archivo',
        'fecha',
    ];

    public function proyecto(): BelongsTo
    {
        return $this->belongsTo(Proyecto::class, 'id_proyecto', 'id_proyecto');
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_usuario', 'id_usuario');
    }
}
