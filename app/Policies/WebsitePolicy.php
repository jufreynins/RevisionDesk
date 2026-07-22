<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Website;

class WebsitePolicy
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
    public function view(User $user, Website $website): bool
    {
        if ($user->isAdministrator()) {
            return true;
        }

        if ($user->isProjectManager()) {
            return $website->project_manager_id === $user->id;
        }

        return $website->teamMembers()->where('users.id', $user->id)->exists();
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->isAdministrator() || $user->isProjectManager();
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Website $website): bool
    {
        if ($user->isAdministrator()) {
            return true;
        }

        return $user->isProjectManager() && $website->project_manager_id === $user->id;
    }

    /**
     * Determine whether the user can manage the assigned team on this website.
     */
    public function manageTeam(User $user, Website $website): bool
    {
        return $this->update($user, $website);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Website $website): bool
    {
        return $user->isAdministrator();
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Website $website): bool
    {
        return $user->isAdministrator();
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Website $website): bool
    {
        return $user->isAdministrator();
    }
}
