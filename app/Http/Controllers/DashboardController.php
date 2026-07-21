<?php

namespace App\Http\Controllers;

use App\Concerns\ScopesTasksToUser;
use App\Models\Task;
use App\Models\TaskActivity;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    use ScopesTasksToUser;

    public function index(Request $request): Response
    {
        $user = $request->user();

        $baseQuery = fn () => tap(Task::query(), fn ($q) => $this->scopeToVisibleTasks($q, $user));

        $openStatuses = ['new', 'assigned', 'in_progress', 'waiting_for_client', 'blocked', 'ready_for_review', 'revision_needed'];

        $startOfWeek = Carbon::now()->startOfWeek();

        $stats = [
            'totalOpenTasks' => $baseQuery()->whereIn('status', $openStatuses)->count(),
            'myTasksCount' => $baseQuery()->where('assigned_to_id', $user->id)->whereIn('status', $openStatuses)->count(),
            'urgentTasksCount' => $baseQuery()->whereIn('priority', ['urgent', 'critical'])->whereIn('status', $openStatuses)->count(),
            'overdueTasksCount' => $baseQuery()->whereNotNull('due_date')->where('due_date', '<', now())->whereIn('status', $openStatuses)->count(),
            'waitingForReviewCount' => $baseQuery()->where('status', 'ready_for_review')->count(),
            'completedThisWeekCount' => $baseQuery()->where('status', 'completed')->where('completed_at', '>=', $startOfWeek)->count(),
        ];

        $tasksByStatus = $baseQuery()
            ->selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $tasksByWebsite = $baseQuery()
            ->with('website:id,name')
            ->whereIn('status', $openStatuses)
            ->get()
            ->groupBy('website.name')
            ->map->count();

        $myUrgentTasks = $baseQuery()
            ->where('assigned_to_id', $user->id)
            ->whereIn('priority', ['urgent', 'critical'])
            ->whereIn('status', $openStatuses)
            ->with('website:id,name')
            ->limit(5)
            ->get();

        $upcomingDueDates = $baseQuery()
            ->whereNotNull('due_date')
            ->whereBetween('due_date', [now(), now()->addDays(7)])
            ->whereNotIn('status', ['completed', 'cancelled'])
            ->with(['website:id,name', 'assignedTo:id,name'])
            ->orderBy('due_date')
            ->limit(8)
            ->get();

        $visibleTaskIds = $baseQuery()->pluck('id');

        $recentActivity = TaskActivity::whereIn('task_id', $visibleTaskIds)
            ->with(['user:id,name', 'task:id,ticket_number,title'])
            ->latest()
            ->limit(10)
            ->get();

        $workloadOverview = null;

        if ($user->isAdministrator() || $user->isProjectManager()) {
            $workloadOverview = User::where('role', User::ROLE_DEVELOPER)
                ->withCount(['assignedTasks as active_tasks_count' => function ($q) use ($openStatuses) {
                    $q->whereIn('status', $openStatuses);
                }])
                ->orderByDesc('active_tasks_count')
                ->get(['id', 'name']);
        }

        return Inertia::render('Dashboard', [
            'stats' => $stats,
            'tasksByStatus' => $tasksByStatus,
            'tasksByWebsite' => $tasksByWebsite,
            'myUrgentTasks' => $myUrgentTasks,
            'upcomingDueDates' => $upcomingDueDates,
            'recentActivity' => $recentActivity,
            'workloadOverview' => $workloadOverview,
        ]);
    }
}
