<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreWebsiteRequest;
use App\Http\Requests\UpdateWebsiteRequest;
use App\Models\TaskActivity;
use App\Models\User;
use App\Models\Website;
use App\Models\WebsiteCredential;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class WebsiteController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Website::class);

        $user = $request->user();

        $query = Website::query()
            ->withCount([
                'tasks as open_tasks_count' => fn ($q) => $q->whereNotIn('status', ['completed', 'cancelled']),
                'tasks as completed_tasks_count' => fn ($q) => $q->where('status', 'completed'),
            ])
            ->with('projectManager:id,name');

        if ($user->isProjectManager()) {
            $query->where('project_manager_id', $user->id);
        } elseif ($user->isDeveloper()) {
            $query->whereHas('teamMembers', fn ($q) => $q->where('users.id', $user->id));
        }

        if ($search = trim((string) $request->input('search'))) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('client_name', 'like', "%{$search}%");
            });
        }

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        $websites = $query->orderBy('name')->paginate(12)->withQueryString();

        return Inertia::render('Websites/Index', [
            'websites' => $websites,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        $this->authorize('create', Website::class);

        return Inertia::render('Websites/Create', [
            'projectManagers' => User::where('role', User::ROLE_PROJECT_MANAGER)->get(['id', 'name']),
            'teamMembers' => User::where('role', User::ROLE_DEVELOPER)->get(['id', 'name']),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreWebsiteRequest $request)
    {
        $website = DB::transaction(function () use ($request) {
            $website = Website::create($request->safe()->except('team_member_ids'));
            $website->teamMembers()->sync($request->input('team_member_ids', []));

            return $website;
        });

        return redirect()->route('websites.show', $website)->with('success', 'Website added successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, Website $website): Response
    {
        $this->authorize('view', $website);

        $website->load(['projectManager:id,name', 'teamMembers:id,name,email']);

        $taskIds = $website->tasks()->pluck('id');

        return Inertia::render('Websites/Show', [
            'website' => $website,
            'openTasks' => $website->tasks()
                ->whereNotIn('status', ['completed', 'cancelled'])
                ->with('assignedTo:id,name')
                ->latest()
                ->get(),
            'completedTasks' => $website->tasks()
                ->where('status', 'completed')
                ->with('assignedTo:id,name')
                ->latest()
                ->limit(10)
                ->get(),
            'recentActivity' => TaskActivity::whereIn('task_id', $taskIds)
                ->with(['user:id,name', 'task:id,ticket_number,title'])
                ->latest()
                ->limit(15)
                ->get(),
            'credentials' => $website->credentials()->get(['id', 'website_id', 'label', 'login_url', 'notes'])
                ->map(fn (WebsiteCredential $credential) => [
                    'id' => $credential->id,
                    'label' => $credential->label,
                    'login_url' => $credential->login_url,
                    'notes' => $credential->notes,
                    'can_reveal' => $request->user()->can('view', $credential),
                    'can_manage' => $request->user()->can('update', $credential),
                ]),
            'canManageCredentials' => $request->user()->can('viewAny', WebsiteCredential::class),
            'canCreateCredential' => $request->user()->can('create', WebsiteCredential::class),
            'canManageTeam' => $request->user()->can('manageTeam', $website),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Website $website): Response
    {
        $this->authorize('update', $website);

        return Inertia::render('Websites/Edit', [
            'website' => $website->load('teamMembers:id'),
            'projectManagers' => User::where('role', User::ROLE_PROJECT_MANAGER)->get(['id', 'name']),
            'teamMembers' => User::where('role', User::ROLE_DEVELOPER)->get(['id', 'name']),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateWebsiteRequest $request, Website $website)
    {
        DB::transaction(function () use ($request, $website) {
            $website->update($request->safe()->except('team_member_ids'));
            $website->teamMembers()->sync($request->input('team_member_ids', []));
        });

        return redirect()->route('websites.show', $website)->with('success', 'Website updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Website $website)
    {
        $this->authorize('delete', $website);

        $website->delete();

        return redirect()->route('websites.index')->with('success', 'Website archived successfully.');
    }
}
