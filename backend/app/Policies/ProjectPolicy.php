<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class ProjectPolicy
{
    /**
     * Determine whether the user can assign mentors to the project.
     */
    public function assignMentor(User $user, Project $project): bool
    {
        return $user->rol === 'admin';
    }
}
