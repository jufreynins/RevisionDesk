<?php

namespace App\Policies;

use App\Models\Task;
use App\Models\User;

class TaskPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Task $task): bool
    {
        if ($user->isAdministrator()) {
            return true;
        }

        if ($user->isProjectManager()) {
            return $task->website->project_manager_id === $user->id;
        }

        return $task->assigned_to_id === $user->id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return in_array($user->role, [
            User::ROLE_ADMINISTRATOR,
            User::ROLE_PROJECT_MANAGER,
        ], true);
    }

    /**
     * Determine whether the user can fully edit the task's details.
     */
    public function update(User $user, Task $task): bool
    {
        if ($user->isAdministrator()) {
            return true;
        }

        if ($user->isProjectManager()) {
            return $task->website->project_manager_id === $user->id;
        }

        return false;
    }

    /**
     * Determine whether the user can change only the task status
     * (assigned developers may progress their own work without full edit rights).
     */
    public function updateStatus(User $user, Task $task): bool
    {
        if ($this->update($user, $task)) {
            return true;
        }

        return $user->isDeveloper() && $task->assigned_to_id === $user->id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Task $task): bool
    {
        return $user->isAdministrator();
    }

    /**
     * Determine whether the user can approve or request revision on submitted work.
     */
    public function approve(User $user, Task $task): bool
    {
        return $this->update($user, $task);
    }

    /**
     * Determine whether the user can reopen a completed/approved task.
     */
    public function reopen(User $user, Task $task): bool
    {
        return $this->update($user, $task);
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Task $task): bool
    {
        return $user->isAdministrator();
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Task $task): bool
    {
        return $user->isAdministrator();
    }
}
