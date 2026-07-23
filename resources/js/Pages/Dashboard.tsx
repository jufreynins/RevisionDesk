import { PriorityBadge } from '@/Components/Badges';
import AuthenticatedLayout, { PageHeader } from '@/Layouts/AuthenticatedLayout';
import { consumeAutoStart } from '@/tour/tourStore';
import { useTour } from '@/tour/useTour';
import { PageProps } from '@/types';
import { Task, TaskActivity } from '@/types/models';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    CalendarClock,
    CheckCircle2,
    Clock,
    ListTodo,
    Plus,
    Sparkles,
    Users,
} from 'lucide-react';
import { useEffect } from 'react';

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
                            <div className="card" key={card.label}>
                                <div className="stat">
                                    <div className={`stat-icon ${card.color}`}>
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
                            <div className="card" key={card.label}>
                                <div className="stat">
                                    <div className={`stat-icon ${card.color}`}>
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
                    <div className="card-header">
                        <div className="card-title">Upcoming Due Dates</div>
                    </div>
                    <div className="card-body" style={{ padding: '8px 16px' }}>
                        {upcomingDueDates.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Nothing due in the next 7 days.</p>
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
                    <div className="card-header">
                        <div className="card-title">My Urgent Tasks</div>
                    </div>
                    <div className="card-body" style={{ padding: '8px 16px' }}>
                        {myUrgentTasks.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No urgent tasks assigned to you.</p>
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
                    <div className="card-header">
                        <div className="card-title">Tasks by Status</div>
                    </div>
                    <div className="card-body" style={{ padding: '8px 16px' }}>
                        {Object.entries(tasksByStatus).map(([status, count]) => (
                            <div className="toggle-row" key={status}>
                                <div className="label" style={{ textTransform: 'capitalize' }}>
                                    {status.replace(/_/g, ' ')}
                                </div>
                                <strong>{count}</strong>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <div className="card-title">Open Tasks by Website</div>
                    </div>
                    <div className="card-body" style={{ padding: '8px 16px' }}>
                        {Object.entries(tasksByWebsite).map(([name, count]) => (
                            <div className="toggle-row" key={name}>
                                <div className="label">{name}</div>
                                <strong>{count}</strong>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <div className="card-title">Recent Activity</div>
                    </div>
                    <div className="card-body" style={{ padding: '8px 16px' }}>
                        {recentActivity.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No recent activity.</p>
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
                        <div className="card-header">
                            <div className="card-title">Team Workload</div>
                        </div>
                        <div className="card-body">
                            <div className="row col-3" style={{ marginBottom: 0 }}>
                                {workloadOverview.map((member) => (
                                    <div className="toggle-row" key={member.id}>
                                        <div className="label">{member.name}</div>
                                        <strong>{member.active_tasks_count} active</strong>
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
