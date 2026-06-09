<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class Mentorship extends Pivot
{
    protected $table = 'mentorias';

    protected $fillable = [
        'proyecto_id',
        'mentor_id',
    ];
}
