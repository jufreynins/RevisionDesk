import StatCard from '@/Components/StatCard';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, router } from '@inertiajs/react';
import { CheckCircle2, Clock, ListChecks } from 'lucide-react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { FormEvent, useState } from 'react';

const CATEGORICAL = ['#2a78d6', '#008300', '#e87ba4', '#eda100', '#1baf7a', '#eb6834', '#4a3aa7', '#e34948'];
const PRIORITY_COLORS: Record<string, string> = {
    low: '#a1a1aa',
    normal: '#2a78d6',
    high: '#eda100',
    urgent: '#e34948',
    critical: '#7f1d1d',
};

interface ReportsIndexProps {
    filters: { from: string; to: string };
    tasksCompletedByDate: { date: string; total: number }[];
    openTasksPerWebsite: Record<string, number>;
    tasksByPriority: Record<string, number>;
    tasksByType: Record<string, number>;
    overdueCount: number;
    avgCompletionHours: number;
    tasksCompletedByMember: Record<string, number>;
    estimatedVsActual: { estimated: number; actual: number };
    totalCompletedInRange: number;
}

function toChartData(record: Record<string, number>) {
    return Object.entries(record).map(([name, total]) => ({ name, total }));
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold text-zinc-900">{title}</h3>
            <div className="h-64 w-full">{children}</div>
        </div>
    );
}

export default function Index({
    filters,
    tasksCompletedByDate,
    openTasksPerWebsite,
    tasksByPriority,
    tasksByType,
    overdueCount,
    avgCompletionHours,
    tasksCompletedByMember,
    estimatedVsActual,
    totalCompletedInRange,
}: PageProps<ReportsIndexProps>) {
    const [from, setFrom] = useState(filters.from);
    const [to, setTo] = useState(filters.to);

    function applyRange(e: FormEvent) {
        e.preventDefault();
        router.get(route('reports.index'), { from, to }, { preserveState: true });
    }

    const websiteData = toChartData(openTasksPerWebsite);
    const priorityData = toChartData(tasksByPriority);
    const typeData = toChartData(tasksByType).slice(0, 8);
    const memberData = toChartData(tasksCompletedByMember);
    const estimatedVsActualData = [
        { name: 'Estimated', minutes: estimatedVsActual.estimated },
        { name: 'Actual', minutes: estimatedVsActual.actual },
    ];

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-zinc-900">Reports</h2>}>
            <Head title="Reports" />

            <form onSubmit={applyRange} className="mb-6 flex flex-wrap items-end gap-3">
                <div>
                    <label className="block text-xs font-medium text-zinc-500">From</label>
                    <input
                        type="date"
                        value={from}
                        onChange={(e) => setFrom(e.target.value)}
                        className="mt-1 rounded-lg border-zinc-300 py-1.5 text-sm focus:border-emerald-600 focus:ring-emerald-600"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-zinc-500">To</label>
                    <input
                        type="date"
                        value={to}
                        onChange={(e) => setTo(e.target.value)}
                        className="mt-1 rounded-lg border-zinc-300 py-1.5 text-sm focus:border-emerald-600 focus:ring-emerald-600"
                    />
                </div>
                <button
                    type="submit"
                    className="rounded-lg bg-emerald-700 px-4 py-1.5 text-sm font-semibold text-white hover:bg-emerald-800"
                >
                    Apply
                </button>
            </form>

            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <StatCard label="Completed in Range" value={totalCompletedInRange} icon={CheckCircle2} tone="success" />
                <StatCard label="Avg Completion Time" value={`${avgCompletionHours}h`} icon={Clock} tone="default" />
                <StatCard label="Currently Overdue" value={overdueCount} icon={ListChecks} tone="warning" />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <ChartCard title="Tasks Completed Over Time">
                    <ResponsiveContainer>
                        <LineChart data={tasksCompletedByDate}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e1e0d9" vertical={false} />
                            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#898781' }} />
                            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#898781' }} />
                            <Tooltip />
                            <Line type="monotone" dataKey="total" name="Completed" stroke={CATEGORICAL[0]} strokeWidth={2} dot={{ r: 3 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Open Tasks by Website">
                    <ResponsiveContainer>
                        <BarChart data={websiteData} layout="vertical" margin={{ left: 16 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e1e0d9" horizontal={false} />
                            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#898781' }} />
                            <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11, fill: '#52514e' }} />
                            <Tooltip />
                            <Bar dataKey="total" name="Open Tasks" fill={CATEGORICAL[0]} radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Tasks by Priority">
                    <ResponsiveContainer>
                        <BarChart data={priorityData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e1e0d9" vertical={false} />
                            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#898781' }} />
                            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#898781' }} />
                            <Tooltip />
                            <Bar dataKey="total" name="Tasks" radius={[4, 4, 0, 0]}>
                                {priorityData.map((entry) => (
                                    <Cell key={entry.name} fill={PRIORITY_COLORS[entry.name] ?? CATEGORICAL[0]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Tasks by Type">
                    <ResponsiveContainer>
                        <BarChart data={typeData} layout="vertical" margin={{ left: 16 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e1e0d9" horizontal={false} />
                            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#898781' }} />
                            <YAxis
                                type="category"
                                dataKey="name"
                                width={140}
                                tick={{ fontSize: 10, fill: '#52514e' }}
                                tickFormatter={(v: string) => v.replace(/_/g, ' ')}
                            />
                            <Tooltip />
                            <Bar dataKey="total" name="Tasks" fill={CATEGORICAL[0]} radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Tasks Completed by Team Member">
                    <ResponsiveContainer>
                        <BarChart data={memberData} layout="vertical" margin={{ left: 16 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e1e0d9" horizontal={false} />
                            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#898781' }} />
                            <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11, fill: '#52514e' }} />
                            <Tooltip />
                            <Bar dataKey="total" name="Completed" fill={CATEGORICAL[1]} radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Estimated vs Actual Time (minutes)">
                    <ResponsiveContainer>
                        <BarChart data={estimatedVsActualData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e1e0d9" vertical={false} />
                            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#898781' }} />
                            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#898781' }} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="minutes" name="Minutes" radius={[4, 4, 0, 0]}>
                                {estimatedVsActualData.map((entry, index) => (
                                    <Cell key={entry.name} fill={CATEGORICAL[index]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>
        </AuthenticatedLayout>
    );
}
