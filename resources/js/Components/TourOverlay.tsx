import { TourApi } from '@/tour/useTour';
import { X } from 'lucide-react';
import { CSSProperties, useEffect, useState } from 'react';

const TOOLTIP_WIDTH = 320;
const ESTIMATED_TOOLTIP_HEIGHT = 220;
const GAP = 14;
const EDGE_MARGIN = 16;

export default function TourOverlay({ tour }: { tour: TourApi }) {
    const [rect, setRect] = useState<DOMRect | null>(null);
    const [busy, setBusy] = useState(false);
    const target = tour.step?.target;
    const active = tour.active && tour.onCorrectPage && !!tour.step;

    function guarded(action: () => void) {
        if (busy) return;
        setBusy(true);
        action();
    }

    // A step actually changing (same-page advance or a fresh page mount after navigation)
    // means the previous click's effect has landed, so future clicks are safe again.
    useEffect(() => {
        setBusy(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tour.stepNumber]);

    // Safety net: if the tour is active but the store's segment and the current URL
    // disagree (a router.visit() call can occasionally be superseded/dropped), keep
    // retrying the navigation instead of leaving the tour silently stuck.
    useEffect(() => {
        if (!tour.active || tour.onCorrectPage) return;
        const interval = setInterval(() => tour.resync(), 500);
        return () => clearInterval(interval);
    }, [tour.active, tour.onCorrectPage, tour.stepNumber, tour.resync]);

    useEffect(() => {
        if (!active || !target) {
            setRect(null);
            return;
        }

        let raf = 0;
        let attempts = 0;

        function measure() {
            const el = document.querySelector(`[data-tour="${target}"]`);
            if (el) {
                el.scrollIntoView({ block: 'center', behavior: 'instant' as ScrollBehavior });
                setRect(el.getBoundingClientRect());
            } else if (attempts < 20) {
                attempts++;
                raf = requestAnimationFrame(measure);
            }
        }

        measure();

        const onReposition = () => {
            const el = document.querySelector(`[data-tour="${target}"]`);
            if (el) setRect(el.getBoundingClientRect());
        };

        window.addEventListener('resize', onReposition);
        window.addEventListener('scroll', onReposition, true);

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('resize', onReposition);
            window.removeEventListener('scroll', onReposition, true);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [active, target, tour.stepNumber]);

    if (!active || !tour.step) return null;

    const { step } = tour;
    const hasTarget = !!step.target;

    let tooltipStyle: CSSProperties = { position: 'fixed', zIndex: 10001, width: TOOLTIP_WIDTH };

    if (hasTarget && rect) {
        const placement = step.placement ?? 'bottom';
        const maxTop = window.innerHeight - ESTIMATED_TOOLTIP_HEIGHT - EDGE_MARGIN;
        const maxLeft = window.innerWidth - TOOLTIP_WIDTH - EDGE_MARGIN;

        let desiredTop: number;
        let desiredLeft: number;

        if (placement === 'top') {
            desiredTop = rect.top - GAP - ESTIMATED_TOOLTIP_HEIGHT;
            desiredLeft = rect.left;
        } else if (placement === 'left') {
            desiredTop = rect.top;
            desiredLeft = rect.left - GAP - TOOLTIP_WIDTH;
        } else if (placement === 'right') {
            desiredTop = rect.top;
            desiredLeft = rect.right + GAP;
        } else {
            desiredTop = rect.bottom + GAP;
            desiredLeft = rect.left;
        }

        tooltipStyle = {
            ...tooltipStyle,
            top: Math.max(EDGE_MARGIN, Math.min(desiredTop, maxTop)),
            left: Math.max(EDGE_MARGIN, Math.min(desiredLeft, maxLeft)),
        };
    } else {
        tooltipStyle = { ...tooltipStyle, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    }

    return (
        <>
            {hasTarget && rect && (
                <div
                    className="tour-spotlight"
                    style={{
                        position: 'fixed',
                        top: rect.top - 6,
                        left: rect.left - 6,
                        width: rect.width + 12,
                        height: rect.height + 12,
                        borderRadius: 10,
                    }}
                />
            )}

            {!hasTarget && <div className="tour-backdrop" />}

            <div className="card tour-tooltip" style={tooltipStyle}>
                <div style={{ padding: '16px 18px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span
                            style={{
                                fontSize: 11,
                                fontWeight: 600,
                                color: 'var(--primary)',
                                textTransform: 'uppercase',
                                letterSpacing: 0.4,
                            }}
                        >
                            Step {tour.stepNumber} of {tour.totalSteps}
                        </span>
                        <button
                            onClick={() => guarded(tour.skip)}
                            aria-label="Skip tour"
                            style={{ color: 'var(--text-muted)' }}
                            type="button"
                        >
                            <X width={16} height={16} strokeWidth={1.5} />
                        </button>
                    </div>
                    <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{step.title}</h3>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{step.content}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px 16px' }}>
                    <button onClick={() => guarded(tour.skip)} className="btn btn-outline btn-sm" type="button" disabled={busy}>
                        Skip
                    </button>
                    <div style={{ display: 'flex', gap: 8 }}>
                        {!tour.isFirstStep && (
                            <button onClick={() => guarded(tour.back)} className="btn btn-outline btn-sm" type="button" disabled={busy}>
                                Back
                            </button>
                        )}
                        <button onClick={() => guarded(tour.next)} className="btn btn-primary btn-sm" type="button" disabled={busy}>
                            {tour.isLastStep ? 'Finish' : 'Next'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
