import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

export default function EmptyState({
    icon: Icon,
    title,
    text,
    action,
}: {
    icon: LucideIcon;
    title: string;
    text?: string;
    action?: ReactNode;
}) {
    return (
        <div className="empty-state">
            <div className="empty-state-icon">
                <Icon width={22} height={22} strokeWidth={1.5} />
            </div>
            <div className="empty-state-title">{title}</div>
            {text && <div className="empty-state-text">{text}</div>}
            {action && <div className="empty-state-actions">{action}</div>}
        </div>
    );
}
