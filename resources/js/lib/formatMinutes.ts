export function formatMinutes(minutes: number | string | null | undefined): string {
    const total = Number(minutes);
    if (!total) return '—';

    const hours = Math.floor(total / 60);
    const mins = total % 60;

    if (hours > 0) {
        return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }

    return `${mins}m`;
}
