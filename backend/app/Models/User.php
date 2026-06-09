<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table      = 'usuarios';
    protected $primaryKey = 'id_usuario';
    public $timestamps    = false;

    protected $fillable = [
        'nombre',
        'correo',
        'clave',
        'rol',
        'estado',
        'fecha_registro',
    ];

    protected $hidden = [
        'clave',
    ];

    protected $casts = [
        'clave' => 'hashed',
    ];

    // Laravel Sanctum necesita saber el nombre del campo contraseña
    public function getAuthPasswordName(): string
    {
        return 'clave';
    }

    // Desactivar remember_token (no existe en la nueva tabla)
    public function getRememberTokenName(): ?string
    {
        return null;
    }

    // Relación con tokens usando columnas en español
    public function tokens(): MorphMany
    {
        return $this->morphMany(TokenAcceso::class, 'tokenable', 'tipo_modelo', 'id_modelo');
    }
}
