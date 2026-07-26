import { TaskPriority, TaskStatus, UserRole } from '@/types/models';
import {
    AlertOctagon,
    AlertTriangle,
    ArrowDown,
    ArrowUp,
    CheckCircle2,
    CircleDot,
    Clock,
    LucideIcon,
    Minus,
    Pause,
    RotateCcw,
    ShieldAlert,
    XCircle,
} from 'lucide-react';

type Tone = 'muted' | 'blue' | 'yellow' | 'green' | 'red' | 'red-solid';

const TONE_STYLES: Record<Tone, { color: string; background?: string }> = {
    muted: { color: 'var(--text-muted)', background: 'var(--bg-surface-secondary, var(--surface-2))' },
    blue: { color: 'var(--blue)', background: 'var(--blue-lt)' },
    yellow: { color: '#9a6700', background: 'var(--yellow-lt)' },
    green: { color: 'var(--green)', background: 'var(--green-lt)' },
    red: { color: 'var(--red)', background: 'var(--red-lt)' },
    'red-solid': { color: '#fff', background: 'var(--red)' },
};

function Chip({ tone, icon: Icon, label }: { tone: Tone; icon: LucideIcon; label: string }) {
    const style = TONE_STYLES[tone];

    return (
        <span
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                borderRadius: 4,
                padding: '2px 8px',
                fontSize: 11.5,
                fontWeight: 600,
                whiteSpace: 'nowrap',
                color: style.color,
                background: style.background,
            }}
        >
            <Icon width={12} height={12} strokeWidth={2} />
            {label}
        </span>
    );
}

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; tone: Tone; icon: LucideIcon }> = {
    low: { label: 'Low', tone: 'muted', icon: ArrowDown },
    normal: { label: 'Normal', tone: 'blue', icon: Minus },
    high: { label: 'High', tone: 'yellow', icon: ArrowUp },
    urgent: { label: 'Urgent', tone: 'red', icon: AlertTriangle },
    critical: { label: 'Critical', tone: 'red-solid', icon: AlertOctagon },
};

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
    const config = PRIORITY_CONFIG[priority];
    return <Chip tone={config.tone} icon={config.icon} label={config.label} />;
}

const STATUS_DOT_COLOR: Record<Tone, string> = {
    muted: 'var(--text-muted)',
    blue: 'var(--blue)',
    yellow: 'var(--yellow)',
    green: 'var(--green)',
    red: 'var(--red)',
    'red-solid': 'var(--red)',
};

const STATUS_CONFIG: Record<TaskStatus, { label: string; tone: Tone; icon: LucideIcon }> = {
    new: { label: 'New', tone: 'blue', icon: CircleDot },
    assigned: { label: 'Assigned', tone: 'blue', icon: CircleDot },
    in_progress: { label: 'In Progress', tone: 'blue', icon: Clock },
    waiting_for_client: { label: 'Waiting for Client', tone: 'yellow', icon: Pause },
    ready_for_review: { label: 'Ready for Review', tone: 'yellow', icon: AlertTriangle },
    revision_needed: { label: 'Revision Needed', tone: 'yellow', icon: RotateCcw },
    blocked: { label: 'Blocked', tone: 'red', icon: ShieldAlert },
    approved: { label: 'Approved', tone: 'green', icon: CheckCircle2 },
    completed: { label: 'Completed', tone: 'green', icon: CheckCircle2 },
    cancelled: { label: 'Cancelled', tone: 'muted', icon: XCircle },
};

export function StatusBadge({ status }: { status: TaskStatus }) {
    const config = STATUS_CONFIG[status];
    const Icon = config.icon;

    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 500, color: 'var(--text-primary, #1a1a1a)', whiteSpace: 'nowrap' }}>
            <span
                style={{
                    display: 'inline-flex',
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    flexShrink: 0,
                    background: STATUS_DOT_COLOR[config.tone],
                }}
            />
            <Icon width={13} height={13} strokeWidth={1.75} style={{ color: STATUS_DOT_COLOR[config.tone] }} />
            {config.label}
        </span>
    );
}

export const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = Object.entries(STATUS_CONFIG).map(
    ([value, { label }]) => ({ value: value as TaskStatus, label }),
);

export const STATUS_CHART_COLOR: Record<TaskStatus, string> = Object.fromEntries(
    Object.entries(STATUS_CONFIG).map(([status, config]) => [status, STATUS_DOT_COLOR[config.tone]]),
) as Record<TaskStatus, string>;

export const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = Object.entries(PRIORITY_CONFIG).map(
    ([value, { label }]) => ({ value: value as TaskPriority, label }),
);

export const ROLE_LABEL: Record<UserRole, string> = {
    administrator: 'Administrator',
    project_manager: 'Project Manager',
    developer: 'Developer',
};

export const ROLE_BADGE_CLASS: Record<UserRole, string> = {
    administrator: 'badge-red',
    project_manager: 'badge-blue',
    developer: 'badge-teal',
};

export const PRIORITY_CHART_COLOR: Record<TaskPriority, string> = {
    ...(Object.fromEntries(
        Object.entries(PRIORITY_CONFIG).map(([priority, config]) => [priority, STATUS_DOT_COLOR[config.tone]]),
    ) as Record<TaskPriority, string>),
    critical: '#7f1d1d',
};
