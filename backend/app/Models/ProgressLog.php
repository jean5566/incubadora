<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProgressLog extends Model
{
    use HasFactory;

    protected $table = 'registros_progreso';

    protected $fillable = [
        'proyecto_id',
        'usuario_id',
        'accion',
        'detalles',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class, 'proyecto_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }
}
