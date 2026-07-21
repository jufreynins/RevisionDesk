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
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-zinc-900">Time Tracking</h3>
                <button onClick={() => setShowForm((v) => !v)} className="text-xs font-medium text-emerald-700 hover:underline">
                    {showForm ? 'Cancel' : 'Log time'}
                </button>
            </div>

            <dl className="mb-3 grid grid-cols-2 gap-2 text-sm">
                <div>
                    <dt className="text-xs text-zinc-500">Estimated</dt>
                    <dd className="font-medium text-zinc-800">
                        {task.estimated_minutes ? `${task.estimated_minutes} min` : '—'}
                    </dd>
                </div>
                <div>
                    <dt className="text-xs text-zinc-500">Recorded</dt>
                    <dd className="font-medium text-zinc-800">{totalMinutes} min</dd>
                </div>
            </dl>

            {showForm && (
                <form onSubmit={submit} className="mb-3 space-y-2 rounded-lg bg-zinc-50 p-3">
                    <div className="flex gap-2">
                        <TextInput
                            type="date"
                            className="w-full text-sm"
                            value={data.work_date}
                            onChange={(e) => setData('work_date', e.target.value)}
                        />
                        <TextInput
                            type="number"
                            min="1"
                            className="w-28 text-sm"
                            value={data.minutes_spent}
                            onChange={(e) => setData('minutes_spent', Number(e.target.value))}
                        />
                    </div>
                    <TextInput
                        className="w-full text-sm"
                        placeholder="What did you work on?"
                        value={data.work_description}
                        onChange={(e) => setData('work_description', e.target.value)}
                    />
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full rounded-lg bg-emerald-700 py-1.5 text-sm font-semibold text-white hover:bg-emerald-800"
                    >
                        Save Entry
                    </button>
                </form>
            )}

            <ul className="space-y-1.5">
                {entries.map((entry) => (
                    <li key={entry.id} className="flex items-center justify-between text-xs text-zinc-600">
                        <span>
                            {entry.user?.name} · {entry.work_date} — {entry.work_description}
                        </span>
                        <span className="font-medium text-zinc-800">{entry.minutes_spent}m</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
