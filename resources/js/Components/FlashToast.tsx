import { PageProps } from '@/types';
import { usePage } from '@inertiajs/react';
import { CheckCircle2, X, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function FlashToast() {
    const { flash } = usePage<PageProps>().props;
    const [dismissed, setDismissed] = useState<Record<string, boolean>>({});

    const message = flash?.success ?? flash?.error ?? null;
    const isError = !flash?.success && !!flash?.error;
    const key = `${flash?.success ?? ''}${flash?.error ?? ''}`;

    useEffect(() => {
        if (!message) return;
        setDismissed((prev) => ({ ...prev, [key]: false }));
        const timer = setTimeout(() => setDismissed((prev) => ({ ...prev, [key]: true })), 5000);
        return () => clearTimeout(timer);
    }, [key, message]);

    if (!message || dismissed[key]) return null;

    return (
        <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4">
            <div
                className={`pointer-events-auto flex items-center gap-2 rounded-lg border px-4 py-3 text-sm shadow-lg ${
                    isError
                        ? 'border-red-200 bg-red-50 text-red-800'
                        : 'border-emerald-200 bg-emerald-50 text-emerald-800'
                }`}
            >
                {isError ? (
                    <XCircle className="h-4 w-4 shrink-0" />
                ) : (
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                )}
                <span>{message}</span>
                <button
                    onClick={() => setDismissed((prev) => ({ ...prev, [key]: true }))}
                    className="ml-1 text-current/60 hover:text-current"
                >
                    <X className="h-3.5 w-3.5" />
                </button>
            </div>
        </div>
    );
}
