<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\User;

class Emprendedor extends Model
{
    protected $table      = 'emprendedores';
    protected $primaryKey = 'id_emprendedor';
    public    $timestamps = false;

    protected $fillable = [
        'id_usuario',
        'telefono',
        'carrera',
        'semestre',
        'bio',
    ];

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_usuario', 'id_usuario');
    }
}
