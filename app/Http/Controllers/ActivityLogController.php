<?php

namespace App\Http\Controllers;

use App\Concerns\ScopesTasksToUser;
use App\Models\TaskActivity;
use App\Models\Website;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ActivityLogController extends Controller
{
    use ScopesTasksToUser;

    public function index(Request $request): Response
    {
        $user = $request->user();

        abort_unless($user->isInternal(), 403);

        $query = TaskActivity::query()
            ->whereHas('task', function ($taskQuery) use ($user) {
                $this->scopeToVisibleTasks($taskQuery, $user);
            })
            ->with(['user:id,name', 'task:id,ticket_number,title,website_id', 'task.website:id,name']);

        if ($request->filled('website_id')) {
            $websiteId = $request->input('website_id');
            $query->whereHas('task', fn ($q) => $q->where('website_id', $websiteId));
        }

        $activities = $query->latest()->paginate(30)->withQueryString();

        return Inertia::render('ActivityLog/Index', [
            'activities' => $activities,
            'websites' => Website::orderBy('name')->get(['id', 'name']),
            'filters' => $request->only(['website_id']),
        ]);
    }
}
