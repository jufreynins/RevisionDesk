import HtmlContent from '@/Components/HtmlContent';
import RichTextEditor from '@/Components/RichTextEditor';
import { Task, TaskComment } from '@/types/models';
import { useForm } from '@inertiajs/react';
import { Lock, Paperclip } from 'lucide-react';
import { FormEvent } from 'react';

export default function CommentsPanel({
    task,
    comments,
    canAddInternalComment,
}: {
    task: Task;
    comments: TaskComment[];
    canAddInternalComment: boolean;
}) {
    const { data, setData, post, processing, reset } = useForm({
        body: '',
        is_internal: false as boolean,
        attachments: [] as File[],
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        if (data.body.trim() === '' || data.body === '<p></p>') return;

        post(route('tasks.comments.store', task.id), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    }

    return (
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold text-zinc-900">Comments</h3>

            <div className="space-y-4">
                {comments.length === 0 && <p className="text-sm text-zinc-500">No comments yet.</p>}

                {comments.map((comment) => (
                    <div
                        key={comment.id}
                        className={`rounded-lg border p-3 ${
                            comment.is_internal ? 'border-amber-200 bg-amber-50/50' : 'border-zinc-200 bg-zinc-50'
                        }`}
                    >
                        <div className="mb-1.5 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm">
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-200 text-xs font-semibold text-zinc-700">
                                    {comment.user?.name.charAt(0)}
                                </span>
                                <span className="font-medium text-zinc-900">{comment.user?.name}</span>
                                <span className="text-xs capitalize text-zinc-400">
                                    {comment.user?.role.replace('_', ' ')}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-zinc-400">
                                {comment.is_internal && (
                                    <span className="inline-flex items-center gap-1 text-amber-700">
                                        <Lock className="h-3 w-3" /> Internal
                                    </span>
                                )}
                                {new Date(comment.created_at).toLocaleString()}
                            </div>
                        </div>
                        <HtmlContent html={comment.body} />

                        {comment.attachments && comment.attachments.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                                {comment.attachments.map((att) => (
                                    <a
                                        key={att.id}
                                        href={route('tasks.attachments.download', [task.id, att.id])}
                                        className="inline-flex items-center gap-1 rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-50"
                                    >
                                        <Paperclip className="h-3 w-3" /> {att.original_name}
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <form onSubmit={submit} className="mt-5">
                <RichTextEditor value={data.body} onChange={(html) => setData('body', html)} placeholder="Write a comment..." />

                <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <label className="flex cursor-pointer items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-700">
                            <Paperclip className="h-3.5 w-3.5" />
                            {data.attachments.length > 0 ? `${data.attachments.length} file(s)` : 'Attach files'}
                            <input
                                type="file"
                                multiple
                                className="hidden"
                                onChange={(e) => setData('attachments', Array.from(e.target.files ?? []))}
                            />
                        </label>

                        {canAddInternalComment && (
                            <label className="flex items-center gap-1.5 text-xs text-zinc-500">
                                <input
                                    type="checkbox"
                                    checked={data.is_internal}
                                    onChange={(e) => setData('is_internal', e.target.checked)}
                                    className="h-3.5 w-3.5 rounded border-zinc-300 text-amber-600 focus:ring-amber-500"
                                />
                                Internal note (staff only)
                            </label>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="rounded-lg bg-emerald-700 px-4 py-1.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"
                    >
                        Post Comment
                    </button>
                </div>
            </form>
        </div>
    );
}
