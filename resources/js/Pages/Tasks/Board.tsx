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
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-zinc-900">Task Board</h2>
                    <select
                        value={filters.website_id ?? ''}
                        onChange={(e) => filterByWebsite(e.target.value)}
                        className="rounded-lg border-zinc-300 py-1.5 text-sm focus:border-emerald-600 focus:ring-emerald-600"
                    >
                        <option value="">All websites</option>
                        {websites.map((w) => (
                            <option key={w.id} value={w.id}>
                                {w.name}
                            </option>
                        ))}
                    </select>
                </div>
            }
        >
            <Head title="Task Board" />

            <div className="flex gap-4 overflow-x-auto pb-4">
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
                            className={`w-72 shrink-0 rounded-xl border bg-zinc-50 p-3 ${
                                dragOverStatus === status.value ? 'border-emerald-400 bg-emerald-50/40' : 'border-zinc-200'
                            }`}
                        >
                            <div className="mb-3 flex items-center justify-between px-1">
                                <h3 className="text-sm font-semibold text-zinc-700">{status.label}</h3>
                                <span className="text-xs text-zinc-400">{tasks.length}</span>
                            </div>

                            <div className="space-y-2">
                                {tasks.map((task) => (
                                    <div
                                        key={task.id}
                                        draggable
                                        onDragStart={(e) => e.dataTransfer.setData('text/task-id', String(task.id))}
                                        className="cursor-move rounded-lg border border-zinc-200 bg-white p-3 shadow-sm hover:shadow-md"
                                    >
                                        <Link
                                            href={route('tasks.show', task.id)}
                                            className="text-xs font-medium text-zinc-400 hover:underline"
                                        >
                                            {task.ticket_number}
                                        </Link>
                                        <p className="mt-0.5 text-sm font-medium text-zinc-900">{task.title}</p>
                                        <p className="text-xs text-zinc-500">{task.website?.name}</p>
                                        <div className="mt-2 flex items-center justify-between">
                                            <PriorityBadge priority={task.priority} />
                                            <span className="text-xs text-zinc-500">{task.assigned_to?.name ?? ''}</span>
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
