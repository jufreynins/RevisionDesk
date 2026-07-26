<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FeatureRequest extends Model
{
    protected $fillable = [
        'user_id',
        'type',
        'message',
        'page_url',
        'screenshot_path',
        'status',
    ];

    protected $appends = ['screenshot_url'];

    public function getScreenshotUrlAttribute(): ?string
    {
        return $this->screenshot_path ? asset('storage/'.$this->screenshot_path) : null;
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
