import { Task, TaskPermissions, TaskStatus } from '@/types/models';
import { Link, router } from '@inertiajs/react';
import { CheckCircle2, Pencil, RotateCcw, Send, ShieldAlert, Trash2, UserCheck } from 'lucide-react';

function setStatus(taskId: number, status: TaskStatus) {
    router.patch(route('tasks.status.update', taskId), { status });
}

export default function StatusActions({ task, permissions }: { task: Task; permissions: TaskPermissions }) {
    const buttons: { label: string; icon: typeof Send; onClick: () => void; variant: 'primary' | 'outline' }[] = [];

    if (permissions.canUpdateStatus) {
        if (['new', 'assigned'].includes(task.status)) {
            buttons.push({ label: 'Start Task', icon: Send, onClick: () => setStatus(task.id, 'in_progress'), variant: 'primary' });
        }

        if (!['blocked', 'completed', 'cancelled'].includes(task.status)) {
            buttons.push({ label: 'Mark as Blocked', icon: ShieldAlert, onClick: () => setStatus(task.id, 'blocked'), variant: 'outline' });
        }

        if (!['waiting_for_client', 'completed', 'cancelled'].includes(task.status)) {
            buttons.push({
                label: 'Request Client Info',
                icon: UserCheck,
                onClick: () => setStatus(task.id, 'waiting_for_client'),
                variant: 'outline',
            });
        }

        if (!['ready_for_review', 'completed', 'cancelled'].includes(task.status)) {
            buttons.push({
                label: 'Submit for Review',
                icon: Send,
                onClick: () => setStatus(task.id, 'ready_for_review'),
                variant: 'primary',
            });
        }
    }

    if (permissions.canApprove && task.status === 'ready_for_review') {
        buttons.push({ label: 'Request Revision', icon: RotateCcw, onClick: () => setStatus(task.id, 'revision_needed'), variant: 'outline' });
        buttons.push({ label: 'Approve', icon: CheckCircle2, onClick: () => setStatus(task.id, 'approved'), variant: 'primary' });
    }

    if (permissions.canApprove && ['approved', 'ready_for_review'].includes(task.status)) {
        buttons.push({ label: 'Complete', icon: CheckCircle2, onClick: () => setStatus(task.id, 'completed'), variant: 'primary' });
    }

    if (permissions.canReopen && ['completed', 'approved'].includes(task.status)) {
        buttons.push({ label: 'Reopen', icon: RotateCcw, onClick: () => router.post(route('tasks.reopen', task.id)), variant: 'outline' });
    }

    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {buttons.map((btn) => (
                <button key={btn.label} onClick={btn.onClick} className={`btn btn-${btn.variant} btn-sm`}>
                    <btn.icon width={14} height={14} strokeWidth={1.5} />
                    {btn.label}
                </button>
            ))}

            {permissions.canEdit && (
                <Link href={route('tasks.edit', task.id)} className="btn btn-outline btn-sm">
                    <Pencil width={14} height={14} strokeWidth={1.5} /> Edit Task
                </Link>
            )}

            {permissions.canDelete && (
                <button
                    onClick={() => {
                        if (confirm(`Delete ${task.ticket_number}? This cannot be undone.`)) {
                            router.delete(route('tasks.destroy', task.id));
                        }
                    }}
                    className="btn btn-danger btn-sm"
                >
                    <Trash2 width={14} height={14} strokeWidth={1.5} /> Delete
                </button>
            )}
        </div>
    );
}
