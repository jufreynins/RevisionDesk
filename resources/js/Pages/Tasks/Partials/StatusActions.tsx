import { Task, TaskPermissions, TaskStatus } from '@/types/models';
import { Link, router } from '@inertiajs/react';
import { CheckCircle2, Pencil, RotateCcw, Send, ShieldAlert, Trash2, UserCheck } from 'lucide-react';

function setStatus(taskId: number, status: TaskStatus) {
    router.patch(route('tasks.status.update', taskId), { status });
}

export default function StatusActions({ task, permissions }: { task: Task; permissions: TaskPermissions }) {
    const buttons: { label: string; icon: typeof Send; onClick: () => void; className: string }[] = [];

    if (permissions.canUpdateStatus) {
        if (['new', 'assigned'].includes(task.status)) {
            buttons.push({
                label: 'Start Task',
                icon: Send,
                onClick: () => setStatus(task.id, 'in_progress'),
                className: 'bg-blue-600 hover:bg-blue-700 text-white',
            });
        }

        if (!['blocked', 'completed', 'cancelled'].includes(task.status)) {
            buttons.push({
                label: 'Mark as Blocked',
                icon: ShieldAlert,
                onClick: () => setStatus(task.id, 'blocked'),
                className: 'border border-red-200 text-red-700 hover:bg-red-50',
            });
        }

        if (!['waiting_for_client', 'completed', 'cancelled'].includes(task.status)) {
            buttons.push({
                label: 'Request Client Info',
                icon: UserCheck,
                onClick: () => setStatus(task.id, 'waiting_for_client'),
                className: 'border border-amber-200 text-amber-700 hover:bg-amber-50',
            });
        }

        if (!['ready_for_review', 'completed', 'cancelled'].includes(task.status)) {
            buttons.push({
                label: 'Submit for Review',
                icon: Send,
                onClick: () => setStatus(task.id, 'ready_for_review'),
                className: 'bg-purple-600 hover:bg-purple-700 text-white',
            });
        }
    }

    if (permissions.canApprove && task.status === 'ready_for_review') {
        buttons.push({
            label: 'Request Revision',
            icon: RotateCcw,
            onClick: () => setStatus(task.id, 'revision_needed'),
            className: 'border border-orange-200 text-orange-700 hover:bg-orange-50',
        });
        buttons.push({
            label: 'Approve',
            icon: CheckCircle2,
            onClick: () => setStatus(task.id, 'approved'),
            className: 'bg-teal-600 hover:bg-teal-700 text-white',
        });
    }

    if (permissions.canApprove && ['approved', 'ready_for_review'].includes(task.status)) {
        buttons.push({
            label: 'Complete',
            icon: CheckCircle2,
            onClick: () => setStatus(task.id, 'completed'),
            className: 'bg-emerald-700 hover:bg-emerald-800 text-white',
        });
    }

    if (permissions.canReopen && ['completed', 'approved'].includes(task.status)) {
        buttons.push({
            label: 'Reopen',
            icon: RotateCcw,
            onClick: () => router.post(route('tasks.reopen', task.id)),
            className: 'border border-zinc-300 text-zinc-700 hover:bg-zinc-50',
        });
    }

    return (
        <div className="flex flex-wrap gap-2">
            {buttons.map((btn) => (
                <button
                    key={btn.label}
                    onClick={btn.onClick}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium ${btn.className}`}
                >
                    <btn.icon className="h-3.5 w-3.5" />
                    {btn.label}
                </button>
            ))}

            {permissions.canEdit && (
                <Link
                    href={route('tasks.edit', task.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                >
                    <Pencil className="h-3.5 w-3.5" /> Edit Task
                </Link>
            )}

            {permissions.canDelete && (
                <button
                    onClick={() => {
                        if (confirm(`Delete ${task.ticket_number}? This cannot be undone.`)) {
                            router.delete(route('tasks.destroy', task.id));
                        }
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
            )}
        </div>
    );
}
