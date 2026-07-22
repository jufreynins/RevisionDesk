import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Paginated, TaskActivity, Website } from '@/types/models';
import { Head, Link, router } from '@inertiajs/react';
import { Activity } from 'lucide-react';

interface ActivityLogIndexProps {
    activities: Paginated<TaskActivity>;
    websites: Website[];
    filters: { website_id?: string };
}

function describeActivity(activity: TaskActivity): string {
    const actor = activity.user?.name ?? 'System';

    switch (activity.action) {
        case 'created':
            return `${actor} created this task`;
        case 'status_changed':
            return `${actor} changed status from ${activity.previous_value ?? '—'} to ${activity.new_value}`;
        case 'priority_changed':
            return `${actor} changed priority from ${activity.previous_value ?? '—'} to ${activity.new_value}`;
        case 'assigned_to_id_changed':
            return `${actor} reassigned this task`;
        case 'assigned':
            return `${actor} assigned this task to ${activity.new_value}`;
        case 'comment_added':
            return `${actor} added a comment`;
        case 'reopened':
            return `${actor} reopened this task`;
        default:
            return `${actor} ${activity.action.replace(/_/g, ' ')}`;
    }
}

export default function Index({ activities, websites, filters }: PageProps<ActivityLogIndexProps>) {
    function filterByWebsite(websiteId: string) {
        router.get(route('activity-log.index'), { website_id: websiteId || undefined }, { preserveState: true });
    }

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-zinc-900">Activity Log</h2>
                    <select
                        value={filters.website_id ?? ''}
                        onChange={(e) => filterByWebsite(e.target.value)}
                        className="rounded-lg border-zinc-300 py-1.5 text-sm focus:border-emerald-600 focus:ring-emerald-600"
                    >
                        <option value="">All websites</option>
                        {websites.map((w) => (
                            <option key={w.id} value={w.id}>
                                {w.name}
                            </option>
                        ))}
                    </select>
                </div>
            }
        >
            <Head title="Activity Log" />

            <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
                {activities.data.length === 0 ? (
                    <div className="py-16 text-center">
                        <Activity className="mx-auto h-8 w-8 text-zinc-300" />
                        <p className="mt-2 text-sm text-zinc-500">No activity yet.</p>
                    </div>
                ) : (
                    <ul className="divide-y divide-zinc-100">
                        {activities.data.map((activity) => (
                            <li key={activity.id} className="flex items-start justify-between gap-3 px-5 py-4">
                                <div>
                                    <Link
                                        href={route('tasks.show', activity.task_id)}
                                        className="text-sm font-medium text-zinc-900 hover:underline"
                                    >
                                        {activity.task?.ticket_number} · {activity.task?.title}
                                    </Link>
                                    <p className="text-sm text-zinc-600">{describeActivity(activity)}</p>
                                </div>
                                <span className="shrink-0 text-xs text-zinc-400">
                                    {new Date(activity.created_at).toLocaleString()}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {activities.last_page > 1 && (
                <div className="mt-6 flex flex-wrap gap-2">
                    {activities.links.map((link, index) => (
                        <Link
                            key={index}
                            href={link.url ?? '#'}
                            className={`rounded-md px-3 py-1.5 text-sm ${
                                link.active
                                    ? 'bg-emerald-700 text-white'
                                    : 'border border-zinc-300 bg-white text-zinc-600 hover:bg-zinc-50'
                            } ${!link.url ? 'pointer-events-none opacity-50' : ''}`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            )}
        </AuthenticatedLayout>
    );
}
