<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Revision extends Model
{
    protected $table      = 'revisiones';
    protected $primaryKey = 'id_revision';
    public    $timestamps = false;

    protected $fillable = ['id_seguimiento', 'fecha_envio', 'observaciones', 'revisado'];

    protected $casts = ['revisado' => 'boolean'];

    public function seguimiento(): BelongsTo
    {
        return $this->belongsTo(Seguimiento::class, 'id_seguimiento', 'id_seguimiento');
    }

    public function documentos(): HasMany
    {
        return $this->hasMany(Documento::class, 'id_revision', 'id_revision');
    }
}
