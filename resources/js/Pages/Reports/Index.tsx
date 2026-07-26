import { PRIORITY_CHART_COLOR } from '@/Components/Badges';
import { CHART_CATEGORY_TICK_STYLE, CHART_CURSOR_FILL, CHART_GRID_STROKE, CHART_PALETTE, CHART_TICK_STYLE, CHART_TOOLTIP_STYLE } from '@/Components/Charts';
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
        <div className="card">
            <div className="card-header">
                <div className="card-title">{title}</div>
            </div>
            <div className="card-body" style={{ height: 256, width: '100%' }}>
                {children}
            </div>
        </div>
    );
}

function StatTile({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: typeof Clock; color: string }) {
    return (
        <div className="card">
            <div className="stat">
                <div className={`stat-icon ${color}`}>
                    <Icon width={22} height={22} strokeWidth={1.5} />
                </div>
                <div className="stat-content">
                    <div className="stat-label">{label}</div>
                    <div className="stat-value-row">
                        <span className="stat-value">{value}</span>
                    </div>
                </div>
            </div>
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
        <AuthenticatedLayout
            header={
                <div>
                    <div className="page-pretitle">Admin</div>
                    <h1 className="page-title">Reports</h1>
                </div>
            }
        >
            <Head title="Reports" />

            <form onSubmit={applyRange} style={{ marginBottom: 20, display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: 12 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">From</label>
                    <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="form-control" />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">To</label>
                    <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="form-control" />
                </div>
                <button type="submit" className="btn btn-primary">
                    Apply
                </button>
            </form>

            <div className="row col-3">
                <StatTile label="Completed in Range" value={totalCompletedInRange} icon={CheckCircle2} color="green" />
                <StatTile label="Avg Completion Time" value={`${avgCompletionHours}h`} icon={Clock} color="blue" />
                <StatTile label="Currently Overdue" value={overdueCount} icon={ListChecks} color="yellow" />
            </div>

            <div className="row col-2" data-tour="reports-charts">
                <ChartCard title="Tasks Completed Over Time">
                    <ResponsiveContainer>
                        <LineChart data={tasksCompletedByDate}>
                            <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} vertical={false} />
                            <XAxis dataKey="date" tick={CHART_TICK_STYLE} />
                            <YAxis allowDecimals={false} tick={CHART_TICK_STYLE} />
                            <Tooltip contentStyle={CHART_TOOLTIP_STYLE} cursor={CHART_CURSOR_FILL} />
                            <Line type="monotone" dataKey="total" name="Completed" stroke={CHART_PALETTE[0]} strokeWidth={2} dot={{ r: 3 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Open Tasks by Website">
                    <ResponsiveContainer>
                        <BarChart data={websiteData} layout="vertical" margin={{ left: 16 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} horizontal={false} />
                            <XAxis type="number" allowDecimals={false} tick={CHART_TICK_STYLE} />
                            <YAxis type="category" dataKey="name" width={120} tick={CHART_CATEGORY_TICK_STYLE} />
                            <Tooltip contentStyle={CHART_TOOLTIP_STYLE} cursor={CHART_CURSOR_FILL} />
                            <Bar dataKey="total" name="Open Tasks" fill={CHART_PALETTE[0]} radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Tasks by Priority">
                    <ResponsiveContainer>
                        <BarChart data={priorityData}>
                            <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} vertical={false} />
                            <XAxis dataKey="name" tick={CHART_TICK_STYLE} />
                            <YAxis allowDecimals={false} tick={CHART_TICK_STYLE} />
                            <Tooltip contentStyle={CHART_TOOLTIP_STYLE} cursor={CHART_CURSOR_FILL} />
                            <Bar dataKey="total" name="Tasks" radius={[4, 4, 0, 0]}>
                                {priorityData.map((entry) => (
                                    <Cell
                                        key={entry.name}
                                        fill={PRIORITY_CHART_COLOR[entry.name as keyof typeof PRIORITY_CHART_COLOR] ?? CHART_PALETTE[0]}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Tasks by Type">
                    <ResponsiveContainer>
                        <BarChart data={typeData} layout="vertical" margin={{ left: 16 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} horizontal={false} />
                            <XAxis type="number" allowDecimals={false} tick={CHART_TICK_STYLE} />
                            <YAxis
                                type="category"
                                dataKey="name"
                                width={140}
                                tick={{ fontSize: 10, fill: 'var(--text-secondary)' }}
                                tickFormatter={(v: string) => v.replace(/_/g, ' ')}
                            />
                            <Tooltip contentStyle={CHART_TOOLTIP_STYLE} cursor={CHART_CURSOR_FILL} />
                            <Bar dataKey="total" name="Tasks" fill={CHART_PALETTE[0]} radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Tasks Completed by Team Member">
                    <ResponsiveContainer>
                        <BarChart data={memberData} layout="vertical" margin={{ left: 16 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} horizontal={false} />
                            <XAxis type="number" allowDecimals={false} tick={CHART_TICK_STYLE} />
                            <YAxis type="category" dataKey="name" width={120} tick={CHART_CATEGORY_TICK_STYLE} />
                            <Tooltip contentStyle={CHART_TOOLTIP_STYLE} cursor={CHART_CURSOR_FILL} />
                            <Bar dataKey="total" name="Completed" fill={CHART_PALETTE[1]} radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Estimated vs Actual Time (minutes)">
                    <ResponsiveContainer>
                        <BarChart data={estimatedVsActualData}>
                            <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} vertical={false} />
                            <XAxis dataKey="name" tick={CHART_TICK_STYLE} />
                            <YAxis allowDecimals={false} tick={CHART_TICK_STYLE} />
                            <Tooltip contentStyle={CHART_TOOLTIP_STYLE} cursor={CHART_CURSOR_FILL} />
                            <Legend />
                            <Bar dataKey="minutes" name="Minutes" radius={[4, 4, 0, 0]}>
                                {estimatedVsActualData.map((entry, index) => (
                                    <Cell key={entry.name} fill={CHART_PALETTE[index]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>
        </AuthenticatedLayout>
    );
}
