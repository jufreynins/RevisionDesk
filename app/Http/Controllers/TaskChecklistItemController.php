<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\TaskChecklistItem;
use Illuminate\Http\Request;

class TaskChecklistItemController extends Controller
{
    public function store(Request $request, Task $task)
    {
        $this->authorize('update', $task);

        $request->validate(['item_text' => ['required', 'string', 'max:500']]);

        $task->checklistItems()->create([
            'item_text' => $request->input('item_text'),
            'sort_order' => $task->checklistItems()->max('sort_order') + 1,
        ]);

        return back()->with('success', 'Checklist item added.');
    }

    public function update(Request $request, Task $task, TaskChecklistItem $checklistItem)
    {
        $this->authorize('updateStatus', $task);

        $request->validate(['is_completed' => ['required', 'boolean']]);

        $isCompleted = $request->boolean('is_completed');

        $checklistItem->update([
            'is_completed' => $isCompleted,
            'completed_by_id' => $isCompleted ? $request->user()->id : null,
            'completed_at' => $isCompleted ? now() : null,
        ]);

        return back()->with('success', 'Checklist item updated.');
    }

    public function destroy(Task $task, TaskChecklistItem $checklistItem)
    {
        $this->authorize('update', $task);

        $checklistItem->delete();

        return back()->with('success', 'Checklist item removed.');
    }
}
