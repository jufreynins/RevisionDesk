import { PriorityBadge, StatusBadge } from '@/Components/Badges';
import HtmlContent from '@/Components/HtmlContent';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ActivityTimeline from '@/Pages/Tasks/Partials/ActivityTimeline';
import AttachmentsPanel from '@/Pages/Tasks/Partials/AttachmentsPanel';
import ChecklistPanel from '@/Pages/Tasks/Partials/ChecklistPanel';
import CommentsPanel from '@/Pages/Tasks/Partials/CommentsPanel';
import StatusActions from '@/Pages/Tasks/Partials/StatusActions';
import TimeTrackingPanel from '@/Pages/Tasks/Partials/TimeTrackingPanel';
import { PageProps } from '@/types';
import { Task, TaskComment, TaskPermissions } from '@/types/models';
import { Head } from '@inertiajs/react';
import { ExternalLink } from 'lucide-react';

interface ShowProps {
    task: Task;
    comments: TaskComment[];
    checklistProgress: string;
    totalMinutesSpent: number;
    permissions: TaskPermissions;
}

export default function Show({ task, comments, permissions }: PageProps<ShowProps>) {
    const openUrl = task.page_url || task.website?.url;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                            {task.ticket_number}
                        </p>
                        <h2 className="text-xl font-semibold text-zinc-900">{task.title}</h2>
                    </div>
                    {openUrl && (
                        <a
                            href={openUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800"
                        >
                            Open Website <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                    )}
                </div>
            }
        >
            <Head title={`${task.ticket_number} · ${task.title}`} />

            <div className="mb-6 flex flex-wrap items-center gap-3">
                <PriorityBadge priority={task.priority} />
                <StatusBadge status={task.status} />
                <StatusActions task={task} permissions={permissions} />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
                        <h3 className="mb-2 text-sm font-semibold text-zinc-900">Description</h3>
                        {task.description ? (
                            <HtmlContent html={task.description} />
                        ) : (
                            <p className="text-sm text-zinc-400">No description provided.</p>
                        )}
                    </div>

                    {(task.current_issue || task.requested_change || task.expected_result || task.steps_to_reproduce) && (
                        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
                            <h3 className="mb-3 text-sm font-semibold text-zinc-900">Revision Details</h3>
                            <dl className="space-y-3 text-sm">
                                {task.page_name && (
                                    <div>
                                        <dt className="text-xs font-medium text-zinc-500">Page</dt>
                                        <dd className="text-zinc-700">
                                            {task.page_name} {task.page_section && `— ${task.page_section}`}
                                        </dd>
                                    </div>
                                )}
                                {task.current_issue && (
                                    <div>
                                        <dt className="text-xs font-medium text-zinc-500">Current Issue</dt>
                                        <dd className="whitespace-pre-line text-zinc-700">{task.current_issue}</dd>
                                    </div>
                                )}
                                {task.requested_change && (
                                    <div>
                                        <dt className="text-xs font-medium text-zinc-500">Requested Change</dt>
                                        <dd className="whitespace-pre-line text-zinc-700">{task.requested_change}</dd>
                                    </div>
                                )}
                                {task.expected_result && (
                                    <div>
                                        <dt className="text-xs font-medium text-zinc-500">Expected Result</dt>
                                        <dd className="whitespace-pre-line text-zinc-700">{task.expected_result}</dd>
                                    </div>
                                )}
                                {task.steps_to_reproduce && (
                                    <div>
                                        <dt className="text-xs font-medium text-zinc-500">Steps to Reproduce</dt>
                                        <dd className="whitespace-pre-line text-zinc-700">{task.steps_to_reproduce}</dd>
                                    </div>
                                )}
                            </dl>
                        </div>
                    )}

                    {permissions.canAddInternalComment && task.internal_notes && (
                        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-5 shadow-sm">
                            <h3 className="mb-2 text-sm font-semibold text-amber-900">Internal Notes (staff only)</h3>
                            <p className="whitespace-pre-line text-sm text-amber-900">{task.internal_notes}</p>
                        </div>
                    )}

                    {task.client_notes && (
                        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
                            <h3 className="mb-2 text-sm font-semibold text-zinc-900">Client Notes</h3>
                            <p className="whitespace-pre-line text-sm text-zinc-700">{task.client_notes}</p>
                        </div>
                    )}

                    <AttachmentsPanel task={task} />

                    <CommentsPanel
                        task={task}
                        comments={comments}
                        canAddInternalComment={permissions.canAddInternalComment}
                    />

                    <ActivityTimeline activities={task.activities ?? []} />
                </div>

                <div className="space-y-6">
                    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
                        <h3 className="mb-3 text-sm font-semibold text-zinc-900">Task Information</h3>
                        <dl className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <dt className="text-zinc-500">Website</dt>
                                <dd className="text-zinc-800">{task.website?.name}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-zinc-500">Type</dt>
                                <dd className="capitalize text-zinc-800">{task.task_type.replace(/_/g, ' ')}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-zinc-500">Assigned To</dt>
                                <dd className="text-zinc-800">{task.assigned_to?.name ?? 'Unassigned'}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-zinc-500">Requester</dt>
                                <dd className="text-zinc-800">{task.requester?.name ?? '—'}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-zinc-500">Created</dt>
                                <dd className="text-zinc-800">{new Date(task.created_at).toLocaleDateString()}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-zinc-500">Due Date</dt>
                                <dd className="text-zinc-800">
                                    {task.due_date ? new Date(task.due_date).toLocaleDateString() : '—'}
                                </dd>
                            </div>
                            {task.browser && (
                                <div className="flex justify-between">
                                    <dt className="text-zinc-500">Browser</dt>
                                    <dd className="text-zinc-800">{task.browser}</dd>
                                </div>
                            )}
                            {task.device && (
                                <div className="flex justify-between">
                                    <dt className="text-zinc-500">Device</dt>
                                    <dd className="text-zinc-800">{task.device}</dd>
                                </div>
                            )}
                        </dl>

                        {task.tags && task.tags.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-1.5 border-t border-zinc-100 pt-3">
                                {task.tags.map((tag) => (
                                    <span
                                        key={tag.id}
                                        className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600"
                                    >
                                        {tag.name}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    <ChecklistPanel task={task} canEdit={permissions.canUpdateStatus || permissions.canEdit} />

                    <TimeTrackingPanel task={task} />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
