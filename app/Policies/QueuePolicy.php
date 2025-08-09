<?php

namespace App\Policies;

use App\Models\Queue;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class QueuePolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('view queue');
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->hasPermissionTo('add queue');
    }

    /**
     * Determine whether the user can process the queue.
     */
    public function process(User $user, Queue $queue): bool
    {
        return $user->hasPermissionTo('process queue');
    }

    /**
     * Determine whether the user can cancel the queue.
     */
    public function cancel(User $user, Queue $queue): bool
    {
        return $user->hasPermissionTo('cancel queue');
    }
}
