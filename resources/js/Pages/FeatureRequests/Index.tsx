import EmptyState from '@/Components/EmptyState';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { FeatureRequest, Paginated } from '@/types/models';
import { Head, Link, router } from '@inertiajs/react';
import { CheckCircle2, Lightbulb } from 'lucide-react';

interface FeatureRequestsIndexProps {
    requests: Paginated<FeatureRequest>;
}

function TypeBadge({ type }: { type: FeatureRequest['type'] }) {
    return <span className={`badge ${type === 'finding' ? 'badge-red' : 'badge-blue'}`}>{type === 'finding' ? 'Finding' : 'Comment'}</span>;
}

export default function Index({ requests }: PageProps<FeatureRequestsIndexProps>) {
    function markReviewed(item: FeatureRequest) {
        router.patch(route('feature-requests.status.update', item.id), { status: 'reviewed' }, { preserveScroll: true });
    }

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <div className="page-pretitle">Admin</div>
                    <h1 className="page-title">Feature Requests</h1>
                </div>
            }
        >
            <Head title="Feature Requests" />

            <div className="card">
                {requests.data.length === 0 ? (
                    <EmptyState
                        icon={Lightbulb}
                        title="Nothing submitted yet"
                        text="Comments and findings sent from the feedback button will show up here."
                    />
                ) : (
                    <div className="table-responsive">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Type</th>
                                    <th>Message</th>
                                    <th>Submitted by</th>
                                    <th>Page</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th />
                                </tr>
                            </thead>
                            <tbody>
                                {requests.data.map((item) => (
                                    <tr key={item.id}>
                                        <td>
                                            <TypeBadge type={item.type} />
                                        </td>
                                        <td style={{ maxWidth: 360, whiteSpace: 'pre-line' }}>{item.message}</td>
                                        <td style={{ color: 'var(--text-secondary)' }}>{item.user?.name ?? 'Unknown'}</td>
                                        <td className="cell-mono" style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                                            {item.page_url ?? '—'}
                                        </td>
                                        <td style={{ color: 'var(--text-muted)', fontSize: 12.5 }}>
                                            {new Date(item.created_at).toLocaleString()}
                                        </td>
                                        <td>
                                            {item.status === 'reviewed' ? (
                                                <span className="status status-green">Reviewed</span>
                                            ) : (
                                                <span className="status status-blue">New</span>
                                            )}
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            {item.status !== 'reviewed' && (
                                                <button
                                                    onClick={() => markReviewed(item)}
                                                    className="btn btn-ghost btn-icon btn-sm"
                                                    title="Mark as reviewed"
                                                    aria-label="Mark as reviewed"
                                                >
                                                    <CheckCircle2 width={14} height={14} strokeWidth={1.5} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {requests.last_page > 1 && (
                <div className="pagination">
                    {requests.links.map((link, index) => (
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
