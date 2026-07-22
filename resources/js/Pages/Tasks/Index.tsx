import { PriorityBadge, STATUS_OPTIONS, StatusBadge } from '@/Components/Badges';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Paginated, Task, User, Website } from '@/types/models';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Search, X } from 'lucide-react';
import { FormEvent, useState } from 'react';

interface IndexProps {
    tasks: Paginated<Task>;
    filters: Record<string, string | undefined>;
    websites: Website[];
    users: User[];
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
                <>
                    <div>
                        <div className="page-pretitle">Workspace</div>
                        <h1 className="page-title">{filters.view === 'all' ? 'All Tasks' : 'My Tasks'}</h1>
                    </div>
                    <div className="page-actions">
                        <Link href={route('tasks.create')} className="btn btn-primary">
                            <Plus width={16} height={16} strokeWidth={1.5} /> Add Task
                        </Link>
                    </div>
                </>
            }
        >
            <Head title="Tasks" />

            <div className="card" style={{ marginBottom: 16 }}>
                <div className="card-body" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
                    <form onSubmit={submitSearch} className="input-group" style={{ maxWidth: 240 }}>
                        <Search className="input-icon" width={14} height={14} strokeWidth={1.5} />
                        <input
                            className="form-control"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search title or ticket #..."
                        />
                    </form>

                    <select
                        value={filters.website_id ?? ''}
                        onChange={(e) => applyFilter('website_id', e.target.value)}
                        className="form-control"
                        style={{ maxWidth: 180 }}
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
                        className="form-control"
                        style={{ maxWidth: 170 }}
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
                        className="form-control"
                        style={{ maxWidth: 140 }}
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
                        className="form-control"
                        style={{ maxWidth: 160 }}
                    >
                        <option value="">Any status</option>
                        {STATUS_OPTIONS.map((s) => (
                            <option key={s.value} value={s.value}>
                                {s.label}
                            </option>
                        ))}
                    </select>

                    <label className="form-check" style={{ margin: 0 }}>
                        <input
                            type="checkbox"
                            checked={filters.overdue === '1' || filters.overdue === 'true'}
                            onChange={(e) => applyFilter('overdue', e.target.checked ? '1' : undefined)}
                        />
                        Overdue only
                    </label>

                    <div
                        style={{
                            marginLeft: 'auto',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            paddingLeft: 14,
                            borderLeft: '1px solid var(--border-color-light, var(--border-color))',
                        }}
                    >
                        {activeFilterCount > 0 && (
                            <button onClick={clearFilters} className="btn btn-outline btn-sm">
                                <X width={14} height={14} strokeWidth={1.5} /> Clear
                            </button>
                        )}

                        <select
                            value={filters.sort ?? 'newest'}
                            onChange={(e) => applyFilter('sort', e.target.value)}
                            className="form-control"
                            style={{ maxWidth: 170 }}
                        >
                            <option value="newest">Newest</option>
                            <option value="oldest">Oldest</option>
                            <option value="priority">Priority</option>
                            <option value="due_date">Due Date</option>
                            <option value="updated">Recently Updated</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="hidden lg:block">
                    <div className="table-responsive">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Ticket</th>
                                    <th>Title</th>
                                    <th>Website</th>
                                    <th>Priority</th>
                                    <th>Status</th>
                                    <th>Assigned</th>
                                    <th>Due</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tasks.data.map((task) => (
                                    <tr
                                        key={task.id}
                                        onClick={() => router.visit(route('tasks.show', task.id))}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <td className="cell-mono">{task.ticket_number}</td>
                                        <td
                                            className="cell-strong"
                                            style={{ maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                                        >
                                            {task.title}
                                        </td>
                                        <td style={{ color: 'var(--text-muted)' }}>{task.website?.name}</td>
                                        <td>
                                            <PriorityBadge priority={task.priority} />
                                        </td>
                                        <td>
                                            <StatusBadge status={task.status} />
                                        </td>
                                        <td style={{ color: 'var(--text-muted)' }}>{task.assigned_to?.name ?? '—'}</td>
                                        <td style={{ color: 'var(--text-muted)', fontSize: 12.5 }}>
                                            {task.due_date ? new Date(task.due_date).toLocaleDateString() : '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <ul className="activity-list lg:hidden">
                    {tasks.data.map((task) => (
                        <li key={task.id}>
                            <Link href={route('tasks.show', task.id)} style={{ display: 'block', padding: 16 }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{task.ticket_number}</span>
                                    <PriorityBadge priority={task.priority} />
                                </div>
                                <p style={{ marginTop: 4, fontWeight: 500 }}>{task.title}</p>
                                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{task.website?.name}</p>
                                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <StatusBadge status={task.status} />
                                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                        {task.due_date ? new Date(task.due_date).toLocaleDateString() : ''}
                                    </span>
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>

                {tasks.data.length === 0 && (
                    <div style={{ padding: '48px 16px', textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
                        No tasks match these filters.
                    </div>
                )}
            </div>

            {tasks.last_page > 1 && (
                <div className="pagination">
                    {tasks.links.map((link, index) => (
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
