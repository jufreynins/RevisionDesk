import { LucideIcon } from 'lucide-react';

export default function StatCard({
    label,
    value,
    icon: Icon,
    tone = 'default',
}: {
    label: string;
    value: number | string;
    icon: LucideIcon;
    tone?: 'default' | 'urgent' | 'warning' | 'success';
}) {
    const toneClasses: Record<string, string> = {
        default: 'bg-zinc-100 text-zinc-700',
        urgent: 'bg-red-50 text-red-700',
        warning: 'bg-amber-50 text-amber-700',
        success: 'bg-emerald-50 text-emerald-700',
    };

    return (
        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-500">{label}</span>
                <span className={`rounded-full p-1.5 ${toneClasses[tone]}`}>
                    <Icon className="h-4 w-4" />
                </span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-zinc-900">{value}</p>
        </div>
    );
}
