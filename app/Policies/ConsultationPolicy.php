<?php

namespace App\Policies;

use App\Models\Consultation;
use App\Models\User;

class ConsultationPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('view consultation');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Consultation $consultation): bool
    {
        return $user->hasPermissionTo('view consultation');
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // Only clinic assistants can create consultations via queue
        return $user->hasPermissionTo('add queue');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Consultation $consultation): bool
    {
        // Only doctors can update consultations (process, complete, etc.)
        return $user->hasPermissionTo('process queue');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Consultation $consultation): bool
    {
        // Only doctors can delete consultations
        return $user->hasPermissionTo('process queue');
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Consultation $consultation): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Consultation $consultation): bool
    {
        return false;
    }
}
