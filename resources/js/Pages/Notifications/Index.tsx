import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { AppNotification, Paginated } from '@/types/models';
import { Head, Link, router } from '@inertiajs/react';
import {
    AlertTriangle,
    Bell,
    CheckCircle2,
    Clock,
    MessageSquare,
    RotateCcw,
    UserPlus,
} from 'lucide-react';
import { ComponentType } from 'react';

interface NotificationsIndexProps {
    notifications: Paginated<AppNotification>;
}

const ICONS: Record<string, ComponentType<{ className?: string }>> = {
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
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-zinc-900">Notifications</h2>
                    <button
                        onClick={markAllAsRead}
                        className="text-sm font-medium text-emerald-700 hover:underline"
                    >
                        Mark all as read
                    </button>
                </div>
            }
        >
            <Head title="Notifications" />

            <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
                {notifications.data.length === 0 ? (
                    <div className="py-16 text-center">
                        <Bell className="mx-auto h-8 w-8 text-zinc-300" />
                        <p className="mt-2 text-sm text-zinc-500">No notifications yet.</p>
                    </div>
                ) : (
                    <ul className="divide-y divide-zinc-100">
                        {notifications.data.map((notification) => {
                            const Icon = ICONS[notification.data.type] ?? Bell;
                            const isUnread = !notification.read_at;

                            return (
                                <li key={notification.id}>
                                    <button
                                        onClick={() => markAsRead(notification)}
                                        className={`flex w-full items-start gap-3 px-5 py-4 text-left hover:bg-zinc-50 ${
                                            isUnread ? 'bg-emerald-50/40' : ''
                                        }`}
                                    >
                                        <span
                                            className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                                                isUnread ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-100 text-zinc-500'
                                            }`}
                                        >
                                            <Icon className="h-4 w-4" />
                                        </span>
                                        <span className="flex-1">
                                            <span className={`block text-sm ${isUnread ? 'font-semibold text-zinc-900' : 'text-zinc-700'}`}>
                                                {notification.data.message}
                                            </span>
                                            <span className="mt-0.5 block text-xs text-zinc-400">
                                                {notification.data.actor_name && `${notification.data.actor_name} · `}
                                                {new Date(notification.created_at).toLocaleString()}
                                            </span>
                                        </span>
                                        {isUnread && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emerald-600" />}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>

            {notifications.last_page > 1 && (
                <div className="mt-6 flex flex-wrap gap-2">
                    {notifications.links.map((link, index) => (
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
