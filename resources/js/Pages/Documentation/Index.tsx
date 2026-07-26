import { PriorityBadge, PRIORITY_OPTIONS, ROLE_BADGE_CLASS, ROLE_LABEL, StatusBadge, STATUS_OPTIONS } from '@/Components/Badges';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { TaskPriority, TaskStatus, UserRole } from '@/types/models';
import { Head } from '@inertiajs/react';
import { ArrowRight, BookOpen } from 'lucide-react';
import { ReactNode } from 'react';

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
    return (
        <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header">
                <div>
                    <div className="card-title">{title}</div>
                    {subtitle && <div className="card-subtitle">{subtitle}</div>}
                </div>
            </div>
            <div className="card-body">{children}</div>
        </div>
    );
}

function StatusChip({ status }: { status: TaskStatus }) {
    return (
        <div
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '7px 12px',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius)',
                background: 'var(--bg-surface)',
                whiteSpace: 'nowrap',
            }}
        >
            <StatusBadge status={status} />
        </div>
    );
}

const ROLE_CAPABILITIES: Record<UserRole, string[]> = {
    administrator: [
        'Everything a Project Manager can do',
        'Add, edit & deactivate team members',
        'Delete tasks and archive websites',
        'Change system-wide Settings',
    ],
    project_manager: [
        'Add websites and create tasks',
        'Assign tasks & set priority',
        'Approve work or send it back for revision',
        'Sees Reports & the Team list',
    ],
    developer: [
        'Sees tasks assigned to them',
        'Moves their own tasks forward',
        'Comments, attaches files, checks off steps',
        'Submits finished work for review',
    ],
};

const STATUS_INFO: Partial<Record<TaskStatus, { meaning: string; setBy: string }>> = {
    new: { meaning: 'Just logged, not yet assigned.', setBy: 'Manager' },
    assigned: { meaning: 'Handed to a developer, not started.', setBy: 'Manager' },
    in_progress: { meaning: 'Actively being worked on.', setBy: 'Developer' },
    blocked: { meaning: "Stuck — waiting on access, info, or a decision.", setBy: 'Developer' },
    waiting_for_client: { meaning: 'Paused until the client responds.', setBy: 'Developer' },
    ready_for_review: { meaning: "Work is done, waiting on a manager's check.", setBy: 'Developer' },
    revision_needed: { meaning: 'Reviewed and sent back with notes.', setBy: 'Manager' },
    approved: { meaning: 'Reviewed and signed off.', setBy: 'Manager' },
    completed: { meaning: 'Finished and closed.', setBy: 'Manager' },
    cancelled: { meaning: 'No longer needed — closed without finishing.', setBy: 'Manager' },
};

const PRIORITY_DESC: Record<TaskPriority, string> = {
    low: 'No rush',
    normal: 'Standard queue',
    high: 'Move it up',
    urgent: 'Same-day attention',
    critical: 'Drop everything',
};

const TEST_ACCOUNTS: { role: UserRole; name: string; email: string }[] = [
    { role: 'administrator', name: 'Alex Rivera', email: 'admin@revisiondesk.test' },
    { role: 'project_manager', name: 'Jordan Cruz', email: 'pm@revisiondesk.test' },
    { role: 'developer', name: 'Sam Dela Cruz', email: 'developer1@revisiondesk.test' },
    { role: 'developer', name: 'Riley Santos', email: 'developer2@revisiondesk.test' },
    { role: 'developer', name: 'Casey Reyes', email: 'developer3@revisiondesk.test' },
];

const FEATURES: { name: string; desc: string; who: string }[] = [
    { name: 'Dashboard', desc: 'Open tasks, urgent items, what’s overdue, and recent activity at a glance.', who: 'Everyone' },
    { name: 'Task Board', desc: 'A kanban view of every task by status — drag between columns to update.', who: 'Everyone' },
    { name: 'Calendar', desc: 'Tasks laid out by due date, so nothing quietly slips.', who: 'Everyone' },
    { name: 'Websites', desc: 'Every client site, its status, and how many open/completed tasks it has.', who: 'Everyone' },
    { name: 'Activity Log', desc: 'A running history of every status change, comment, and reassignment.', who: 'Everyone' },
    { name: 'Team', desc: 'Everyone on the roster and how many active tasks they’re carrying right now.', who: 'Admins & PMs' },
    { name: 'Reports', desc: 'Completion trends, workload by person, estimated vs. actual time.', who: 'Admins & PMs' },
    { name: 'Settings', desc: 'Company info, default priorities, ticket numbering, notification rules.', who: 'Admins only' },
    { name: 'Notifications', desc: 'Pinged when a task is assigned to you, reassigned, or changes status.', who: 'Everyone' },
];

const MANAGER_STEPS = [
    { title: 'Add the website', body: 'Once, per client — under Websites → Add Website. Set the platform, hosting, and who’s the PM.' },
    { title: 'Log a task', body: 'Whenever a request comes in. Pick the website, describe the issue, set a priority and due date.' },
    { title: 'Assign it', body: 'Hand it to a developer. It shows up on their My Tasks immediately.' },
    { title: 'Watch it move', body: 'The Dashboard shows what’s open, overdue, and waiting on you. The Task Board gives a kanban view of everything at once.' },
    { title: 'Review the submission', body: 'When a task hits Ready for Review, check the work and either Approve or Request Revision.' },
    { title: 'Close the loop', body: 'Mark it Completed. Check Reports weekly for turnaround time and team workload.' },
];

const DEVELOPER_STEPS = [
    { title: 'Check My Tasks', body: 'Everything assigned to you, sorted by priority and due date. Urgent and Critical items float to the top.' },
    { title: 'Open the task', body: 'Read the description, the page it affects, and any attachments the client or PM added.' },
    { title: 'Start Task', body: 'One click moves it to In Progress so everyone knows it’s being worked on.' },
    { title: 'Work it', body: 'Tick off checklist items, drop in comments and screenshots as you go. Hit a wall? Mark it Blocked and say why.' },
    { title: 'Submit for Review', body: 'When it’s done, send it to the PM. If they send it back, the notes are right there in the comments.' },
    { title: 'Done', body: 'Once approved, it’s off your plate — until it’s reopened, if the client asks for another change later.' },
];

function StepList({ steps }: { steps: { title: string; body: string }[] }) {
    return (
        <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {steps.map((step, index) => (
                <li key={step.title} style={{ display: 'flex', gap: 12 }}>
                    <div
                        style={{
                            flexShrink: 0,
                            width: 22,
                            height: 22,
                            borderRadius: '50%',
                            border: '1px solid var(--border-color)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 11,
                            color: 'var(--text-muted)',
                            marginTop: 1,
                        }}
                    >
                        {index + 1}
                    </div>
                    <div>
                        <div style={{ fontWeight: 600, fontSize: 13.5 }}>{step.title}</div>
                        <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginTop: 2 }}>{step.body}</div>
                    </div>
                </li>
            ))}
        </ol>
    );
}

export default function Documentation() {
    return (
        <AuthenticatedLayout
            header={
                <div>
                    <div className="page-pretitle">Admin</div>
                    <h1 className="page-title">Documentation</h1>
                </div>
            }
        >
            <Head title="Documentation" />

            <Section title="The Core Idea">
                <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', maxWidth: 680, lineHeight: 1.6 }}>
                    RevisionDesk tracks revision work across every client website in one place. The shape of it is
                    simple: a <strong>website</strong> can have many <strong>tasks</strong> (bugs, content edits,
                    design tweaks, anything a client asks for), and every task moves through a fixed set of{' '}
                    <strong>statuses</strong> from the moment it&rsquo;s logged to the moment it&rsquo;s approved and
                    closed. Everyone looks at the same tasks — what changes is what each person is allowed to do with
                    them.
                </p>
            </Section>

            <Section title="Roles" subtitle="Three account types, two ways of working">
                <div className="row col-3" style={{ marginBottom: 0 }}>
                    {(Object.keys(ROLE_LABEL) as UserRole[]).map((role) => (
                        <div key={role} className="card">
                            <div className="card-body">
                                <span className={`badge ${ROLE_BADGE_CLASS[role]}`}>{ROLE_LABEL[role]}</span>
                                <ul style={{ margin: '10px 0 0', paddingLeft: 18, fontSize: 12.5, color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 5 }}>
                                    {ROLE_CAPABILITIES[role].map((line) => (
                                        <li key={line}>{line}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            </Section>

            <Section title="Test Accounts" subtitle="Seeded logins for trying the app on a local or staging database">
                <div className="table-responsive">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Role</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Password</th>
                            </tr>
                        </thead>
                        <tbody>
                            {TEST_ACCOUNTS.map((account) => (
                                <tr key={account.email}>
                                    <td>
                                        <span className={`badge ${ROLE_BADGE_CLASS[account.role]}`}>{ROLE_LABEL[account.role]}</span>
                                    </td>
                                    <td>{account.name}</td>
                                    <td className="cell-mono">{account.email}</td>
                                    <td className="cell-mono">password</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <p style={{ marginTop: 12, fontSize: 12, color: 'var(--text-muted)' }}>
                    Created by <code style={{ fontFamily: 'var(--font-mono)' }}>php artisan migrate:fresh --seed</code>. Only run that against a local
                    or staging database — it wipes whatever is already there. Never use it against production.
                </p>
            </Section>

            <Section title="The Task Lifecycle" subtitle="Every task follows this path">
                <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 720 }}>
                        <StatusChip status="new" />
                        <ArrowRight width={14} height={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                        <StatusChip status="assigned" />
                        <ArrowRight width={14} height={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                        <StatusChip status="in_progress" />
                        <ArrowRight width={14} height={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <StatusChip status="blocked" />
                            <StatusChip status="waiting_for_client" />
                        </div>
                        <ArrowRight width={14} height={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                        <StatusChip status="ready_for_review" />
                        <ArrowRight width={14} height={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <StatusChip status="revision_needed" />
                            <StatusChip status="approved" />
                        </div>
                        <ArrowRight width={14} height={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                        <StatusChip status="completed" />
                    </div>
                </div>
                <p style={{ marginTop: 16, fontSize: 12.5, color: 'var(--text-muted)' }}>
                    A completed or approved task can always be <strong>reopened</strong> if something else comes up.
                    A task can also be <strong>cancelled</strong> at any point if it&rsquo;s no longer needed.
                </p>
            </Section>

            <Section title="Priority Levels" subtitle="Set when a task is created">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
                    {PRIORITY_OPTIONS.map((option) => (
                        <div key={option.value} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <PriorityBadge priority={option.value} />
                            <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{PRIORITY_DESC[option.value]}</span>
                        </div>
                    ))}
                </div>
            </Section>

            <div className="row col-2" style={{ alignItems: 'start' }}>
                <div className="card">
                    <div className="card-header">
                        <div>
                            <div className="card-title">For Admins &amp; PMs</div>
                            <div className="card-subtitle">Running the work</div>
                        </div>
                        <span className={`badge ${ROLE_BADGE_CLASS.project_manager}`}>Manager</span>
                    </div>
                    <div className="card-body">
                        <StepList steps={MANAGER_STEPS} />
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <div>
                            <div className="card-title">For Developers</div>
                            <div className="card-subtitle">Doing the work</div>
                        </div>
                        <span className={`badge ${ROLE_BADGE_CLASS.developer}`}>Developer</span>
                    </div>
                    <div className="card-body">
                        <StepList steps={DEVELOPER_STEPS} />
                    </div>
                </div>
            </div>

            <Section title="Where Things Live" subtitle="The sidebar, decoded">
                <div className="row col-3" style={{ marginBottom: 0 }}>
                    {FEATURES.map((feature) => (
                        <div key={feature.name} className="card">
                            <div className="card-body">
                                <div style={{ fontWeight: 600, fontSize: 13.5 }}>{feature.name}</div>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{feature.desc}</div>
                                <div style={{ fontSize: 10, letterSpacing: 0.4, textTransform: 'uppercase', color: 'var(--text-muted)', marginTop: 10 }}>
                                    {feature.who}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </Section>

            <Section title="Status Glossary" subtitle="Quick reference for what each label means">
                <div className="table-responsive">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Status</th>
                                <th>Meaning</th>
                                <th>Set by</th>
                            </tr>
                        </thead>
                        <tbody>
                            {STATUS_OPTIONS.map((option) => (
                                <tr key={option.value}>
                                    <td>
                                        <StatusBadge status={option.value} />
                                    </td>
                                    <td style={{ color: 'var(--text-secondary)' }}>{STATUS_INFO[option.value]?.meaning}</td>
                                    <td style={{ color: 'var(--text-muted)' }}>{STATUS_INFO[option.value]?.setBy}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Section>

            <p style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                <BookOpen width={13} height={13} strokeWidth={1.5} />
                Reflects the current workflow — if anything here doesn&rsquo;t match what you see on screen, let the team know.
            </p>
        </AuthenticatedLayout>
    );
}
