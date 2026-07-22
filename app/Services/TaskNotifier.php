<?php

namespace App\Services;

use App\Models\Task;
use App\Models\User;
use App\Notifications\TaskEventNotification;
use Illuminate\Support\Facades\Notification;

class TaskNotifier
{
    public function assigned(Task $task, User $actor): void
    {
        $this->notify($task->assignedTo, $actor, TaskEventNotification::assigned($task, $actor));
    }

    public function reassigned(Task $task, User $actor): void
    {
        $this->notify($task->assignedTo, $actor, TaskEventNotification::reassigned($task, $actor));
    }

    public function statusChanged(Task $task, User $actor, string $newStatus): void
    {
        $notification = TaskEventNotification::statusChanged($task, $actor, $newStatus);

        $this->notify($task->requester, $actor, $notification);
        $this->notify($task->assignedTo, $actor, $notification);
    }

    public function commentAdded(Task $task, User $actor, bool $isInternal): void
    {
        $notification = TaskEventNotification::commentAdded($task, $actor);

        $this->notify($task->assignedTo, $actor, $notification);

        if (! $isInternal) {
            $this->notify($task->requester, $actor, $notification);
        }
    }

    public function readyForReview(Task $task, User $actor): void
    {
        $projectManager = $task->website?->projectManager;
        $this->notify($projectManager, $actor, TaskEventNotification::readyForReview($task, $actor));
    }

    public function revisionRequested(Task $task, User $actor): void
    {
        $this->notify($task->assignedTo, $actor, TaskEventNotification::revisionRequested($task, $actor));
    }

    public function approved(Task $task, User $actor): void
    {
        $notification = TaskEventNotification::approved($task, $actor);

        $this->notify($task->assignedTo, $actor, $notification);
        $this->notify($task->requester, $actor, $notification);
    }

    public function dueSoon(Task $task): void
    {
        if ($task->assignedTo) {
            Notification::send($task->assignedTo, TaskEventNotification::dueSoon($task));
        }
    }

    public function overdue(Task $task): void
    {
        if ($task->assignedTo) {
            Notification::send($task->assignedTo, TaskEventNotification::overdue($task));
        }
    }

    private function notify(?User $recipient, User $actor, TaskEventNotification $notification): void
    {
        if ($recipient === null || $recipient->id === $actor->id) {
            return;
        }

        Notification::send($recipient, $notification);
    }
}
