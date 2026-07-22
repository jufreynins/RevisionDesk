import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { AppNotification, Paginated } from '@/types/models';
import { Head, Link, router } from '@inertiajs/react';
import {
    AlertTriangle,
    Bell,
    CheckCircle2,
    Clock,
    LucideIcon,
    MessageSquare,
    RotateCcw,
    UserPlus,
} from 'lucide-react';

interface NotificationsIndexProps {
    notifications: Paginated<AppNotification>;
}

const ICONS: Record<string, LucideIcon> = {
    task_assigned: UserPlus,
    task_reassigned: UserPlus,
    status_changed: Clock,
    comment_added: MessageSquare,
    ready_for_review: AlertTriangle,
    revision_requested: RotateCcw,
    approved: CheckCircle2,
    due_soon: Clock,
    overdue: AlertTriangle,
};

export default function Index({ notifications }: PageProps<NotificationsIndexProps>) {
    function markAsRead(notification: AppNotification) {
        if (!notification.read_at) {
            router.patch(route('notifications.read', notification.id), {}, { preserveScroll: true });
        }
        router.visit(route('tasks.show', notification.data.task_id));
    }

    function markAllAsRead() {
        router.patch(route('notifications.read-all'), {}, { preserveScroll: true });
    }

    return (
        <AuthenticatedLayout
            header={
                <>
                    <div>
                        <div className="page-pretitle">Workspace</div>
                        <h1 className="page-title">Notifications</h1>
                    </div>
                    <div className="page-actions">
                        <button onClick={markAllAsRead} className="btn btn-outline btn-sm">
                            Mark all as read
                        </button>
                    </div>
                </>
            }
        >
            <Head title="Notifications" />

            <div className="card">
                {notifications.data.length === 0 ? (
                    <div style={{ padding: '48px 16px', textAlign: 'center' }}>
                        <Bell width={32} height={32} strokeWidth={1.5} style={{ margin: '0 auto', color: 'var(--text-muted)' }} />
                        <p style={{ marginTop: 8, fontSize: 13, color: 'var(--text-muted)' }}>No notifications yet.</p>
                    </div>
                ) : (
                    <ul className="activity-list">
                        {notifications.data.map((notification) => {
                            const Icon = ICONS[notification.data.type] ?? Bell;
                            const isUnread = !notification.read_at;

                            return (
                                <li key={notification.id} style={{ background: isUnread ? 'var(--bg-surface-secondary, var(--surface-2))' : undefined }}>
                                    <button onClick={() => markAsRead(notification)} className="activity-item" style={{ width: '100%', textAlign: 'left' }}>
                                        <div
                                            className="activity-avatar"
                                            style={{
                                                background: isUnread ? 'var(--primary)' : 'var(--bg-surface-secondary, var(--surface-2))',
                                                color: isUnread ? '#fff' : 'var(--text-muted)',
                                            }}
                                        >
                                            <Icon width={16} height={16} strokeWidth={1.5} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div className="activity-body" style={{ fontWeight: isUnread ? 600 : 400 }}>
                                                {notification.data.message}
                                            </div>
                                            <div className="activity-time">
                                                {notification.data.actor_name && `${notification.data.actor_name} · `}
                                                {new Date(notification.created_at).toLocaleString()}
                                            </div>
                                        </div>
                                        {isUnread && (
                                            <span style={{ height: 8, width: 8, flexShrink: 0, borderRadius: '50%', background: 'var(--primary)' }} />
                                        )}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>

            {notifications.last_page > 1 && (
                <div className="pagination">
                    {notifications.links.map((link, index) => (
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
