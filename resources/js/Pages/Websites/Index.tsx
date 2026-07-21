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

const STATUS_CLASSES: Record<string, string> = {
    active: 'bg-emerald-50 text-emerald-700',
    on_hold: 'bg-amber-50 text-amber-700',
    maintenance: 'bg-blue-50 text-blue-700',
    completed: 'bg-zinc-100 text-zinc-600',
    archived: 'bg-zinc-100 text-zinc-500',
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
            header={<h2 className="text-xl font-semibold text-zinc-900">Websites</h2>}
        >
            <Head title="Websites" />

            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <form onSubmit={submitSearch} className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search websites or clients..."
                            className="w-64 rounded-lg border-zinc-300 py-2 pl-9 text-sm focus:border-emerald-600 focus:ring-emerald-600"
                        />
                    </div>
                    <select
                        value={filters.status ?? ''}
                        onChange={(e) => filterByStatus(e.target.value)}
                        className="rounded-lg border-zinc-300 py-2 text-sm focus:border-emerald-600 focus:ring-emerald-600"
                    >
                        <option value="">All statuses</option>
                        {Object.entries(STATUS_LABEL).map(([value, label]) => (
                            <option key={value} value={value}>
                                {label}
                            </option>
                        ))}
                    </select>
                </form>

                <Link
                    href={route('websites.create')}
                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
                >
                    <Plus className="h-4 w-4" /> Add Website
                </Link>
            </div>

            {websites.data.length === 0 ? (
                <div className="rounded-xl border border-dashed border-zinc-300 bg-white py-16 text-center">
                    <Globe className="mx-auto h-8 w-8 text-zinc-300" />
                    <p className="mt-2 text-sm text-zinc-500">No websites found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {websites.data.map((website) => (
                        <Link
                            key={website.id}
                            href={route('websites.show', website.id)}
                            className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="font-semibold text-zinc-900">{website.name}</h3>
                                    <p className="text-sm text-zinc-500">{website.client_name}</p>
                                </div>
                                <span
                                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_CLASSES[website.status]}`}
                                >
                                    {STATUS_LABEL[website.status]}
                                </span>
                            </div>

                            <dl className="mt-4 space-y-1 text-xs text-zinc-500">
                                <div className="flex justify-between">
                                    <dt>Platform</dt>
                                    <dd className="capitalize text-zinc-700">{website.platform.replace('_', ' ')}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt>PM</dt>
                                    <dd className="text-zinc-700">{website.project_manager?.name ?? '—'}</dd>
                                </div>
                            </dl>

                            <div className="mt-4 flex gap-4 border-t border-zinc-100 pt-3 text-sm">
                                <span className="text-zinc-600">
                                    <strong className="text-zinc-900">{website.open_tasks_count ?? 0}</strong> open
                                </span>
                                <span className="text-zinc-600">
                                    <strong className="text-zinc-900">{website.completed_tasks_count ?? 0}</strong>{' '}
                                    completed
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {websites.last_page > 1 && (
                <div className="mt-6 flex flex-wrap gap-2">
                    {websites.links.map((link, index) => (
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
