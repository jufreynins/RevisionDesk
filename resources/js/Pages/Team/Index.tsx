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
    client: 'Client',
};

const ROLE_CLASSES: Record<string, string> = {
    administrator: 'bg-purple-50 text-purple-700',
    project_manager: 'bg-blue-50 text-blue-700',
    developer: 'bg-emerald-50 text-emerald-700',
    client: 'bg-zinc-100 text-zinc-600',
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
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-zinc-900">Team</h2>
                    {isAdmin && (
                        <Link
                            href={route('team.create')}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-800"
                        >
                            <Plus className="h-4 w-4" /> Add Team Member
                        </Link>
                    )}
                </div>
            }
        >
            <Head title="Team" />

            <div className="mb-4 flex flex-wrap items-center gap-2">
                <form onSubmit={submitSearch} className="relative">
                    <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search name or email..."
                        className="w-64 rounded-lg border-zinc-300 py-2 pl-9 text-sm focus:border-emerald-600 focus:ring-emerald-600"
                    />
                </form>
                <select
                    value={filters.role ?? ''}
                    onChange={(e) => filterByRole(e.target.value)}
                    className="rounded-lg border-zinc-300 py-2 text-sm focus:border-emerald-600 focus:ring-emerald-600"
                >
                    <option value="">All roles</option>
                    {Object.entries(ROLE_LABEL).map(([value, label]) => (
                        <option key={value} value={value}>
                            {label}
                        </option>
                    ))}
                </select>
            </div>

            <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
                <table className="min-w-full divide-y divide-zinc-200 text-sm">
                    <thead className="bg-zinc-50 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
                        <tr>
                            <th className="px-4 py-3">Name</th>
                            <th className="px-4 py-3">Email</th>
                            <th className="px-4 py-3">Role</th>
                            <th className="px-4 py-3">Active Tasks</th>
                            <th className="px-4 py-3">Status</th>
                            {isAdmin && <th className="px-4 py-3" />}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                        {users.data.map((member) => (
                            <tr key={member.id}>
                                <td className="px-4 py-3 font-medium text-zinc-900">{member.name}</td>
                                <td className="px-4 py-3 text-zinc-500">{member.email}</td>
                                <td className="px-4 py-3">
                                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${ROLE_CLASSES[member.role]}`}>
                                        {ROLE_LABEL[member.role]}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-zinc-700">{member.active_tasks_count}</td>
                                <td className="px-4 py-3">
                                    {member.is_active ? (
                                        <span className="text-xs font-medium text-emerald-700">Active</span>
                                    ) : (
                                        <span className="text-xs font-medium text-zinc-400">Inactive</span>
                                    )}
                                </td>
                                {isAdmin && (
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-3">
                                            <Link
                                                href={route('team.edit', member.id)}
                                                className="text-xs font-medium text-emerald-700 hover:underline"
                                            >
                                                Edit
                                            </Link>
                                            {member.id !== auth.user.id && (
                                                <button
                                                    onClick={() => deactivate(member)}
                                                    className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:underline"
                                                >
                                                    <UserX className="h-3 w-3" /> Deactivate
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

            {users.last_page > 1 && (
                <div className="mt-6 flex flex-wrap gap-2">
                    {users.links.map((link, index) => (
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
