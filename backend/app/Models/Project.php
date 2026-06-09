<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Project extends Model
{
    use HasFactory;

    const STAGES = [
        'Ideación',
        'Validación',
        'Prototipo',
        'Incubación',
        'Escalamiento',
    ];

    protected $table      = 'proyectos';
    protected $primaryKey = 'id_proyecto';
    public $timestamps    = false;

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

    public function entrepreneur(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_usuario', 'id_usuario');
    }

    /**
     * The mentors assigned to this project.
     */
    public function mentors(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'mentorias', 'proyecto_id', 'mentor_id')->withTimestamps();
    }

    /**
     * The progress logs of this project.
     */
    public function progressLogs(): HasMany
    {
        return $this->hasMany(ProgressLog::class, 'proyecto_id');
    }

    public function entregas(): HasMany
    {
        return $this->hasMany(Entrega::class, 'proyecto_id');
    }

    /**
     * Advances the project to the next stage if possible.
     */
    public function advanceStage(?User $user = null): bool
    {
        $currentIndex = array_search($this->etapa, self::STAGES);

        if ($currentIndex !== false && $currentIndex < count(self::STAGES) - 1) {
            $nextStage = self::STAGES[$currentIndex + 1];

            $this->etapa = $nextStage;
            $this->save();

            // Log the transition
            $this->progressLogs()->create([
                'usuario_id' => $user ? $user->id : null,
                'accion' => 'Etapa Avanzada',
                'detalles' => "Proyecto avanzó a la etapa {$nextStage}.",
            ]);

            return true;
        }

        return false;
    }
}
