import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Paginated, User } from '@/types/models';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Plus, Search, UserX } from 'lucide-react';
import { useState } from 'react';

interface TeamUser extends User {
    active_tasks_count: number;
}

interface TeamIndexProps {
    users: Paginated<TeamUser>;
    filters: { role?: string; search?: string };
}

const ROLE_LABEL: Record<string, string> = {
    administrator: 'Administrator',
    project_manager: 'Project Manager',
    developer: 'Developer',
};

const ROLE_BADGE: Record<string, string> = {
    administrator: 'badge-red',
    project_manager: 'badge-blue',
    developer: 'badge-teal',
};

export default function Index({ users, filters }: PageProps<TeamIndexProps>) {
    const { auth } = usePage<PageProps>().props;
    const isAdmin = auth.user.role === 'administrator';
    const [search, setSearch] = useState(filters.search ?? '');

    function filterByRole(role: string) {
        router.get(route('team.index'), { ...filters, role: role || undefined }, { preserveState: true });
    }

    function submitSearch(e: React.FormEvent) {
        e.preventDefault();
        router.get(route('team.index'), { ...filters, search }, { preserveState: true });
    }

    function deactivate(user: TeamUser) {
        if (confirm(`Deactivate ${user.name}? They will no longer be able to log in.`)) {
            router.delete(route('team.destroy', user.id));
        }
    }

    return (
        <AuthenticatedLayout
            header={
                <>
                    <div>
                        <div className="page-pretitle">Admin</div>
                        <h1 className="page-title">Team</h1>
                    </div>
                    {isAdmin && (
                        <div className="page-actions">
                            <Link href={route('team.create')} className="btn btn-primary">
                                <Plus width={16} height={16} strokeWidth={1.5} /> Add Team Member
                            </Link>
                        </div>
                    )}
                </>
            }
        >
            <Head title="Team" />

            <div className="card" style={{ marginBottom: 16 }}>
                <div className="card-body" style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                    <form onSubmit={submitSearch} className="input-group" style={{ maxWidth: 260 }}>
                        <Search className="input-icon" width={14} height={14} strokeWidth={1.5} />
                        <input
                            className="form-control"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search name or email..."
                        />
                    </form>
                    <select value={filters.role ?? ''} onChange={(e) => filterByRole(e.target.value)} className="form-control" style={{ maxWidth: 200 }}>
                        <option value="">All roles</option>
                        {Object.entries(ROLE_LABEL).map(([value, label]) => (
                            <option key={value} value={value}>
                                {label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="card">
                <div className="table-responsive">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Active Tasks</th>
                                <th>Status</th>
                                {isAdmin && <th />}
                            </tr>
                        </thead>
                        <tbody>
                            {users.data.map((member) => (
                                <tr key={member.id}>
                                    <td className="cell-strong">{member.name}</td>
                                    <td>{member.email}</td>
                                    <td>
                                        {ROLE_BADGE[member.role] ? (
                                            <span className={`badge ${ROLE_BADGE[member.role]}`}>{ROLE_LABEL[member.role]}</span>
                                        ) : (
                                            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{ROLE_LABEL[member.role]}</span>
                                        )}
                                    </td>
                                    <td>{member.active_tasks_count}</td>
                                    <td>
                                        {member.is_active ? (
                                            <span className="status status-green">Active</span>
                                        ) : (
                                            <span className="status status-red">Inactive</span>
                                        )}
                                    </td>
                                    {isAdmin && (
                                        <td style={{ textAlign: 'right' }}>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                                                <Link href={route('team.edit', member.id)} style={{ fontSize: 12 }}>
                                                    Edit
                                                </Link>
                                                {member.id !== auth.user.id && (
                                                    <button
                                                        onClick={() => deactivate(member)}
                                                        style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--red)' }}
                                                    >
                                                        <UserX width={12} height={12} strokeWidth={1.5} /> Deactivate
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {users.last_page > 1 && (
                <div className="pagination">
                    {users.links.map((link, index) => (
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
