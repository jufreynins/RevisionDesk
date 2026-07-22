<?php

namespace App\Policies;

use App\Models\User;
use App\Models\WebsiteCredential;

class WebsiteCredentialPolicy
{
    /**
     * Determine whether the user can view the credentials list for a website.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can reveal this specific credential's secret values.
     */
    public function view(User $user, WebsiteCredential $websiteCredential): bool
    {
        if ($user->isAdministrator()) {
            return true;
        }

        if ($user->isProjectManager()) {
            return $websiteCredential->website->project_manager_id === $user->id;
        }

        if ($user->isDeveloper() && $user->can_view_credentials) {
            return $websiteCredential->website->teamMembers()
                ->where('users.id', $user->id)
                ->exists();
        }

        return false;
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
    public function update(User $user, WebsiteCredential $websiteCredential): bool
    {
        if ($user->isAdministrator()) {
            return true;
        }

        return $user->isProjectManager() && $websiteCredential->website->project_manager_id === $user->id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, WebsiteCredential $websiteCredential): bool
    {
        return $this->update($user, $websiteCredential);
    }
}
