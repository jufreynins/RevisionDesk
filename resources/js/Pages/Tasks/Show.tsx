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
                <>
                    <div>
                        <div className="page-pretitle">{task.ticket_number}</div>
                        <h1 className="page-title">{task.title}</h1>
                    </div>
                    {openUrl && (
                        <div className="page-actions">
                            <a href={openUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                                Open Website <ExternalLink width={14} height={14} strokeWidth={1.5} />
                            </a>
                        </div>
                    )}
                </>
            }
        >
            <Head title={`${task.ticket_number} · ${task.title}`} />

            <div style={{ marginBottom: 16, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
                <PriorityBadge priority={task.priority} />
                <StatusBadge status={task.status} />
                <StatusActions task={task} permissions={permissions} />
            </div>

            <div className="row col-8-4">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div className="card">
                        <div className="card-header">
                            <div className="card-title">Description</div>
                        </div>
                        <div className="card-body">
                            {task.description ? (
                                <HtmlContent html={task.description} />
                            ) : (
                                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No description provided.</p>
                            )}
                        </div>
                    </div>

                    {(task.current_issue || task.requested_change || task.expected_result || task.steps_to_reproduce) && (
                        <div className="card">
                            <div className="card-header">
                                <div className="card-title">Revision Details</div>
                            </div>
                            <div className="card-body">
                                <dl style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13 }}>
                                    {task.page_name && (
                                        <div>
                                            <dt style={{ fontSize: 11, color: 'var(--text-muted)' }}>Page</dt>
                                            <dd>
                                                {task.page_name} {task.page_section && `— ${task.page_section}`}
                                            </dd>
                                        </div>
                                    )}
                                    {task.current_issue && (
                                        <div>
                                            <dt style={{ fontSize: 11, color: 'var(--text-muted)' }}>Current Issue</dt>
                                            <dd style={{ whiteSpace: 'pre-line' }}>{task.current_issue}</dd>
                                        </div>
                                    )}
                                    {task.requested_change && (
                                        <div>
                                            <dt style={{ fontSize: 11, color: 'var(--text-muted)' }}>Requested Change</dt>
                                            <dd style={{ whiteSpace: 'pre-line' }}>{task.requested_change}</dd>
                                        </div>
                                    )}
                                    {task.expected_result && (
                                        <div>
                                            <dt style={{ fontSize: 11, color: 'var(--text-muted)' }}>Expected Result</dt>
                                            <dd style={{ whiteSpace: 'pre-line' }}>{task.expected_result}</dd>
                                        </div>
                                    )}
                                    {task.steps_to_reproduce && (
                                        <div>
                                            <dt style={{ fontSize: 11, color: 'var(--text-muted)' }}>Steps to Reproduce</dt>
                                            <dd style={{ whiteSpace: 'pre-line' }}>{task.steps_to_reproduce}</dd>
                                        </div>
                                    )}
                                </dl>
                            </div>
                        </div>
                    )}

                    {task.internal_notes && (
                        <div className="card">
                            <div className="card-header">
                                <div className="card-title">Notes</div>
                            </div>
                            <div className="card-body">
                                <p style={{ fontSize: 13, whiteSpace: 'pre-line' }}>{task.internal_notes}</p>
                            </div>
                        </div>
                    )}

                    <AttachmentsPanel task={task} />

                    <CommentsPanel task={task} comments={comments} />

                    <ActivityTimeline activities={task.activities ?? []} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div className="card">
                        <div className="card-header">
                            <div className="card-title">Task Information</div>
                        </div>
                        <div className="card-body">
                            <dl style={{ fontSize: 13 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <dt style={{ color: 'var(--text-muted)' }}>Website</dt>
                                    <dd>{task.website?.name}</dd>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <dt style={{ color: 'var(--text-muted)' }}>Type</dt>
                                    <dd style={{ textTransform: 'capitalize' }}>{task.task_type.replace(/_/g, ' ')}</dd>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <dt style={{ color: 'var(--text-muted)' }}>Assigned To</dt>
                                    <dd>{task.assigned_to?.name ?? 'Unassigned'}</dd>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <dt style={{ color: 'var(--text-muted)' }}>Created</dt>
                                    <dd>{new Date(task.created_at).toLocaleDateString()}</dd>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <dt style={{ color: 'var(--text-muted)' }}>Due Date</dt>
                                    <dd>{task.due_date ? new Date(task.due_date).toLocaleDateString() : '—'}</dd>
                                </div>
                            </dl>
                        </div>
                    </div>

                    <ChecklistPanel task={task} canEdit={permissions.canUpdateStatus || permissions.canEdit} />

                    <TimeTrackingPanel task={task} />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
