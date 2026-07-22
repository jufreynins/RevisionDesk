<?php

namespace App\Http\Controllers;

use App\Concerns\ScopesTasksToUser;
use App\Models\Task;
use App\Models\TaskTimeEntry;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    use ScopesTasksToUser;

    public function index(Request $request): Response
    {
        $user = $request->user();

        abort_unless($user->isAdministrator() || $user->isProjectManager(), 403);

        $from = Carbon::parse($request->input('from', now()->subDays(30)->toDateString()))->startOfDay();
        $to = Carbon::parse($request->input('to', now()->toDateString()))->endOfDay();

        $baseQuery = fn () => tap(Task::query(), fn ($q) => $this->scopeToVisibleTasks($q, $user));

        $tasksCompletedByDate = $baseQuery()
            ->where('status', 'completed')
            ->whereBetween('completed_at', [$from, $to])
            ->selectRaw('DATE(completed_at) as date, count(*) as total')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $openTasksPerWebsite = $baseQuery()
            ->whereNotIn('status', ['completed', 'cancelled'])
            ->with('website:id,name')
            ->get()
            ->groupBy('website.name')
            ->map->count()
            ->sortDesc()
            ->take(8);

        $tasksByPriority = $baseQuery()
            ->whereBetween('created_at', [$from, $to])
            ->selectRaw('priority, count(*) as total')
            ->groupBy('priority')
            ->pluck('total', 'priority');

        $tasksByType = $baseQuery()
            ->whereBetween('created_at', [$from, $to])
            ->selectRaw('task_type, count(*) as total')
            ->groupBy('task_type')
            ->orderByDesc('total')
            ->pluck('total', 'task_type');

        $overdueCount = $baseQuery()
            ->whereNotNull('due_date')
            ->where('due_date', '<', now())
            ->whereNotIn('status', ['completed', 'cancelled'])
            ->count();

        $completedInRange = $baseQuery()
            ->where('status', 'completed')
            ->whereNotNull('completed_at')
            ->whereBetween('completed_at', [$from, $to])
            ->get(['id', 'created_at', 'completed_at', 'assigned_to_id', 'estimated_minutes']);

        $avgCompletionHours = $completedInRange->isEmpty()
            ? 0
            : round($completedInRange->avg(fn (Task $t) => $t->created_at->diffInHours($t->completed_at)), 1);

        $tasksCompletedByMember = $completedInRange
            ->load('assignedTo:id,name')
            ->groupBy(fn (Task $t) => $t->assignedTo?->name ?? 'Unassigned')
            ->map->count()
            ->sortDesc();

        $estimatedMinutes = (int) $completedInRange->sum('estimated_minutes');
        $actualMinutes = (int) TaskTimeEntry::whereIn('task_id', $completedInRange->pluck('id'))->sum('minutes_spent');

        return Inertia::render('Reports/Index', [
            'filters' => ['from' => $from->toDateString(), 'to' => $to->toDateString()],
            'tasksCompletedByDate' => $tasksCompletedByDate,
            'openTasksPerWebsite' => $openTasksPerWebsite,
            'tasksByPriority' => $tasksByPriority,
            'tasksByType' => $tasksByType,
            'overdueCount' => $overdueCount,
            'avgCompletionHours' => $avgCompletionHours,
            'tasksCompletedByMember' => $tasksCompletedByMember,
            'estimatedVsActual' => ['estimated' => $estimatedMinutes, 'actual' => $actualMinutes],
            'totalCompletedInRange' => $completedInRange->count(),
        ]);
    }
}
