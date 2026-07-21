import { TaskPriority, TaskStatus } from '@/types/models';
import {
    AlertOctagon,
    AlertTriangle,
    ArrowDown,
    ArrowUp,
    CheckCircle2,
    CircleDot,
    Clock,
    Minus,
    Pause,
    RotateCcw,
    ShieldAlert,
    XCircle,
} from 'lucide-react';
import { ComponentType } from 'react';

const PRIORITY_CONFIG: Record<
    TaskPriority,
    { label: string; classes: string; icon: ComponentType<{ className?: string }> }
> = {
    low: { label: 'Low', classes: 'bg-zinc-100 text-zinc-600 ring-zinc-200', icon: ArrowDown },
    normal: { label: 'Normal', classes: 'bg-blue-50 text-blue-700 ring-blue-200', icon: Minus },
    high: { label: 'High', classes: 'bg-orange-50 text-orange-700 ring-orange-200', icon: ArrowUp },
    urgent: { label: 'Urgent', classes: 'bg-red-50 text-red-700 ring-red-200', icon: AlertTriangle },
    critical: {
        label: 'Critical',
        classes: 'bg-red-800 text-white ring-red-900',
        icon: AlertOctagon,
    },
};

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
    const config = PRIORITY_CONFIG[priority];
    const Icon = config.icon;

    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${config.classes}`}
        >
            <Icon className="h-3.5 w-3.5" />
            {config.label}
        </span>
    );
}

const STATUS_CONFIG: Record<
    TaskStatus,
    { label: string; classes: string; icon: ComponentType<{ className?: string }> }
> = {
    new: { label: 'New', classes: 'bg-zinc-100 text-zinc-700 ring-zinc-200', icon: CircleDot },
    assigned: { label: 'Assigned', classes: 'bg-indigo-50 text-indigo-700 ring-indigo-200', icon: CircleDot },
    in_progress: { label: 'In Progress', classes: 'bg-blue-50 text-blue-700 ring-blue-200', icon: Clock },
    waiting_for_client: {
        label: 'Waiting for Client',
        classes: 'bg-amber-50 text-amber-700 ring-amber-200',
        icon: Pause,
    },
    blocked: { label: 'Blocked', classes: 'bg-red-50 text-red-700 ring-red-200', icon: ShieldAlert },
    ready_for_review: {
        label: 'Ready for Review',
        classes: 'bg-purple-50 text-purple-700 ring-purple-200',
        icon: AlertTriangle,
    },
    revision_needed: {
        label: 'Revision Needed',
        classes: 'bg-orange-50 text-orange-700 ring-orange-200',
        icon: RotateCcw,
    },
    approved: { label: 'Approved', classes: 'bg-teal-50 text-teal-700 ring-teal-200', icon: CheckCircle2 },
    completed: { label: 'Completed', classes: 'bg-emerald-50 text-emerald-700 ring-emerald-200', icon: CheckCircle2 },
    cancelled: { label: 'Cancelled', classes: 'bg-zinc-100 text-zinc-500 ring-zinc-200', icon: XCircle },
};

export function StatusBadge({ status }: { status: TaskStatus }) {
    const config = STATUS_CONFIG[status];
    const Icon = config.icon;

    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${config.classes}`}
        >
            <Icon className="h-3.5 w-3.5" />
            {config.label}
        </span>
    );
}

export const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = Object.entries(STATUS_CONFIG).map(
    ([value, { label }]) => ({ value: value as TaskStatus, label }),
);

export const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = Object.entries(PRIORITY_CONFIG).map(
    ([value, { label }]) => ({ value: value as TaskPriority, label }),
);
