import { PriorityBadge } from '@/Components/Badges';
import StatCard from '@/Components/StatCard';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Task, TaskActivity } from '@/types/models';
import { Head, Link } from '@inertiajs/react';
import {
    AlertTriangle,
    CalendarClock,
    CheckCircle2,
    Clock,
    ListTodo,
    Plus,
} from 'lucide-react';

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
            return `${actor} created this task`;
        case 'status_changed':
            return `${actor} changed status to ${activity.new_value}`;
        case 'assigned_to_id_changed':
            return `${actor} reassigned the task`;
        case 'priority_changed':
            return `${actor} changed priority to ${activity.new_value}`;
        case 'comment_added':
            return `${actor} added a comment`;
        case 'reopened':
            return `${actor} reopened the task`;
        default:
            return `${actor} updated the task`;
    }
}

export default function Dashboard({
    stats,
    tasksByStatus,
    tasksByWebsite,
    myUrgentTasks,
    upcomingDueDates,
    recentActivity,
    workloadOverview,
}: PageProps<DashboardProps>) {
    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold text-zinc-900">Dashboard</h2>}
        >
            <Head title="Dashboard" />

            <div className="mb-6 flex flex-wrap gap-3">
                <Link
                    href={route('tasks.create')}
                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
                >
                    <Plus className="h-4 w-4" /> Add New Task
                </Link>
                <Link
                    href={route('websites.create')}
                    className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
                >
                    <Plus className="h-4 w-4" /> Add Website
                </Link>
                <Link
                    href={`${route('tasks.index')}?view=mine`}
                    className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
                >
                    View My Tasks
                </Link>
                <Link
                    href={`${route('tasks.index')}?priority=urgent`}
                    className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
                >
                    View Urgent Tasks
                </Link>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                <StatCard label="Open Tasks" value={stats.totalOpenTasks} icon={ListTodo} />
                <StatCard label="My Tasks" value={stats.myTasksCount} icon={ListTodo} tone="default" />
                <StatCard label="Urgent" value={stats.urgentTasksCount} icon={AlertTriangle} tone="urgent" />
                <StatCard label="Overdue" value={stats.overdueTasksCount} icon={Clock} tone="warning" />
                <StatCard
                    label="Waiting Review"
                    value={stats.waitingForReviewCount}
                    icon={CalendarClock}
                    tone="warning"
                />
                <StatCard
                    label="Completed This Week"
                    value={stats.completedThisWeekCount}
                    icon={CheckCircle2}
                    tone="success"
                />
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm lg:col-span-2">
                    <h3 className="mb-4 text-sm font-semibold text-zinc-900">Upcoming Due Dates</h3>
                    {upcomingDueDates.length === 0 ? (
                        <p className="text-sm text-zinc-500">Nothing due in the next 7 days.</p>
                    ) : (
                        <ul className="divide-y divide-zinc-100">
                            {upcomingDueDates.map((task) => (
                                <li key={task.id} className="flex items-center justify-between py-3">
                                    <div>
                                        <Link
                                            href={route('tasks.show', task.id)}
                                            className="text-sm font-medium text-zinc-900 hover:underline"
                                        >
                                            {task.ticket_number} · {task.title}
                                        </Link>
                                        <p className="text-xs text-zinc-500">
                                            {task.website?.name} · Due{' '}
                                            {new Date(task.due_date as string).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <PriorityBadge priority={task.priority} />
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
                    <h3 className="mb-4 text-sm font-semibold text-zinc-900">My Urgent Tasks</h3>
                    {myUrgentTasks.length === 0 ? (
                        <p className="text-sm text-zinc-500">No urgent tasks assigned to you.</p>
                    ) : (
                        <ul className="space-y-3">
                            {myUrgentTasks.map((task) => (
                                <li key={task.id}>
                                    <Link
                                        href={route('tasks.show', task.id)}
                                        className="text-sm font-medium text-zinc-900 hover:underline"
                                    >
                                        {task.ticket_number} · {task.title}
                                    </Link>
                                    <p className="text-xs text-zinc-500">{task.website?.name}</p>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
                    <h3 className="mb-4 text-sm font-semibold text-zinc-900">Tasks by Status</h3>
                    <ul className="space-y-2">
                        {Object.entries(tasksByStatus).map(([status, count]) => (
                            <li key={status} className="flex items-center justify-between text-sm">
                                <span className="capitalize text-zinc-600">{status.replace(/_/g, ' ')}</span>
                                <span className="font-semibold text-zinc-900">{count}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
                    <h3 className="mb-4 text-sm font-semibold text-zinc-900">Open Tasks by Website</h3>
                    <ul className="space-y-2">
                        {Object.entries(tasksByWebsite).map(([name, count]) => (
                            <li key={name} className="flex items-center justify-between text-sm">
                                <span className="text-zinc-600">{name}</span>
                                <span className="font-semibold text-zinc-900">{count}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
                    <h3 className="mb-4 text-sm font-semibold text-zinc-900">Recent Activity</h3>
                    {recentActivity.length === 0 ? (
                        <p className="text-sm text-zinc-500">No recent activity.</p>
                    ) : (
                        <ul className="space-y-3">
                            {recentActivity.map((activity) => (
                                <li key={activity.id} className="text-sm">
                                    <Link
                                        href={route('tasks.show', activity.task_id)}
                                        className="font-medium text-zinc-900 hover:underline"
                                    >
                                        {activity.task?.ticket_number}
                                    </Link>
                                    <p className="text-xs text-zinc-500">{activityLabel(activity)}</p>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {workloadOverview && (
                <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
                    <h3 className="mb-4 text-sm font-semibold text-zinc-900">Team Workload</h3>
                    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {workloadOverview.map((member) => (
                            <li
                                key={member.id}
                                className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2 text-sm"
                            >
                                <span className="text-zinc-700">{member.name}</span>
                                <span className="font-semibold text-zinc-900">
                                    {member.active_tasks_count} active
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
