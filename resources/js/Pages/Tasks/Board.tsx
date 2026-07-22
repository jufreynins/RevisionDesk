import { PriorityBadge, STATUS_OPTIONS } from '@/Components/Badges';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Task, TaskStatus, Website } from '@/types/models';
import { Head, Link, router } from '@inertiajs/react';
import { DragEvent, useState } from 'react';

interface BoardProps {
    tasksByStatus: Partial<Record<TaskStatus, Task[]>>;
    websites: Website[];
    filters: { website_id?: string };
}

export default function Board({ tasksByStatus, websites, filters }: PageProps<BoardProps>) {
    const [dragOverStatus, setDragOverStatus] = useState<TaskStatus | null>(null);

    function onDrop(e: DragEvent, status: TaskStatus) {
        e.preventDefault();
        setDragOverStatus(null);
        const taskId = e.dataTransfer.getData('text/task-id');
        if (!taskId) return;

        router.patch(
            route('tasks.status.update', taskId),
            { status },
            { preserveScroll: true, preserveState: true },
        );
    }

    function filterByWebsite(websiteId: string) {
        router.get(route('tasks.board'), { website_id: websiteId || undefined }, { preserveState: true });
    }

    return (
        <AuthenticatedLayout
            header={
                <>
                    <div>
                        <div className="page-pretitle">Workspace</div>
                        <h1 className="page-title">Task Board</h1>
                    </div>
                    <div className="page-actions">
                        <select
                            value={filters.website_id ?? ''}
                            onChange={(e) => filterByWebsite(e.target.value)}
                            className="form-control"
                        >
                            <option value="">All websites</option>
                            {websites.map((w) => (
                                <option key={w.id} value={w.id}>
                                    {w.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </>
            }
        >
            <Head title="Task Board" />

            <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 16 }} data-tour="kanban-board">
                {STATUS_OPTIONS.map((status) => {
                    const tasks = tasksByStatus[status.value] ?? [];

                    return (
                        <div
                            key={status.value}
                            onDragOver={(e) => {
                                e.preventDefault();
                                setDragOverStatus(status.value);
                            }}
                            onDragLeave={() => setDragOverStatus(null)}
                            onDrop={(e) => onDrop(e, status.value)}
                            className="kanban-column"
                            style={{
                                width: 288,
                                flexShrink: 0,
                                borderColor: dragOverStatus === status.value ? 'var(--primary)' : undefined,
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
                                <h3 style={{ fontSize: 13, fontWeight: 600 }}>{status.label}</h3>
                                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{tasks.length}</span>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {tasks.map((task) => (
                                    <div
                                        key={task.id}
                                        draggable
                                        onDragStart={(e) => e.dataTransfer.setData('text/task-id', String(task.id))}
                                        className="kanban-card"
                                    >
                                        <Link href={route('tasks.show', task.id)} style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                            {task.ticket_number}
                                        </Link>
                                        <p style={{ marginTop: 2, fontSize: 13, fontWeight: 500 }}>{task.title}</p>
                                        <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{task.website?.name}</p>
                                        <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <PriorityBadge priority={task.priority} />
                                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{task.assigned_to?.name ?? ''}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </AuthenticatedLayout>
    );
}
