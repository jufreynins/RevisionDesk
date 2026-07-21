<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Website extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'url',
        'client_name',
        'website_type',
        'platform',
        'hosting_provider',
        'project_manager_id',
        'status',
        'thumbnail_path',
        'notes',
    ];

    public function projectManager(): BelongsTo
    {
        return $this->belongsTo(User::class, 'project_manager_id');
    }

    public function teamMembers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'website_user');
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class);
    }

    public function credentials(): HasMany
    {
        return $this->hasMany(WebsiteCredential::class);
    }

    public function openTasks(): HasMany
    {
        return $this->tasks()->whereNotIn('status', ['completed', 'cancelled']);
    }

    public function completedTasks(): HasMany
    {
        return $this->tasks()->where('status', 'completed');
    }
}
