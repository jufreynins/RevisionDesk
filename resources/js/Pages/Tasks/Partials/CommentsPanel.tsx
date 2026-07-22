import HtmlContent from '@/Components/HtmlContent';
import RichTextEditor from '@/Components/RichTextEditor';
import { Task, TaskComment } from '@/types/models';
import { useForm } from '@inertiajs/react';
import { Paperclip } from 'lucide-react';
import { FormEvent } from 'react';

export default function CommentsPanel({ task, comments }: { task: Task; comments: TaskComment[] }) {
    const { data, setData, post, processing, reset } = useForm({
        body: '',
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
        <div className="card">
            <div className="card-header">
                <div className="card-title">Comments</div>
            </div>
            <div className="card-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {comments.length === 0 && <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No comments yet.</p>}

                    {comments.map((comment) => (
                        <div
                            key={comment.id}
                            style={{
                                borderRadius: 8,
                                border: '1px solid var(--border-color)',
                                padding: 12,
                            }}
                        >
                            <div style={{ marginBottom: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                                    <span
                                        style={{
                                            display: 'flex',
                                            height: 24,
                                            width: 24,
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            borderRadius: '50%',
                                            background: 'var(--primary)',
                                            color: '#fff',
                                            fontSize: 11,
                                            fontWeight: 600,
                                        }}
                                    >
                                        {comment.user?.name.charAt(0)}
                                    </span>
                                    <strong>{comment.user?.name}</strong>
                                    <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                                        {comment.user?.role.replace('_', ' ')}
                                    </span>
                                </div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                    {new Date(comment.created_at).toLocaleString()}
                                </div>
                            </div>
                            <HtmlContent html={comment.body} />

                            {comment.attachments && comment.attachments.length > 0 && (
                                <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                    {comment.attachments.map((att) => (
                                        <a
                                            key={att.id}
                                            href={route('tasks.attachments.download', [task.id, att.id])}
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: 4,
                                                borderRadius: 6,
                                                border: '1px solid var(--border-color)',
                                                padding: '4px 8px',
                                                fontSize: 11,
                                                color: 'var(--text-secondary)',
                                            }}
                                        >
                                            <Paperclip width={12} height={12} strokeWidth={1.5} /> {att.original_name}
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <form onSubmit={submit} style={{ marginTop: 18 }}>
                    <RichTextEditor value={data.body} onChange={(html) => setData('body', html)} placeholder="Write a comment..." />

                    <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <label style={{ display: 'flex', cursor: 'pointer', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                            <Paperclip width={14} height={14} strokeWidth={1.5} />
                            {data.attachments.length > 0 ? `${data.attachments.length} file(s)` : 'Attach files'}
                            <input
                                type="file"
                                multiple
                                className="hidden"
                                onChange={(e) => setData('attachments', Array.from(e.target.files ?? []))}
                            />
                        </label>

                        <button type="submit" disabled={processing} className="btn btn-primary btn-sm">
                            Post Comment
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
