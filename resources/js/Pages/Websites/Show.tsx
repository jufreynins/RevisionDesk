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
                <>
                    <div>
                        <div className="page-pretitle">Client Work</div>
                        <h1 className="page-title">{website.name}</h1>
                    </div>
                    <div className="page-actions">
                        <Link href={route('websites.edit', website.id)} className="btn btn-outline">
                            <Pencil width={14} height={14} strokeWidth={1.5} /> Edit
                        </Link>
                        {canManageTeam && (
                            <button onClick={destroy} className="btn btn-danger">
                                <Trash2 width={14} height={14} strokeWidth={1.5} /> Archive
                            </button>
                        )}
                    </div>
                </>
            }
        >
            <Head title={website.name} />

            <div className="row col-8-4">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div className="card">
                        <div className="card-header">
                            <div className="card-title">Open Tasks ({openTasks.length})</div>
                            <Link href={`${route('tasks.create')}?website_id=${website.id}`} className="btn btn-primary btn-sm">
                                <Plus width={14} height={14} strokeWidth={1.5} /> New Task
                            </Link>
                        </div>
                        <div className="card-body" style={{ padding: '8px 16px' }}>
                            {openTasks.length === 0 ? (
                                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No open tasks for this website.</p>
                            ) : (
                                <ul className="activity-list">
                                    {openTasks.map((task) => (
                                        <li className="activity-item" key={task.id}>
                                            <div style={{ flex: 1 }}>
                                                <div className="activity-body">
                                                    <Link href={route('tasks.show', task.id)}>
                                                        <strong>{task.ticket_number}</strong> · {task.title}
                                                    </Link>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: 6 }}>
                                                <PriorityBadge priority={task.priority} />
                                                <StatusBadge status={task.status} />
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <div className="card-title">Completed Tasks ({completedTasks.length})</div>
                        </div>
                        <div className="card-body" style={{ padding: '8px 16px' }}>
                            {completedTasks.length === 0 ? (
                                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No completed tasks yet.</p>
                            ) : (
                                <ul className="activity-list">
                                    {completedTasks.map((task) => (
                                        <li className="activity-item" key={task.id}>
                                            <div className="activity-body">
                                                <Link href={route('tasks.show', task.id)}>
                                                    <strong>{task.ticket_number}</strong> · {task.title}
                                                </Link>
                                            </div>
                                            <StatusBadge status={task.status} />
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <div className="card-title">Recent Activity</div>
                        </div>
                        <div className="card-body" style={{ padding: '8px 16px' }}>
                            {recentActivity.length === 0 ? (
                                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No recent activity.</p>
                            ) : (
                                <ul className="activity-list">
                                    {recentActivity.map((activity) => (
                                        <li className="activity-item" key={activity.id}>
                                            <div className="activity-body">
                                                <Link href={route('tasks.show', activity.task_id)}>
                                                    <strong>{activity.task?.ticket_number}</strong>
                                                </Link>{' '}
                                                — {activity.action.replace(/_/g, ' ')} by {activity.user?.name ?? 'system'}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div className="card">
                        <div className="card-header">
                            <div className="card-title">Website Information</div>
                        </div>
                        <div className="card-body">
                            <dl style={{ fontSize: 13 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <dt style={{ color: 'var(--text-muted)' }}>Client</dt>
                                    <dd>{website.client_name}</dd>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <dt style={{ color: 'var(--text-muted)' }}>Platform</dt>
                                    <dd style={{ textTransform: 'capitalize' }}>{website.platform.replace('_', ' ')}</dd>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <dt style={{ color: 'var(--text-muted)' }}>Hosting</dt>
                                    <dd>{website.hosting_provider ?? '—'}</dd>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <dt style={{ color: 'var(--text-muted)' }}>Project Manager</dt>
                                    <dd>{website.project_manager?.name ?? '—'}</dd>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <dt style={{ color: 'var(--text-muted)' }}>Status</dt>
                                    <dd style={{ textTransform: 'capitalize' }}>{website.status.replace('_', ' ')}</dd>
                                </div>
                            </dl>
                            <a
                                href={website.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ marginTop: 14, display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13 }}
                            >
                                Visit website <ExternalLink width={14} height={14} strokeWidth={1.5} />
                            </a>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <div className="card-title">Assigned Team Members</div>
                        </div>
                        <div className="card-body">
                            {website.team_members && website.team_members.length > 0 ? (
                                <ul style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
                                    {website.team_members.map((member) => (
                                        <li key={member.id}>{member.name}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No team members assigned.</p>
                            )}
                        </div>
                    </div>

                    {website.notes && (
                        <div className="card">
                            <div className="card-header">
                                <div className="card-title">Notes</div>
                            </div>
                            <div className="card-body">
                                <p style={{ fontSize: 13, color: 'var(--text-secondary)', whiteSpace: 'pre-line' }}>
                                    {website.notes}
                                </p>
                            </div>
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
