import { PriorityBadge } from '@/Components/Badges';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Task } from '@/types/models';
import { Head, Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';

interface CalendarProps {
    tasks: Task[];
}

function toDateKey(date: Date): string {
    return date.toISOString().slice(0, 10);
}

export default function Calendar({ tasks }: PageProps<CalendarProps>) {
    const [cursor, setCursor] = useState(() => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), 1);
    });

    const tasksByDate = useMemo(() => {
        const map = new Map<string, Task[]>();
        for (const task of tasks) {
            if (!task.due_date) continue;
            const key = task.due_date.slice(0, 10);
            map.set(key, [...(map.get(key) ?? []), task]);
        }
        return map;
    }, [tasks]);

    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const firstDay = new Date(year, month, 1);
    const startOffset = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const todayKey = toDateKey(new Date());

    const cells: (Date | null)[] = [
        ...Array(startOffset).fill(null),
        ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
    ];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-zinc-900">Calendar</h2>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCursor(new Date(year, month - 1, 1))}
                            className="rounded-lg border border-zinc-300 p-1.5 hover:bg-zinc-50"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <span className="text-sm font-medium text-zinc-700">
                            {cursor.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                        </span>
                        <button
                            onClick={() => setCursor(new Date(year, month + 1, 1))}
                            className="rounded-lg border border-zinc-300 p-1.5 hover:bg-zinc-50"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="Calendar" />

            <div className="grid grid-cols-7 gap-px overflow-hidden rounded-xl border border-zinc-200 bg-zinc-200 text-xs">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="bg-zinc-50 px-2 py-1.5 text-center font-medium text-zinc-500">
                        {day}
                    </div>
                ))}

                {cells.map((date, index) => {
                    if (!date) return <div key={index} className="min-h-28 bg-white" />;

                    const key = toDateKey(date);
                    const dayTasks = tasksByDate.get(key) ?? [];
                    const isToday = key === todayKey;

                    return (
                        <div key={index} className="min-h-28 bg-white p-1.5">
                            <span
                                className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-xs ${
                                    isToday ? 'bg-emerald-700 font-semibold text-white' : 'text-zinc-500'
                                }`}
                            >
                                {date.getDate()}
                            </span>
                            <div className="mt-1 space-y-1">
                                {dayTasks.slice(0, 3).map((task) => (
                                    <Link
                                        key={task.id}
                                        href={route('tasks.show', task.id)}
                                        className="block truncate rounded bg-zinc-50 px-1.5 py-0.5 text-[11px] text-zinc-700 hover:bg-zinc-100"
                                        title={task.title}
                                    >
                                        {task.ticket_number}
                                    </Link>
                                ))}
                                {dayTasks.length > 3 && (
                                    <span className="block px-1.5 text-[11px] text-zinc-400">
                                        +{dayTasks.length - 3} more
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-4 flex items-center gap-3 text-xs text-zinc-500">
                <PriorityBadge priority="urgent" /> and <PriorityBadge priority="critical" /> tasks need attention first.
            </div>
        </AuthenticatedLayout>
    );
}
