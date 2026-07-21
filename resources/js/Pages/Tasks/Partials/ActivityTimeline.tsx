import { TaskActivity } from '@/types/models';

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

export default function ActivityTimeline({ activities }: { activities: TaskActivity[] }) {
    return (
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-zinc-900">Activity History</h3>

            {activities.length === 0 ? (
                <p className="text-sm text-zinc-500">No activity yet.</p>
            ) : (
                <ol className="relative space-y-4 border-l border-zinc-200 pl-4">
                    {activities.map((activity) => (
                        <li key={activity.id} className="relative">
                            <span className="absolute -left-[21px] top-1 h-2 w-2 rounded-full bg-emerald-600" />
                            <p className="text-sm text-zinc-700">{describeActivity(activity)}</p>
                            <p className="text-xs text-zinc-400">{new Date(activity.created_at).toLocaleString()}</p>
                        </li>
                    ))}
                </ol>
            )}
        </div>
    );
}
