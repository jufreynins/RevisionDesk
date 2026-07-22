<?php

namespace App\Notifications;

use App\Models\Setting;
use App\Models\Task;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TaskEventNotification extends Notification
{
    use Queueable;

    public function __construct(
        public Task $task,
        public string $type,
        public string $message,
        public ?User $actor = null,
    ) {}

    public static function assigned(Task $task, ?User $actor): self
    {
        return new self($task, 'task_assigned', "You were assigned to {$task->ticket_number}: {$task->title}", $actor);
    }

    public static function reassigned(Task $task, ?User $actor): self
    {
        return new self($task, 'task_reassigned', "{$task->ticket_number} was reassigned to you", $actor);
    }

    public static function statusChanged(Task $task, ?User $actor, string $newStatus): self
    {
        $label = str_replace('_', ' ', $newStatus);

        return new self($task, 'status_changed', "{$task->ticket_number} status changed to {$label}", $actor);
    }

    public static function commentAdded(Task $task, ?User $actor): self
    {
        return new self($task, 'comment_added', "New comment on {$task->ticket_number}: {$task->title}", $actor);
    }

    public static function readyForReview(Task $task, ?User $actor): self
    {
        return new self($task, 'ready_for_review', "{$task->ticket_number} is ready for your review", $actor);
    }

    public static function revisionRequested(Task $task, ?User $actor): self
    {
        return new self($task, 'revision_requested', "Revision requested on {$task->ticket_number}", $actor);
    }

    public static function approved(Task $task, ?User $actor): self
    {
        return new self($task, 'approved', "{$task->ticket_number} was approved", $actor);
    }

    public static function dueSoon(Task $task): self
    {
        return new self($task, 'due_soon', "{$task->ticket_number} is due soon", null);
    }

    public static function overdue(Task $task): self
    {
        return new self($task, 'overdue', "{$task->ticket_number} is overdue", null);
    }

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        $channels = ['database'];

        if (Setting::get('email_notifications_enabled', '1') === '1') {
            $channels[] = 'mail';
        }

        return $channels;
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject($this->message)
            ->line($this->message)
            ->action('View Task', url("/tasks/{$this->task->id}"))
            ->line('Thanks for using RevisionDesk.');
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => $this->type,
            'task_id' => $this->task->id,
            'ticket_number' => $this->task->ticket_number,
            'task_title' => $this->task->title,
            'message' => $this->message,
            'actor_name' => $this->actor?->name,
        ];
    }
}
