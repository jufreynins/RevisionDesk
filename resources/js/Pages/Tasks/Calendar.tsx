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
                <>
                    <div>
                        <div className="page-pretitle">Workspace</div>
                        <h1 className="page-title">Calendar</h1>
                    </div>
                    <div className="page-actions" style={{ alignItems: 'center' }}>
                        <button onClick={() => setCursor(new Date(year, month - 1, 1))} className="btn btn-outline btn-sm">
                            <ChevronLeft width={16} height={16} strokeWidth={1.5} />
                        </button>
                        <span style={{ fontSize: 13, fontWeight: 500 }}>
                            {cursor.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                        </span>
                        <button onClick={() => setCursor(new Date(year, month + 1, 1))} className="btn btn-outline btn-sm">
                            <ChevronRight width={16} height={16} strokeWidth={1.5} />
                        </button>
                    </div>
                </>
            }
        >
            <Head title="Calendar" />

            <div className="card" data-tour="calendar-view">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, background: 'var(--border-color)' }}>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                        <div
                            key={day}
                            style={{
                                background: 'var(--bg-surface-secondary, var(--surface-2))',
                                padding: '6px 8px',
                                textAlign: 'center',
                                fontSize: 11,
                                fontWeight: 500,
                                color: 'var(--text-muted)',
                            }}
                        >
                            {day}
                        </div>
                    ))}

                    {cells.map((date, index) => {
                        if (!date) return <div key={index} style={{ minHeight: 112, background: 'var(--card-bg, #fff)' }} />;

                        const key = toDateKey(date);
                        const dayTasks = tasksByDate.get(key) ?? [];
                        const isToday = key === todayKey;

                        return (
                            <div key={index} style={{ minHeight: 112, background: 'var(--card-bg, #fff)', padding: 6 }}>
                                <span
                                    style={{
                                        display: 'inline-flex',
                                        height: 20,
                                        width: 20,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: '50%',
                                        fontSize: 11,
                                        background: isToday ? 'var(--primary)' : 'transparent',
                                        color: isToday ? '#fff' : 'var(--text-muted)',
                                        fontWeight: isToday ? 600 : 400,
                                    }}
                                >
                                    {date.getDate()}
                                </span>
                                <div style={{ marginTop: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    {dayTasks.slice(0, 3).map((task) => (
                                        <Link
                                            key={task.id}
                                            href={route('tasks.show', task.id)}
                                            title={task.title}
                                            style={{
                                                display: 'block',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                                borderRadius: 4,
                                                background: 'var(--bg-surface-secondary, var(--surface-2))',
                                                padding: '2px 6px',
                                                fontSize: 11,
                                                color: 'var(--text-secondary)',
                                            }}
                                        >
                                            {task.ticket_number}
                                        </Link>
                                    ))}
                                    {dayTasks.length > 3 && (
                                        <span style={{ padding: '0 6px', fontSize: 11, color: 'var(--text-muted)' }}>
                                            +{dayTasks.length - 3} more
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: 'var(--text-muted)' }}>
                <PriorityBadge priority="urgent" /> and <PriorityBadge priority="critical" /> tasks need attention first.
            </div>
        </AuthenticatedLayout>
    );
}
