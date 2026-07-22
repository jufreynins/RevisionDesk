<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', User::class);

        $openStatuses = ['new', 'assigned', 'in_progress', 'waiting_for_client', 'blocked', 'ready_for_review', 'revision_needed'];

        $query = User::query()->withCount([
            'assignedTasks as active_tasks_count' => fn ($q) => $q->whereIn('status', $openStatuses),
        ]);

        if ($request->filled('role')) {
            $query->where('role', $request->input('role'));
        }

        if ($search = trim((string) $request->input('search'))) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query->orderBy('name')->paginate(20)->withQueryString();

        return Inertia::render('Team/Index', [
            'users' => $users,
            'filters' => $request->only(['role', 'search']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        $this->authorize('create', User::class);

        return Inertia::render('Team/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreUserRequest $request)
    {
        User::create([
            ...$request->safe()->except('password'),
            'password' => Hash::make($request->validated('password')),
            'email_verified_at' => now(),
        ]);

        return redirect()->route('team.index')->with('success', 'Team member added.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(User $user): Response
    {
        $this->authorize('update', $user);

        return Inertia::render('Team/Edit', ['member' => $user]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateUserRequest $request, User $user)
    {
        $user->update($request->validated());

        return redirect()->route('team.index')->with('success', 'Team member updated.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user)
    {
        $this->authorize('delete', $user);

        $user->delete();

        return redirect()->route('team.index')->with('success', 'Team member deactivated.');
    }
}
