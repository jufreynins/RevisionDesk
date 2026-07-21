<?php

namespace App\Services;

use App\Models\Task;
use App\Models\TaskComment;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AttachmentUploader
{
    /**
     * @param  UploadedFile[]  $files
     */
    public function storeForTask(Task $task, array $files, User $uploader, ?TaskComment $comment = null): void
    {
        foreach ($files as $file) {
            $storedPath = $file->store('task-attachments', 'local');

            $task->attachments()->create([
                'task_comment_id' => $comment?->id,
                'uploaded_by_id' => $uploader->id,
                'original_name' => Str::limit($file->getClientOriginalName(), 250, ''),
                'stored_path' => $storedPath,
                'mime_type' => $file->getClientMimeType(),
                'size_bytes' => $file->getSize(),
                'is_image' => str_starts_with($file->getClientMimeType(), 'image/'),
            ]);
        }
    }

    public function delete(string $storedPath): void
    {
        Storage::disk('local')->delete($storedPath);
    }
}
