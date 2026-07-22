<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\TaskAttachment;
use App\Services\AttachmentUploader;
use Illuminate\Support\Facades\Storage;

class TaskAttachmentController extends Controller
{
    public function download(Task $task, TaskAttachment $attachment)
    {
        $this->authorize('view', $task);

        abort_unless($attachment->task_id === $task->id, 404);
        abort_unless(Storage::disk('local')->exists($attachment->stored_path), 404, 'This file is no longer available.');

        return Storage::disk('local')->download($attachment->stored_path, $attachment->original_name);
    }

    public function destroy(Task $task, TaskAttachment $attachment, AttachmentUploader $uploader)
    {
        $this->authorize('update', $task);

        abort_unless($attachment->task_id === $task->id, 404);

        $uploader->delete($attachment->stored_path);
        $attachment->delete();

        return back()->with('success', 'Attachment removed.');
    }
}
