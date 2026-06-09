<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Etapa extends Model
{
    protected $table      = 'etapas';
    protected $primaryKey = 'id_etapa';
    public    $timestamps = false;

    protected $fillable = ['nombre_etapa', 'orden_etapa'];
}
