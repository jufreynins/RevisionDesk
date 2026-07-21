import { Task } from '@/types/models';
import { FileText, Image as ImageIcon } from 'lucide-react';

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AttachmentsPanel({ task }: { task: Task }) {
    const attachments = (task.attachments ?? []).filter((a) => a.task_comment_id === null);

    if (attachments.length === 0) return null;

    return (
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-zinc-900">Attachments</h3>
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {attachments.map((att) => (
                    <a
                        key={att.id}
                        href={route('tasks.attachments.download', [task.id, att.id])}
                        className="flex items-center gap-2 rounded-lg border border-zinc-200 p-2 text-xs text-zinc-600 hover:bg-zinc-50"
                    >
                        {att.is_image ? (
                            <ImageIcon className="h-4 w-4 shrink-0 text-zinc-400" />
                        ) : (
                            <FileText className="h-4 w-4 shrink-0 text-zinc-400" />
                        )}
                        <span className="truncate">{att.original_name}</span>
                        <span className="ml-auto shrink-0 text-zinc-400">{formatBytes(att.size_bytes)}</span>
                    </a>
                ))}
            </ul>
        </div>
    );
}
