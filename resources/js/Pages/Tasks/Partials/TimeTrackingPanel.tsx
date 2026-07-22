import TextInput from '@/Components/TextInput';
import { Task } from '@/types/models';
import { useForm } from '@inertiajs/react';
import { FormEvent, useState } from 'react';

export default function TimeTrackingPanel({ task }: { task: Task }) {
    const [showForm, setShowForm] = useState(false);
    const entries = task.time_entries ?? [];
    const totalMinutes = entries.reduce((sum, e) => sum + e.minutes_spent, 0);

    const { data, setData, post, processing, reset } = useForm({
        work_date: new Date().toISOString().slice(0, 10),
        minutes_spent: 30,
        work_description: '',
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        post(route('tasks.time-entries.store', task.id), {
            preserveScroll: true,
            onSuccess: () => {
                reset('work_description');
                setShowForm(false);
            },
        });
    }

    return (
        <div className="card">
            <div className="card-header">
                <div className="card-title">Time Tracking</div>
                <button onClick={() => setShowForm((v) => !v)} className="btn btn-outline btn-sm">
                    {showForm ? 'Cancel' : 'Log time'}
                </button>
            </div>
            <div className="card-body">
                <dl style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13, marginBottom: 12 }}>
                    <div>
                        <dt style={{ fontSize: 11, color: 'var(--text-muted)' }}>Estimated</dt>
                        <dd style={{ fontWeight: 500 }}>{task.estimated_minutes ? `${task.estimated_minutes} min` : '—'}</dd>
                    </div>
                    <div>
                        <dt style={{ fontSize: 11, color: 'var(--text-muted)' }}>Recorded</dt>
                        <dd style={{ fontWeight: 500 }}>{totalMinutes} min</dd>
                    </div>
                </dl>

                {showForm && (
                    <form onSubmit={submit} style={{ marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <TextInput type="date" value={data.work_date} onChange={(e) => setData('work_date', e.target.value)} />
                            <TextInput
                                type="number"
                                min="1"
                                style={{ maxWidth: 100 }}
                                value={data.minutes_spent}
                                onChange={(e) => setData('minutes_spent', Number(e.target.value))}
                            />
                        </div>
                        <TextInput
                            placeholder="What did you work on?"
                            value={data.work_description}
                            onChange={(e) => setData('work_description', e.target.value)}
                        />
                        <button type="submit" disabled={processing} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                            Save Entry
                        </button>
                    </form>
                )}

                <ul style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {entries.map((entry) => (
                        <li key={entry.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-secondary)' }}>
                            <span>
                                {entry.user?.name} · {entry.work_date} — {entry.work_description}
                            </span>
                            <span style={{ fontWeight: 500, color: 'var(--text)' }}>{entry.minutes_spent}m</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
