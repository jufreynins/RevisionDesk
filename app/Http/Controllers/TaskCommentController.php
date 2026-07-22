<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTaskCommentRequest;
use App\Models\Task;
use App\Models\TaskComment;
use App\Services\AttachmentUploader;
use App\Services\TaskNotifier;
use App\Support\HtmlSanitizer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TaskCommentController extends Controller
{
    public function __construct(private readonly TaskNotifier $notifier) {}

    public function store(StoreTaskCommentRequest $request, Task $task, AttachmentUploader $uploader)
    {
        DB::transaction(function () use ($request, $task, $uploader) {
            $comment = $task->comments()->create([
                'user_id' => $request->user()->id,
                'body' => HtmlSanitizer::clean($request->validated('body')),
            ]);

            if ($request->hasFile('attachments')) {
                $uploader->storeForTask($task, $request->file('attachments'), $request->user(), $comment);
            }

            $task->activities()->create([
                'user_id' => $request->user()->id,
                'action' => 'comment_added',
            ]);
        });

        $this->notifier->commentAdded($task, $request->user());

        return back()->with('success', 'Comment added.');
    }

    private const EDIT_WINDOW_MINUTES = 15;

    public function update(Request $request, Task $task, TaskComment $comment)
    {
        $user = $request->user();
        $withinEditWindow = $comment->created_at->diffInMinutes(now()) <= self::EDIT_WINDOW_MINUTES;

        abort_unless(
            $user->isAdministrator() || ($comment->user_id === $user->id && $withinEditWindow),
            403
        );

        $request->validate(['body' => ['required', 'string']]);

        $comment->update([
            'body' => HtmlSanitizer::clean($request->input('body')),
            'edited_at' => now(),
        ]);

        return back()->with('success', 'Comment updated.');
    }

    public function destroy(Request $request, Task $task, TaskComment $comment)
    {
        $user = $request->user();

        abort_unless($user->isAdministrator() || $comment->user_id === $user->id, 403);

        $comment->delete();

        return back()->with('success', 'Comment deleted.');
    }
}
