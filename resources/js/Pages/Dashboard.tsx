import { PriorityBadge, STATUS_CHART_COLOR, STATUS_OPTIONS } from '@/Components/Badges';
import AuthenticatedLayout, { PageHeader } from '@/Layouts/AuthenticatedLayout';
import { consumeAutoStart } from '@/tour/tourStore';
import { useTour } from '@/tour/useTour';
import { PageProps } from '@/types';
import { Task, TaskActivity } from '@/types/models';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    Activity,
    AlertTriangle,
    CalendarClock,
    CheckCircle2,
    Clock,
    Globe,
    ListTodo,
    LucideIcon,
    PieChart,
    Plus,
    Sparkles,
    Users,
} from 'lucide-react';
import { useEffect } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface DashboardProps {
    stats: {
        totalOpenTasks: number;
        myTasksCount: number;
        urgentTasksCount: number;
        overdueTasksCount: number;
        waitingForReviewCount: number;
        completedThisWeekCount: number;
    };
    tasksByStatus: Record<string, number>;
    tasksByWebsite: Record<string, number>;
    myUrgentTasks: Task[];
    upcomingDueDates: Task[];
    recentActivity: TaskActivity[];
    workloadOverview: { id: number; name: string; active_tasks_count: number }[] | null;
}

function activityLabel(activity: TaskActivity): string {
    const actor = activity.user?.name ?? 'Someone';

    switch (activity.action) {
        case 'created':
            return `created this task`;
        case 'status_changed':
            return `changed status to ${activity.new_value}`;
        case 'assigned_to_id_changed':
            return `reassigned the task`;
        case 'priority_changed':
            return `changed priority to ${activity.new_value}`;
        case 'comment_added':
            return `added a comment`;
        case 'reopened':
            return `reopened the task`;
        default:
            return `updated the task`;
    }
}

function initials(name: string): string {
    return name
        .split(' ')
        .map((part) => part.charAt(0))
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

const STAT_COLOR_VARS: Record<string, string> = {
    teal: 'var(--primary)',
    blue: 'var(--blue)',
    red: 'var(--red)',
    yellow: 'var(--yellow)',
    purple: 'var(--purple)',
    green: 'var(--green)',
};

const STAT_COLOR_LT_VARS: Record<string, string> = {
    teal: 'var(--primary-lt)',
    blue: 'var(--blue-lt)',
    red: 'var(--red-lt)',
    yellow: 'var(--yellow-lt)',
    purple: 'var(--purple-lt)',
    green: 'var(--green-lt)',
};

const STATUS_LABELS: Record<string, string> = Object.fromEntries(STATUS_OPTIONS.map((o) => [o.value, o.label]));
const STATUS_ORDER = STATUS_OPTIONS.map((o) => o.value);

const CHART_TOOLTIP_STYLE = {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-color)',
    borderRadius: 6,
    fontSize: 12,
};
const CHART_TICK_STYLE = { fontSize: 11, fill: 'var(--text-muted)' };
const CHART_CATEGORY_TICK_STYLE = { fontSize: 11, fill: 'var(--text-secondary)' };

const AVATAR_PALETTE = [
    'linear-gradient(135deg,var(--primary),var(--primary-dk))',
    'linear-gradient(135deg,var(--blue),#0554a3)',
    'linear-gradient(135deg,var(--purple),#7e2d94)',
    'linear-gradient(135deg,var(--orange),#c25405)',
    'linear-gradient(135deg,var(--cyan),#0f7688)',
];

function SectionHeader({ icon: Icon, title, subtitle }: { icon: LucideIcon; title: string; subtitle?: string }) {
    return (
        <div className="card-header">
            <div>
                <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <Icon width={15} height={15} strokeWidth={1.75} style={{ color: 'var(--text-muted)' }} />
                    {title}
                </div>
                {subtitle && <div className="card-subtitle">{subtitle}</div>}
            </div>
        </div>
    );
}

function EmptyState({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text: string }) {
    return (
        <div className="empty-state">
            <div className="empty-state-icon">
                <Icon width={22} height={22} strokeWidth={1.5} />
            </div>
            <div className="empty-state-title">{title}</div>
            <div className="empty-state-text">{text}</div>
        </div>
    );
}

const STAT_CARDS = (stats: DashboardProps['stats']) => [
    { label: 'Open Tasks', value: stats.totalOpenTasks, icon: ListTodo, color: 'teal' },
    { label: 'My Tasks', value: stats.myTasksCount, icon: Users, color: 'blue' },
    { label: 'Urgent', value: stats.urgentTasksCount, icon: AlertTriangle, color: 'red' },
    { label: 'Overdue', value: stats.overdueTasksCount, icon: Clock, color: 'yellow' },
    { label: 'Waiting Review', value: stats.waitingForReviewCount, icon: CalendarClock, color: 'purple' },
    { label: 'Completed This Week', value: stats.completedThisWeekCount, icon: CheckCircle2, color: 'green' },
];

export default function Dashboard({
    stats,
    tasksByStatus,
    tasksByWebsite,
    myUrgentTasks,
    upcomingDueDates,
    recentActivity,
    workloadOverview,
}: PageProps<DashboardProps>) {
    const { auth } = usePage<PageProps>().props;
    const isAdmin = auth.user.role === 'administrator';
    const canManage = isAdmin || auth.user.role === 'project_manager';
    const tour = useTour({ isAdmin, canManage });

    useEffect(() => {
        if (consumeAutoStart(auth.user.has_completed_tour) && !tour.active) {
            tour.start();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const statusData = STATUS_ORDER.filter((status) => tasksByStatus[status]).map((status) => ({
        status,
        label: STATUS_LABELS[status],
        total: tasksByStatus[status],
    }));

    const websiteData = Object.entries(tasksByWebsite)
        .map(([name, total]) => ({ name, total }))
        .sort((a, b) => b.total - a.total);

    const statusTotal = statusData.reduce((sum, s) => sum + s.total, 0);
    const maxWorkload = Math.max(1, ...(workloadOverview ?? []).map((m) => m.active_tasks_count));

    return (
        <AuthenticatedLayout
            header={
                <>
                    <div>
                        <div className="page-pretitle">Overview</div>
                        <h1 className="page-title">Dashboard</h1>
                    </div>
                    <div className="page-actions">
                        <button onClick={() => tour.start()} className="btn btn-outline" type="button">
                            <Sparkles width={16} height={16} strokeWidth={1.5} />
                            Take a Tour
                        </button>
                        {canManage && (
                            <>
                                <Link href={route('websites.create')} className="btn btn-outline">
                                    <Plus width={16} height={16} strokeWidth={1.5} />
                                    Add Website
                                </Link>
                                <Link href={route('tasks.create')} className="btn btn-primary">
                                    <Plus width={16} height={16} strokeWidth={1.5} />
                                    Add New Task
                                </Link>
                            </>
                        )}
                    </div>
                </>
            }
        >
            <Head title="Dashboard" />

            <div data-tour="dashboard-stats">
                <div className="row col-3">
                    {STAT_CARDS(stats)
                        .slice(0, 3)
                        .map((card) => (
                            <div
                                className="card"
                                key={card.label}
                                style={{
                                    borderTop: `3px solid ${STAT_COLOR_VARS[card.color]}`,
                                    background: STAT_COLOR_LT_VARS[card.color],
                                }}
                            >
                                <div className="stat">
                                    <div
                                        className={`stat-icon ${card.color}`}
                                        style={{ background: STAT_COLOR_VARS[card.color], color: '#fff' }}
                                    >
                                        <card.icon width={22} height={22} strokeWidth={1.5} />
                                    </div>
                                    <div className="stat-content">
                                        <div className="stat-label">{card.label}</div>
                                        <div className="stat-value-row">
                                            <span className="stat-value">{card.value}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>

                <div className="row col-3">
                    {STAT_CARDS(stats)
                        .slice(3)
                        .map((card) => (
                            <div
                                className="card"
                                key={card.label}
                                style={{
                                    borderTop: `3px solid ${STAT_COLOR_VARS[card.color]}`,
                                    background: STAT_COLOR_LT_VARS[card.color],
                                }}
                            >
                                <div className="stat">
                                    <div
                                        className={`stat-icon ${card.color}`}
                                        style={{ background: STAT_COLOR_VARS[card.color], color: '#fff' }}
                                    >
                                        <card.icon width={22} height={22} strokeWidth={1.5} />
                                    </div>
                                    <div className="stat-content">
                                        <div className="stat-label">{card.label}</div>
                                        <div className="stat-value-row">
                                            <span className="stat-value">{card.value}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>
            </div>

            <div className="row col-8-4">
                <div className="card" data-tour="dashboard-due">
                    <SectionHeader
                        icon={CalendarClock}
                        title="Upcoming Due Dates"
                        subtitle={upcomingDueDates.length > 0 ? `${upcomingDueDates.length} due in the next 7 days` : undefined}
                    />
                    <div className="card-body" style={{ padding: upcomingDueDates.length === 0 ? 0 : '8px 16px' }}>
                        {upcomingDueDates.length === 0 ? (
                            <EmptyState
                                icon={CheckCircle2}
                                title="Nothing due soon"
                                text="No tasks are due in the next 7 days."
                            />
                        ) : (
                            <ul className="activity-list">
                                {upcomingDueDates.map((task) => (
                                    <li className="activity-item" key={task.id}>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div className="activity-body">
                                                <Link href={route('tasks.show', task.id)}>
                                                    <strong>{task.ticket_number}</strong> · {task.title}
                                                </Link>
                                            </div>
                                            <div className="activity-time">
                                                {task.website?.name} · Due{' '}
                                                {new Date(task.due_date as string).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <PriorityBadge priority={task.priority} />
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                <div className="card">
                    <SectionHeader
                        icon={AlertTriangle}
                        title="My Urgent Tasks"
                        subtitle={myUrgentTasks.length > 0 ? `${myUrgentTasks.length} need your attention` : undefined}
                    />
                    <div className="card-body" style={{ padding: myUrgentTasks.length === 0 ? 0 : '8px 16px' }}>
                        {myUrgentTasks.length === 0 ? (
                            <EmptyState icon={CheckCircle2} title="All caught up" text="No urgent tasks are assigned to you right now." />
                        ) : (
                            <ul className="activity-list">
                                {myUrgentTasks.map((task) => (
                                    <li className="activity-item" key={task.id}>
                                        <div>
                                            <div className="activity-body">
                                                <Link href={route('tasks.show', task.id)}>
                                                    <strong>{task.ticket_number}</strong> · {task.title}
                                                </Link>
                                            </div>
                                            <div className="activity-time">{task.website?.name}</div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>

            <div className="row col-3" style={{ alignItems: 'start' }}>
                <div className="card">
                    <SectionHeader
                        icon={PieChart}
                        title="Tasks by Status"
                        subtitle={statusTotal > 0 ? `${statusTotal} open task${statusTotal === 1 ? '' : 's'}` : undefined}
                    />
                    <div className="card-body" style={{ height: 260 }}>
                        {statusData.length === 0 ? (
                            <EmptyState icon={PieChart} title="No tasks yet" text="Tasks will appear here once they're created." />
                        ) : (
                            <ResponsiveContainer>
                                <BarChart data={statusData} layout="vertical" margin={{ left: 16, right: 16 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" horizontal={false} />
                                    <XAxis type="number" allowDecimals={false} tick={CHART_TICK_STYLE} />
                                    <YAxis type="category" dataKey="label" width={130} tick={CHART_CATEGORY_TICK_STYLE} />
                                    <Tooltip cursor={{ fill: 'var(--bg-surface-secondary)' }} contentStyle={CHART_TOOLTIP_STYLE} />
                                    <Bar dataKey="total" name="Tasks" radius={[0, 4, 4, 0]}>
                                        {statusData.map((entry) => (
                                            <Cell key={entry.status} fill={STATUS_CHART_COLOR[entry.status]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                <div className="card">
                    <SectionHeader
                        icon={Globe}
                        title="Open Tasks by Website"
                        subtitle={websiteData.length > 0 ? `Across ${websiteData.length} website${websiteData.length === 1 ? '' : 's'}` : undefined}
                    />
                    <div className="card-body" style={{ height: 260 }}>
                        {websiteData.length === 0 ? (
                            <EmptyState icon={Globe} title="No open tasks" text="Open tasks by website will show up here." />
                        ) : (
                            <ResponsiveContainer>
                                <BarChart data={websiteData} layout="vertical" margin={{ left: 16, right: 16 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" horizontal={false} />
                                    <XAxis type="number" allowDecimals={false} tick={CHART_TICK_STYLE} />
                                    <YAxis type="category" dataKey="name" width={130} tick={CHART_CATEGORY_TICK_STYLE} />
                                    <Tooltip cursor={{ fill: 'var(--bg-surface-secondary)' }} contentStyle={CHART_TOOLTIP_STYLE} />
                                    <Bar dataKey="total" name="Open Tasks" fill="var(--primary)" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                <div className="card">
                    <SectionHeader icon={Activity} title="Recent Activity" />
                    <div className="card-body" style={{ padding: recentActivity.length === 0 ? 0 : '8px 16px' }}>
                        {recentActivity.length === 0 ? (
                            <EmptyState icon={Activity} title="No activity yet" text="Task updates will show up here as work happens." />
                        ) : (
                            <ul className="activity-list">
                                {recentActivity.map((activity) => (
                                    <li className="activity-item" key={activity.id}>
                                        <div
                                            className="activity-avatar"
                                            style={{
                                                background:
                                                    'linear-gradient(135deg,var(--primary),var(--primary-dk))',
                                            }}
                                        >
                                            {initials(activity.user?.name ?? 'Sys')}
                                        </div>
                                        <div>
                                            <div className="activity-body">
                                                <Link href={route('tasks.show', activity.task_id)}>
                                                    <strong>{activity.task?.ticket_number}</strong>
                                                </Link>{' '}
                                                — {activity.user?.name ?? 'System'} {activityLabel(activity)}
                                            </div>
                                            <div className="activity-time">
                                                {new Date(activity.created_at).toLocaleString()}
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>

            {workloadOverview && (
                <div className="row col-3">
                    <div className="card" style={{ gridColumn: '1 / -1' }}>
                        <SectionHeader icon={Users} title="Team Workload" subtitle="Active tasks per team member" />
                        <div className="card-body">
                            <div className="row col-3" style={{ marginBottom: 0 }}>
                                {workloadOverview.map((member, index) => (
                                    <div key={member.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0' }}>
                                        <div
                                            className="avatar"
                                            style={{ background: AVATAR_PALETTE[index % AVATAR_PALETTE.length] }}
                                        >
                                            {initials(member.name)}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    fontSize: 13,
                                                    marginBottom: 4,
                                                }}
                                            >
                                                <span style={{ fontWeight: 500 }}>{member.name}</span>
                                                <span style={{ color: 'var(--text-muted)' }}>
                                                    {member.active_tasks_count} active
                                                </span>
                                            </div>
                                            <div className="progress-thin">
                                                <div
                                                    className="bar"
                                                    style={{
                                                        width: `${(member.active_tasks_count / maxWorkload) * 100}%`,
                                                        background: 'var(--primary)',
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
