<?php

namespace App\Http\Controllers;

use App\Concerns\ScopesTasksToUser;
use App\Http\Requests\StoreTaskRequest;
use App\Http\Requests\UpdateTaskRequest;
use App\Http\Requests\UpdateTaskStatusRequest;
use App\Models\Task;
use App\Models\TaskActivity;
use App\Models\User;
use App\Models\Website;
use App\Services\AttachmentUploader;
use App\Services\TaskNotifier;
use App\Support\HtmlSanitizer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class TaskController extends Controller
{
    use ScopesTasksToUser;

    public function __construct(private readonly TaskNotifier $notifier) {}

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $viewMode = $request->input('view', 'mine');

        $query = Task::query()
            ->with(['website:id,name', 'assignedTo:id,name'])
            ->withSum('timeEntries', 'minutes_spent');

        $this->scopeToVisibleTasks($query, $user);

        if ($viewMode === 'mine') {
            $query->where('assigned_to_id', $user->id);
        }

        foreach (['website_id', 'assigned_to_id', 'task_type', 'priority', 'status'] as $field) {
            if ($request->filled($field)) {
                $query->where($field, $request->input($field));
            }
        }

        if ($request->boolean('overdue')) {
            $query->whereNotNull('due_date')
                ->where('due_date', '<', now())
                ->whereNotIn('status', ['completed', 'cancelled']);
        }

        if ($search = trim((string) $request->input('search'))) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('ticket_number', 'like', "%{$search}%");
            });
        }

        match ($request->input('sort', 'newest')) {
            'oldest' => $query->oldest(),
            'priority' => $query->orderByRaw("FIELD(priority,'critical','urgent','high','normal','low')"),
            'due_date' => $query->orderByRaw('due_date IS NULL')->orderBy('due_date'),
            'updated' => $query->latest('updated_at'),
            default => $query->latest(),
        };

        $tasks = $query->paginate(20)->withQueryString();

        return Inertia::render('Tasks/Index', [
            'tasks' => $tasks,
            'filters' => $request->only([
                'view', 'website_id', 'assigned_to_id', 'task_type',
                'priority', 'status', 'overdue', 'search', 'sort',
            ]),
            'websites' => Website::orderBy('name')->get(['id', 'name']),
            'users' => User::orderBy('name')->get(['id', 'name', 'role']),
        ]);
    }

    /**
     * Kanban board grouped by status.
     */
    public function board(Request $request): Response
    {
        $user = $request->user();

        $query = Task::query()->with(['website:id,name', 'assignedTo:id,name']);
        $this->scopeToVisibleTasks($query, $user);

        if ($request->filled('website_id')) {
            $query->where('website_id', $request->input('website_id'));
        }

        $tasks = $query->latest()->get()->groupBy('status');

        return Inertia::render('Tasks/Board', [
            'tasksByStatus' => $tasks,
            'websites' => Website::orderBy('name')->get(['id', 'name']),
            'filters' => $request->only(['website_id']),
        ]);
    }

    /**
     * Calendar view based on due date.
     */
    public function calendar(Request $request): Response
    {
        $user = $request->user();

        $query = Task::query()->with(['website:id,name', 'assignedTo:id,name'])->whereNotNull('due_date');
        $this->scopeToVisibleTasks($query, $user);

        return Inertia::render('Tasks/Calendar', [
            'tasks' => $query->get(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request): Response
    {
        $this->authorize('create', Task::class);

        return Inertia::render('Tasks/Create', [
            'websites' => Website::orderBy('name')->get(['id', 'name', 'url']),
            'users' => User::where('is_active', true)->orderBy('name')->get(['id', 'name', 'role']),
            'defaultWebsiteId' => $request->integer('website_id') ?: null,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreTaskRequest $request, AttachmentUploader $uploader)
    {
        $task = DB::transaction(function () use ($request, $uploader) {
            $data = $request->safe()->except(['checklist_items', 'attachments']);
            $data['description'] = HtmlSanitizer::clean($data['description'] ?? null);

            /** @var Task $task */
            $task = Task::create($data);

            foreach ($request->input('checklist_items', []) as $index => $text) {
                if (trim((string) $text) !== '') {
                    $task->checklistItems()->create(['item_text' => $text, 'sort_order' => $index]);
                }
            }

            if ($request->hasFile('attachments')) {
                $uploader->storeForTask($task, $request->file('attachments'), $request->user());
            }

            TaskActivity::create([
                'task_id' => $task->id,
                'user_id' => $request->user()->id,
                'action' => 'created',
            ]);

            return $task;
        });

        if ($task->assigned_to_id) {
            $this->notifier->assigned($task, $request->user());
        }

        return redirect()->route('tasks.show', $task)->with('success', "Task {$task->ticket_number} created.");
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, Task $task): Response
    {
        $this->authorize('view', $task);

        $user = $request->user();

        $task->load([
            'website:id,name,url',
            'assignedTo:id,name',
            'relatedTask:id,ticket_number,title',
            'checklistItems.completedBy:id,name',
            'timeEntries.user:id,name',
            'attachments.uploadedBy:id,name',
            'activities.user:id,name',
        ]);

        $comments = $task->comments()->with(['user:id,name,role', 'attachments'])->get();

        return Inertia::render('Tasks/Show', [
            'task' => $task,
            'comments' => $comments,
            'checklistProgress' => $task->checklistProgressLabel(),
            'totalMinutesSpent' => $task->totalMinutesSpent(),
            'permissions' => [
                'canEdit' => $user->can('update', $task),
                'canUpdateStatus' => $user->can('updateStatus', $task),
                'canDelete' => $user->can('delete', $task),
                'canApprove' => $user->can('approve', $task),
                'canReopen' => $user->can('reopen', $task),
            ],
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Task $task): Response
    {
        $this->authorize('update', $task);

        return Inertia::render('Tasks/Edit', [
            'task' => $task,
            'websites' => Website::orderBy('name')->get(['id', 'name', 'url']),
            'users' => User::where('is_active', true)->orderBy('name')->get(['id', 'name', 'role']),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateTaskRequest $request, Task $task)
    {
        $original = $task->only(['status', 'priority', 'assigned_to_id']);

        DB::transaction(function () use ($request, $task, $original) {
            $data = $request->validated();
            $data['description'] = HtmlSanitizer::clean($data['description'] ?? null);

            $task->update($data);

            $this->logChanges($task, $request->user(), $original);
        });

        if ($task->assigned_to_id && $task->assigned_to_id !== $original['assigned_to_id']) {
            $this->notifier->reassigned($task, $request->user());
        }

        if ($task->status !== $original['status']) {
            $this->notifier->statusChanged($task, $request->user(), $task->status);
        }

        return redirect()->route('tasks.show', $task)->with('success', 'Task updated successfully.');
    }

    /**
     * Update only the task's status (developers acting on their assigned work).
     */
    public function updateStatus(UpdateTaskStatusRequest $request, Task $task)
    {
        $previousStatus = $task->status;
        $newStatus = $request->validated('status');

        $attributes = ['status' => $newStatus];

        if ($newStatus === 'ready_for_review') {
            $attributes['submitted_for_review_at'] = now();
        } elseif ($newStatus === 'approved') {
            $attributes['approved_at'] = now();
        } elseif ($newStatus === 'completed') {
            $attributes['completed_at'] = now();
        }

        $task->update($attributes);

        TaskActivity::create([
            'task_id' => $task->id,
            'user_id' => $request->user()->id,
            'action' => 'status_changed',
            'previous_value' => $previousStatus,
            'new_value' => $newStatus,
        ]);

        $actor = $request->user();

        match ($newStatus) {
            'ready_for_review' => $this->notifier->readyForReview($task, $actor),
            'revision_needed' => $this->notifier->revisionRequested($task, $actor),
            'approved' => $this->notifier->approved($task, $actor),
            default => $this->notifier->statusChanged($task, $actor, $newStatus),
        };

        return back()->with('success', 'Task status updated.');
    }

    /**
     * Reopen a completed/approved task.
     */
    public function reopen(Request $request, Task $task)
    {
        $this->authorize('reopen', $task);

        $previousStatus = $task->status;

        $task->update(['status' => 'revision_needed', 'completed_at' => null, 'approved_at' => null]);

        TaskActivity::create([
            'task_id' => $task->id,
            'user_id' => $request->user()->id,
            'action' => 'reopened',
            'previous_value' => $previousStatus,
            'new_value' => 'revision_needed',
        ]);

        $this->notifier->revisionRequested($task, $request->user());

        return back()->with('success', "Task {$task->ticket_number} reopened.");
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Task $task)
    {
        $this->authorize('delete', $task);

        $task->delete();

        return redirect()->route('tasks.index')->with('success', 'Task deleted.');
    }

    /**
     * @param  array<string, mixed>  $original
     */
    private function logChanges(Task $task, User $user, array $original): void
    {
        foreach ($original as $field => $previousValue) {
            $newValue = $task->{$field};

            if ($previousValue !== $newValue) {
                TaskActivity::create([
                    'task_id' => $task->id,
                    'user_id' => $user->id,
                    'action' => "{$field}_changed",
                    'previous_value' => $previousValue !== null ? (string) $previousValue : null,
                    'new_value' => $newValue !== null ? (string) $newValue : null,
                ]);
            }
        }
    }
}
