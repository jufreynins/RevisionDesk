<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Task extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'ticket_number',
        'title',
        'website_id',
        'page_url',
        'task_type',
        'description',
        'priority',
        'status',
        'assigned_to_id',
        'due_date',
        'estimated_minutes',
        'internal_notes',
        'related_task_id',
        'is_recurring',
        'recurrence_rule',
        'page_name',
        'page_section',
        'current_issue',
        'requested_change',
        'expected_result',
        'steps_to_reproduce',
        'screenshot_before_path',
        'reference_image_path',
        'client_deadline',
        'submitted_for_review_at',
        'approved_at',
        'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'due_date' => 'date',
            'client_deadline' => 'date',
            'is_recurring' => 'boolean',
            'submitted_for_review_at' => 'datetime',
            'approved_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Task $task) {
            if (empty($task->ticket_number)) {
                $task->ticket_number = static::generateTicketNumber();
            }
        });
    }

    public static function generateTicketNumber(): string
    {
        $prefix = Setting::get('ticket_number_prefix', 'WEB');

        $maxNumber = static::withTrashed()
            ->where('ticket_number', 'like', $prefix.'-%')
            ->lockForUpdate()
            ->pluck('ticket_number')
            ->map(fn (string $ticketNumber) => (int) substr($ticketNumber, strlen($prefix) + 1))
            ->max() ?? 0;

        return $prefix.'-'.str_pad((string) ($maxNumber + 1), 4, '0', STR_PAD_LEFT);
    }

    public function website(): BelongsTo
    {
        return $this->belongsTo(Website::class);
    }

    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to_id');
    }

    public function relatedTask(): BelongsTo
    {
        return $this->belongsTo(Task::class, 'related_task_id');
    }

    public function comments(): HasMany
    {
        return $this->hasMany(TaskComment::class)->orderBy('created_at');
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(TaskAttachment::class);
    }

    public function checklistItems(): HasMany
    {
        return $this->hasMany(TaskChecklistItem::class)->orderBy('sort_order');
    }

    public function timeEntries(): HasMany
    {
        return $this->hasMany(TaskTimeEntry::class);
    }

    public function activities(): HasMany
    {
        return $this->hasMany(TaskActivity::class)->orderByDesc('created_at');
    }

    public function checklistProgressLabel(): string
    {
        $total = $this->checklistItems->count();
        $completed = $this->checklistItems->where('is_completed', true)->count();

        return "{$completed} of {$total} completed";
    }

    public function totalMinutesSpent(): int
    {
        return (int) $this->timeEntries()->sum('minutes_spent');
    }

    public function isOverdue(): bool
    {
        return $this->due_date !== null
            && $this->due_date->isPast()
            && ! in_array($this->status, ['completed', 'cancelled'], true);
    }
}
