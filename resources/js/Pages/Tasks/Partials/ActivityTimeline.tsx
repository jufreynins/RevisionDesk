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
        <div className="card">
            <div className="card-header">
                <div className="card-title">Activity History</div>
            </div>
            <div className="card-body">
                {activities.length === 0 ? (
                    <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No activity yet.</p>
                ) : (
                    <div className="timeline">
                        {activities.map((activity) => (
                            <div className="timeline-item" key={activity.id}>
                                <div className="ti-time">{new Date(activity.created_at).toLocaleString()}</div>
                                <div className="ti-title">{describeActivity(activity)}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
