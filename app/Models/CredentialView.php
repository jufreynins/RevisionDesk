<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CredentialView extends Model
{
    public const UPDATED_AT = null;

    protected $fillable = [
        'website_credential_id',
        'user_id',
        'ip_address',
    ];

    public function credential(): BelongsTo
    {
        return $this->belongsTo(WebsiteCredential::class, 'website_credential_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
