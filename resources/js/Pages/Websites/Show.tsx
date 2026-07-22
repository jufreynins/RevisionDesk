import { PriorityBadge, StatusBadge } from '@/Components/Badges';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import CredentialsPanel from '@/Pages/Websites/Partials/CredentialsPanel';
import { PageProps } from '@/types';
import { Task, TaskActivity, Website } from '@/types/models';
import { Head, Link, router } from '@inertiajs/react';
import { ExternalLink, Pencil, Plus, Trash2 } from 'lucide-react';

interface CredentialSummary {
    id: number;
    label: string;
    login_url: string | null;
    notes: string | null;
    can_reveal: boolean;
    can_manage: boolean;
}

interface ShowProps {
    website: Website & { team_members?: { id: number; name: string; email: string }[] };
    openTasks: Task[];
    completedTasks: Task[];
    recentActivity: TaskActivity[];
    credentials: CredentialSummary[];
    canManageCredentials: boolean;
    canCreateCredential: boolean;
    canManageTeam: boolean;
}

export default function Show({
    website,
    openTasks,
    completedTasks,
    recentActivity,
    credentials,
    canManageCredentials,
    canCreateCredential,
    canManageTeam,
}: PageProps<ShowProps>) {
    function destroy() {
        if (confirm(`Archive ${website.name}? This can be restored later by an administrator.`)) {
            router.delete(route('websites.destroy', website.id));
        }
    }

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-zinc-900">{website.name}</h2>
                    <div className="flex gap-2">
                        <Link
                            href={route('websites.edit', website.id)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                        >
                            <Pencil className="h-3.5 w-3.5" /> Edit
                        </Link>
                        {canManageTeam && (
                            <button
                                onClick={destroy}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
                            >
                                <Trash2 className="h-3.5 w-3.5" /> Archive
                            </button>
                        )}
                    </div>
                </div>
            }
        >
            <Head title={website.name} />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-zinc-900">Open Tasks ({openTasks.length})</h3>
                            <Link
                                href={`${route('tasks.create')}?website_id=${website.id}`}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-800"
                            >
                                <Plus className="h-3.5 w-3.5" /> New Task
                            </Link>
                        </div>

                        {openTasks.length === 0 ? (
                            <p className="mt-3 text-sm text-zinc-500">No open tasks for this website.</p>
                        ) : (
                            <ul className="mt-3 divide-y divide-zinc-100">
                                {openTasks.map((task) => (
                                    <li key={task.id} className="flex items-center justify-between py-2.5">
                                        <Link
                                            href={route('tasks.show', task.id)}
                                            className="text-sm font-medium text-zinc-800 hover:underline"
                                        >
                                            {task.ticket_number} · {task.title}
                                        </Link>
                                        <div className="flex items-center gap-2">
                                            <PriorityBadge priority={task.priority} />
                                            <StatusBadge status={task.status} />
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
                        <h3 className="text-sm font-semibold text-zinc-900">
                            Completed Tasks ({completedTasks.length})
                        </h3>
                        {completedTasks.length === 0 ? (
                            <p className="mt-3 text-sm text-zinc-500">No completed tasks yet.</p>
                        ) : (
                            <ul className="mt-3 divide-y divide-zinc-100">
                                {completedTasks.map((task) => (
                                    <li key={task.id} className="flex items-center justify-between py-2.5">
                                        <Link
                                            href={route('tasks.show', task.id)}
                                            className="text-sm text-zinc-600 hover:underline"
                                        >
                                            {task.ticket_number} · {task.title}
                                        </Link>
                                        <StatusBadge status={task.status} />
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
                        <h3 className="mb-3 text-sm font-semibold text-zinc-900">Recent Activity</h3>
                        {recentActivity.length === 0 ? (
                            <p className="text-sm text-zinc-500">No recent activity.</p>
                        ) : (
                            <ul className="space-y-2">
                                {recentActivity.map((activity) => (
                                    <li key={activity.id} className="text-sm text-zinc-600">
                                        <Link
                                            href={route('tasks.show', activity.task_id)}
                                            className="font-medium text-zinc-900 hover:underline"
                                        >
                                            {activity.task?.ticket_number}
                                        </Link>{' '}
                                        — {activity.action.replace(/_/g, ' ')} by {activity.user?.name ?? 'system'}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
                        <h3 className="mb-3 text-sm font-semibold text-zinc-900">Website Information</h3>
                        <dl className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <dt className="text-zinc-500">Client</dt>
                                <dd className="text-zinc-800">{website.client_name}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-zinc-500">Platform</dt>
                                <dd className="capitalize text-zinc-800">{website.platform.replace('_', ' ')}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-zinc-500">Hosting</dt>
                                <dd className="text-zinc-800">{website.hosting_provider ?? '—'}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-zinc-500">Project Manager</dt>
                                <dd className="text-zinc-800">{website.project_manager?.name ?? '—'}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-zinc-500">Status</dt>
                                <dd className="capitalize text-zinc-800">{website.status.replace('_', ' ')}</dd>
                            </div>
                        </dl>
                        <a
                            href={website.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 hover:underline"
                        >
                            Visit website <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                    </div>

                    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
                        <h3 className="mb-3 text-sm font-semibold text-zinc-900">Assigned Team Members</h3>
                        {website.team_members && website.team_members.length > 0 ? (
                            <ul className="space-y-2 text-sm text-zinc-700">
                                {website.team_members.map((member) => (
                                    <li key={member.id}>{member.name}</li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-zinc-500">No team members assigned.</p>
                        )}
                    </div>

                    {website.notes && (
                        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
                            <h3 className="mb-2 text-sm font-semibold text-zinc-900">Notes</h3>
                            <p className="whitespace-pre-line text-sm text-zinc-600">{website.notes}</p>
                        </div>
                    )}

                    {canManageCredentials && (
                        <CredentialsPanel
                            websiteId={website.id}
                            credentials={credentials}
                            canCreateCredential={canCreateCredential}
                        />
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
