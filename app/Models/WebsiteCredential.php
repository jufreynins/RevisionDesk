<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WebsiteCredential extends Model
{
    use HasFactory;

    protected $fillable = [
        'website_id',
        'label',
        'login_url',
        'username',
        'password',
        'notes',
        'created_by_id',
    ];

    /**
     * Username and password are encrypted at rest and are never
     * included when the model is serialized to an API response.
     */
    protected $hidden = [
        'username',
        'password',
    ];

    protected function casts(): array
    {
        return [
            'username' => 'encrypted',
            'password' => 'encrypted',
        ];
    }

    public function website(): BelongsTo
    {
        return $this->belongsTo(Website::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_id');
    }

    public function views(): HasMany
    {
        return $this->hasMany(CredentialView::class);
    }
}
