import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Paginated, Website } from '@/types/models';
import { Head, Link, router } from '@inertiajs/react';
import { Globe, Plus, Search } from 'lucide-react';
import { FormEvent, useState } from 'react';

const STATUS_LABEL: Record<string, string> = {
    active: 'Active',
    on_hold: 'On Hold',
    maintenance: 'Maintenance',
    completed: 'Completed',
    archived: 'Archived',
};

const STATUS_CLASS: Record<string, string> = {
    active: 'status-green',
    on_hold: 'status-yellow',
    maintenance: 'status-blue',
    completed: 'status-blue',
    archived: 'status-red',
};

interface WebsitesIndexProps {
    websites: Paginated<Website>;
    filters: { search?: string; status?: string };
}

export default function Index({ websites, filters }: PageProps<WebsitesIndexProps>) {
    const [search, setSearch] = useState(filters.search ?? '');

    function submitSearch(e: FormEvent) {
        e.preventDefault();
        router.get(route('websites.index'), { ...filters, search }, { preserveState: true });
    }

    function filterByStatus(status: string) {
        router.get(route('websites.index'), { ...filters, status: status || undefined }, { preserveState: true });
    }

    return (
        <AuthenticatedLayout
            header={
                <>
                    <div>
                        <div className="page-pretitle">Client Work</div>
                        <h1 className="page-title">Websites</h1>
                    </div>
                    <div className="page-actions">
                        <Link href={route('websites.create')} className="btn btn-primary">
                            <Plus width={16} height={16} strokeWidth={1.5} />
                            Add Website
                        </Link>
                    </div>
                </>
            }
        >
            <Head title="Websites" />

            <div className="card" style={{ marginBottom: 16 }}>
                <div className="card-body" style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                    <form onSubmit={submitSearch} className="input-group" style={{ maxWidth: 280 }}>
                        <Search className="input-icon" width={14} height={14} strokeWidth={1.5} />
                        <input
                            className="form-control"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search websites or clients..."
                        />
                    </form>
                    <select
                        value={filters.status ?? ''}
                        onChange={(e) => filterByStatus(e.target.value)}
                        className="form-control"
                        style={{ maxWidth: 200 }}
                    >
                        <option value="">All statuses</option>
                        {Object.entries(STATUS_LABEL).map(([value, label]) => (
                            <option key={value} value={value}>
                                {label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {websites.data.length === 0 ? (
                <div className="card">
                    <div className="card-body" style={{ textAlign: 'center', padding: '48px 16px' }}>
                        <Globe width={32} height={32} strokeWidth={1.5} style={{ margin: '0 auto', color: 'var(--text-muted)' }} />
                        <p style={{ marginTop: 8, fontSize: 13, color: 'var(--text-muted)' }}>No websites found.</p>
                    </div>
                </div>
            ) : (
                <div className="row col-3">
                    {websites.data.map((website) => (
                        <Link key={website.id} href={route('websites.show', website.id)} className="card">
                            <div className="card-body">
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                    <div>
                                        <div className="card-title">{website.name}</div>
                                        <div className="card-subtitle">{website.client_name}</div>
                                    </div>
                                    <span className={`status ${STATUS_CLASS[website.status]}`}>
                                        {STATUS_LABEL[website.status]}
                                    </span>
                                </div>

                                <dl style={{ marginTop: 14, fontSize: 12, color: 'var(--text-muted)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                        <dt>Platform</dt>
                                        <dd style={{ color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                                            {website.platform.replace('_', ' ')}
                                        </dd>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <dt>PM</dt>
                                        <dd style={{ color: 'var(--text-secondary)' }}>
                                            {website.project_manager?.name ?? '—'}
                                        </dd>
                                    </div>
                                </dl>

                                <div
                                    style={{
                                        marginTop: 14,
                                        paddingTop: 12,
                                        borderTop: '1px solid var(--border-color)',
                                        display: 'flex',
                                        gap: 16,
                                        fontSize: 13,
                                    }}
                                >
                                    <span style={{ color: 'var(--text-secondary)' }}>
                                        <strong style={{ color: 'var(--text)' }}>{website.open_tasks_count ?? 0}</strong> open
                                    </span>
                                    <span style={{ color: 'var(--text-secondary)' }}>
                                        <strong style={{ color: 'var(--text)' }}>{website.completed_tasks_count ?? 0}</strong>{' '}
                                        completed
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {websites.last_page > 1 && (
                <div className="pagination">
                    {websites.links.map((link, index) => (
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
