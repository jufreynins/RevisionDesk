import EmptyState from '@/Components/EmptyState';
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
                <>
                    <div>
                        <div className="page-pretitle">Client Work</div>
                        <h1 className="page-title">Activity Log</h1>
                    </div>
                    <div className="page-actions">
                        <select value={filters.website_id ?? ''} onChange={(e) => filterByWebsite(e.target.value)} className="form-control">
                            <option value="">All websites</option>
                            {websites.map((w) => (
                                <option key={w.id} value={w.id}>
                                    {w.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </>
            }
        >
            <Head title="Activity Log" />

            <div className="card">
                {activities.data.length === 0 ? (
                    <EmptyState icon={Activity} title="No activity yet" text="Task updates will show up here as work happens." />
                ) : (
                    <ul className="activity-list">
                        {activities.data.map((activity) => (
                            <li className="activity-item" key={activity.id} style={{ justifyContent: 'space-between' }}>
                                <div>
                                    <Link href={route('tasks.show', activity.task_id)} className="activity-body" style={{ fontWeight: 600 }}>
                                        {activity.task?.ticket_number} · {activity.task?.title}
                                    </Link>
                                    <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{describeActivity(activity)}</p>
                                </div>
                                <span style={{ flexShrink: 0, fontSize: 11, color: 'var(--text-muted)' }}>
                                    {new Date(activity.created_at).toLocaleString()}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {activities.last_page > 1 && (
                <div className="pagination">
                    {activities.links.map((link, index) => (
                        <Link
                            key={index}
                            href={link.url ?? '#'}
                            className={`page-link ${link.active ? 'active' : ''} ${!link.url ? 'disabled' : ''}`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            )}
        </AuthenticatedLayout>
    );
}
