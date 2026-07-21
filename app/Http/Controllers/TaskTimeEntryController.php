<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTaskTimeEntryRequest;
use App\Models\Task;
use App\Models\TaskTimeEntry;
use Illuminate\Http\Request;

class TaskTimeEntryController extends Controller
{
    public function store(StoreTaskTimeEntryRequest $request, Task $task)
    {
        $task->timeEntries()->create([
            'user_id' => $request->user()->id,
            'work_date' => $request->validated('work_date'),
            'minutes_spent' => $request->validated('minutes_spent'),
            'work_description' => $request->validated('work_description'),
        ]);

        return back()->with('success', 'Time entry logged.');
    }

    public function destroy(Request $request, Task $task, TaskTimeEntry $timeEntry)
    {
        $user = $request->user();

        abort_unless($user->isAdministrator() || $timeEntry->user_id === $user->id, 403);

        $timeEntry->delete();

        return back()->with('success', 'Time entry removed.');
    }
}
