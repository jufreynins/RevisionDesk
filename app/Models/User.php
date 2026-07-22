<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, SoftDeletes;

    public const ROLE_ADMINISTRATOR = 'administrator';

    public const ROLE_PROJECT_MANAGER = 'project_manager';

    public const ROLE_DEVELOPER = 'developer';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'avatar',
        'phone',
        'is_active',
        'can_view_credentials',
        'has_completed_tour',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
            'can_view_credentials' => 'boolean',
            'has_completed_tour' => 'boolean',
        ];
    }

    public function isAdministrator(): bool
    {
        return $this->role === self::ROLE_ADMINISTRATOR;
    }

    public function isProjectManager(): bool
    {
        return $this->role === self::ROLE_PROJECT_MANAGER;
    }

    public function isDeveloper(): bool
    {
        return $this->role === self::ROLE_DEVELOPER;
    }

    public function websites(): BelongsToMany
    {
        return $this->belongsToMany(Website::class, 'website_user');
    }

    public function managedWebsites(): HasMany
    {
        return $this->hasMany(Website::class, 'project_manager_id');
    }

    public function assignedTasks(): HasMany
    {
        return $this->hasMany(Task::class, 'assigned_to_id');
    }

    public function comments(): HasMany
    {
        return $this->hasMany(TaskComment::class);
    }

    public function timeEntries(): HasMany
    {
        return $this->hasMany(TaskTimeEntry::class);
    }

    public function savedFilters(): HasMany
    {
        return $this->hasMany(SavedFilter::class);
    }
}
