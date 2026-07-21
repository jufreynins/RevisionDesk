import { PriorityBadge, STATUS_OPTIONS, StatusBadge } from '@/Components/Badges';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Paginated, Tag, Task, User, Website } from '@/types/models';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Search, X } from 'lucide-react';
import { FormEvent, useState } from 'react';

interface IndexProps {
    tasks: Paginated<Task>;
    filters: Record<string, string | undefined>;
    websites: Website[];
    users: User[];
    tags: Tag[];
}

export default function Index({ tasks, filters, websites, users }: PageProps<IndexProps>) {
    const [search, setSearch] = useState(filters.search ?? '');

    function applyFilter(key: string, value: string | undefined) {
        router.get(route('tasks.index'), { ...filters, [key]: value || undefined }, { preserveState: true });
    }

    function submitSearch(e: FormEvent) {
        e.preventDefault();
        applyFilter('search', search);
    }

    function clearFilters() {
        setSearch('');
        router.get(route('tasks.index'));
    }

    const activeFilterCount = Object.entries(filters).filter(
        ([k, v]) => v && !['view', 'sort'].includes(k),
    ).length;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-zinc-900">
                        {filters.view === 'all' ? 'All Tasks' : 'My Tasks'}
                    </h2>
                    <Link
                        href={route('tasks.create')}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-800"
                    >
                        <Plus className="h-4 w-4" /> Add Task
                    </Link>
                </div>
            }
        >
            <Head title="Tasks" />

            <div className="mb-4 flex flex-wrap items-center gap-2">
                <form onSubmit={submitSearch} className="relative">
                    <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search title or ticket #..."
                        className="w-60 rounded-lg border-zinc-300 py-2 pl-9 text-sm focus:border-emerald-600 focus:ring-emerald-600"
                    />
                </form>

                <select
                    value={filters.website_id ?? ''}
                    onChange={(e) => applyFilter('website_id', e.target.value)}
                    className="rounded-lg border-zinc-300 py-2 text-sm focus:border-emerald-600 focus:ring-emerald-600"
                >
                    <option value="">All websites</option>
                    {websites.map((w) => (
                        <option key={w.id} value={w.id}>
                            {w.name}
                        </option>
                    ))}
                </select>

                <select
                    value={filters.assigned_to_id ?? ''}
                    onChange={(e) => applyFilter('assigned_to_id', e.target.value)}
                    className="rounded-lg border-zinc-300 py-2 text-sm focus:border-emerald-600 focus:ring-emerald-600"
                >
                    <option value="">Anyone assigned</option>
                    {users.map((u) => (
                        <option key={u.id} value={u.id}>
                            {u.name}
                        </option>
                    ))}
                </select>

                <select
                    value={filters.priority ?? ''}
                    onChange={(e) => applyFilter('priority', e.target.value)}
                    className="rounded-lg border-zinc-300 py-2 text-sm focus:border-emerald-600 focus:ring-emerald-600"
                >
                    <option value="">Any priority</option>
                    {['low', 'normal', 'high', 'urgent', 'critical'].map((p) => (
                        <option key={p} value={p}>
                            {p}
                        </option>
                    ))}
                </select>

                <select
                    value={filters.status ?? ''}
                    onChange={(e) => applyFilter('status', e.target.value)}
                    className="rounded-lg border-zinc-300 py-2 text-sm focus:border-emerald-600 focus:ring-emerald-600"
                >
                    <option value="">Any status</option>
                    {STATUS_OPTIONS.map((s) => (
                        <option key={s.value} value={s.value}>
                            {s.label}
                        </option>
                    ))}
                </select>

                <label className="flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-600">
                    <input
                        type="checkbox"
                        checked={filters.overdue === '1' || filters.overdue === 'true'}
                        onChange={(e) => applyFilter('overdue', e.target.checked ? '1' : undefined)}
                        className="rounded border-zinc-300 text-emerald-700 focus:ring-emerald-600"
                    />
                    Overdue only
                </label>

                <select
                    value={filters.sort ?? 'newest'}
                    onChange={(e) => applyFilter('sort', e.target.value)}
                    className="ml-auto rounded-lg border-zinc-300 py-2 text-sm focus:border-emerald-600 focus:ring-emerald-600"
                >
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                    <option value="priority">Priority</option>
                    <option value="due_date">Due Date</option>
                    <option value="updated">Recently Updated</option>
                </select>

                {activeFilterCount > 0 && (
                    <button
                        onClick={clearFilters}
                        className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700"
                    >
                        <X className="h-3.5 w-3.5" /> Clear filters
                    </button>
                )}
            </div>

            <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
                <div className="hidden overflow-x-auto lg:block">
                    <table className="min-w-full divide-y divide-zinc-200 text-sm">
                        <thead className="bg-zinc-50 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
                            <tr>
                                <th className="px-4 py-3">Ticket</th>
                                <th className="px-4 py-3">Title</th>
                                <th className="px-4 py-3">Website</th>
                                <th className="px-4 py-3">Priority</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Assigned</th>
                                <th className="px-4 py-3">Requester</th>
                                <th className="px-4 py-3">Due</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {tasks.data.map((task) => (
                                <tr
                                    key={task.id}
                                    onClick={() => router.visit(route('tasks.show', task.id))}
                                    className="cursor-pointer hover:bg-zinc-50"
                                >
                                    <td className="whitespace-nowrap px-4 py-3 font-medium text-zinc-900">
                                        {task.ticket_number}
                                    </td>
                                    <td className="max-w-xs truncate px-4 py-3 text-zinc-700">{task.title}</td>
                                    <td className="px-4 py-3 text-zinc-500">{task.website?.name}</td>
                                    <td className="px-4 py-3">
                                        <PriorityBadge priority={task.priority} />
                                    </td>
                                    <td className="px-4 py-3">
                                        <StatusBadge status={task.status} />
                                    </td>
                                    <td className="px-4 py-3 text-zinc-500">{task.assigned_to?.name ?? '—'}</td>
                                    <td className="px-4 py-3 text-zinc-500">{task.requester?.name ?? '—'}</td>
                                    <td className="whitespace-nowrap px-4 py-3 text-zinc-500">
                                        {task.due_date ? new Date(task.due_date).toLocaleDateString() : '—'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <ul className="divide-y divide-zinc-100 lg:hidden">
                    {tasks.data.map((task) => (
                        <li key={task.id}>
                            <Link href={route('tasks.show', task.id)} className="block p-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-zinc-400">{task.ticket_number}</span>
                                    <PriorityBadge priority={task.priority} />
                                </div>
                                <p className="mt-1 font-medium text-zinc-900">{task.title}</p>
                                <p className="text-xs text-zinc-500">{task.website?.name}</p>
                                <div className="mt-2 flex items-center justify-between">
                                    <StatusBadge status={task.status} />
                                    <span className="text-xs text-zinc-500">
                                        {task.due_date ? new Date(task.due_date).toLocaleDateString() : ''}
                                    </span>
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>

                {tasks.data.length === 0 && (
                    <div className="py-16 text-center text-sm text-zinc-500">No tasks match these filters.</div>
                )}
            </div>

            {tasks.last_page > 1 && (
                <div className="mt-6 flex flex-wrap gap-2">
                    {tasks.links.map((link, index) => (
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
