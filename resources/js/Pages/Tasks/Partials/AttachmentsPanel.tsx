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
        <div className="card">
            <div className="card-header">
                <div className="card-title">Attachments</div>
            </div>
            <div className="card-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 8 }}>
                {attachments.map((att) => (
                    <a
                        key={att.id}
                        href={route('tasks.attachments.download', [task.id, att.id])}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            borderRadius: 8,
                            border: '1px solid var(--border-color)',
                            padding: 8,
                            fontSize: 12,
                            color: 'var(--text-secondary)',
                        }}
                    >
                        {att.is_image ? (
                            <ImageIcon width={16} height={16} strokeWidth={1.5} style={{ flexShrink: 0, color: 'var(--text-muted)' }} />
                        ) : (
                            <FileText width={16} height={16} strokeWidth={1.5} style={{ flexShrink: 0, color: 'var(--text-muted)' }} />
                        )}
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{att.original_name}</span>
                        <span style={{ marginLeft: 'auto', flexShrink: 0, color: 'var(--text-muted)' }}>{formatBytes(att.size_bytes)}</span>
                    </a>
                ))}
            </div>
        </div>
    );
}
