import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

export default function Guest({ children }: PropsWithChildren) {
    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-brand">
                    <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
                        <div className="brand-icon">R</div>
                        <div className="brand-name">RevisionDesk</div>
                    </Link>
                </div>

                {children}
            </div>
        </div>
    );
}
