<?php

namespace App\Console\Commands;

use App\Models\Task;
use App\Services\TaskNotifier;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

class SendTaskDueDateNotifications extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:send-task-due-date-notifications';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Notify assigned developers about tasks due tomorrow or newly overdue';

    public function handle(TaskNotifier $notifier): int
    {
        $openStatuses = ['new', 'assigned', 'in_progress', 'waiting_for_client', 'blocked', 'ready_for_review', 'revision_needed'];

        $dueTomorrow = Task::whereDate('due_date', Carbon::tomorrow())
            ->whereIn('status', $openStatuses)
            ->whereNotNull('assigned_to_id')
            ->get();

        foreach ($dueTomorrow as $task) {
            $notifier->dueSoon($task);
        }

        $newlyOverdue = Task::whereDate('due_date', Carbon::yesterday())
            ->whereIn('status', $openStatuses)
            ->whereNotNull('assigned_to_id')
            ->get();

        foreach ($newlyOverdue as $task) {
            $notifier->overdue($task);
        }

        $this->info(sprintf(
            'Sent %d due-soon and %d overdue notifications.',
            $dueTomorrow->count(),
            $newlyOverdue->count()
        ));

        return self::SUCCESS;
    }
}
