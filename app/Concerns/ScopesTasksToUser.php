<?php

namespace App\Concerns;

use App\Models\User;
use Illuminate\Database\Eloquent\Builder;

trait ScopesTasksToUser
{
    private function scopeToVisibleTasks(Builder $query, User $user): void
    {
        if ($user->isProjectManager()) {
            $query->whereHas('website', fn ($q) => $q->where('project_manager_id', $user->id));
        } elseif ($user->isDeveloper()) {
            $query->where(function ($q) use ($user) {
                $q->where('assigned_to_id', $user->id)->orWhere('requester_id', $user->id);
            });
        } elseif ($user->isClient()) {
            $query->where('requester_id', $user->id);
        }
    }
}
