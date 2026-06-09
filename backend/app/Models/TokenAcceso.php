<?php

namespace App\Models;

use Laravel\Sanctum\PersonalAccessToken;

class TokenAcceso extends PersonalAccessToken
{
    protected $table      = 'tokens_acceso';
    protected $primaryKey = 'id_token';

    const CREATED_AT = 'creado_en';
    const UPDATED_AT = 'actualizado_en';

    protected $casts = [
        'permisos'   => 'json',
        'ultimo_uso' => 'datetime',
        'expira_en'  => 'datetime',
    ];

    // ── name ↔ nombre ─────────────────────────────────────────────────────────
    public function getNameAttribute()
    {
        return $this->attributes['nombre'] ?? null;
    }
    public function setNameAttribute($value)
    {
        $this->attributes['nombre'] = $value;
    }

    // ── abilities ↔ permisos ──────────────────────────────────────────────────
    public function getAbilitiesAttribute()
    {
        return $this->permisos ?? [];
    }
    public function setAbilitiesAttribute($value)
    {
        $this->attributes['permisos'] = is_array($value) ? json_encode($value) : $value;
    }

    // ── last_used_at ↔ ultimo_uso ─────────────────────────────────────────────
    public function getLastUsedAtAttribute()
    {
        return $this->attributes['ultimo_uso'] ?? null;
    }
    public function setLastUsedAtAttribute($value)
    {
        $this->attributes['ultimo_uso'] = $value;
    }

    // ── expires_at ↔ expira_en ────────────────────────────────────────────────
    public function getExpiresAtAttribute()
    {
        return $this->attributes['expira_en'] ?? null;
    }
    public function setExpiresAtAttribute($value)
    {
        $this->attributes['expira_en'] = $value;
    }

    // ── tokenable_type ↔ tipo_modelo ──────────────────────────────────────────
    public function getTokenableTypeAttribute()
    {
        return $this->attributes['tipo_modelo'] ?? null;
    }
    public function setTokenableTypeAttribute($value)
    {
        $this->attributes['tipo_modelo'] = $value;
    }

    // ── tokenable_id ↔ id_modelo ──────────────────────────────────────────────
    public function getTokenableIdAttribute()
    {
        return $this->attributes['id_modelo'] ?? null;
    }
    public function setTokenableIdAttribute($value)
    {
        $this->attributes['id_modelo'] = $value;
    }

    // ── Relación polimórfica con columnas en español ───────────────────────────
    public function tokenable()
    {
        return $this->morphTo('tokenable', 'tipo_modelo', 'id_modelo');
    }

    // ── Búsqueda del token (Sanctum lo llama internamente) ────────────────────
    public static function findToken($token)
    {
        if (!str_contains($token, '|')) {
            return static::where('token', hash('sha256', $token))->first();
        }

        [$id, $raw] = explode('|', $token, 2);
        $instance   = static::find($id);

        if ($instance && hash_equals($instance->token, hash('sha256', $raw))) {
            return $instance;
        }

        return null;
    }

    // ── Verificar permisos ────────────────────────────────────────────────────
    public function can($ability)
    {
        $permisos = $this->permisos ?? [];
        return in_array('*', $permisos) || in_array($ability, $permisos);
    }

    public function cant($ability)
    {
        return !$this->can($ability);
    }
}
