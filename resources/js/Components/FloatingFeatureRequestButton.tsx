import { FeatureRequestType } from '@/types/models';
import { useForm } from '@inertiajs/react';
import { Lightbulb, Loader2, X } from 'lucide-react';
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import Modal from './Modal';

export default function FloatingFeatureRequestButton() {
    const [open, setOpen] = useState(false);
    const [capturing, setCapturing] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        type: 'comment' as FeatureRequestType,
        message: '',
        page_url: '',
        screenshot: null as File | null,
    });

    const screenshotPreviewUrl = useMemo(
        () => (data.screenshot ? URL.createObjectURL(data.screenshot) : null),
        [data.screenshot],
    );

    useEffect(() => {
        return () => {
            if (screenshotPreviewUrl) URL.revokeObjectURL(screenshotPreviewUrl);
        };
    }, [screenshotPreviewUrl]);

    async function openModal() {
        setCapturing(true);
        setData('page_url', window.location.pathname);

        try {
            const { default: html2canvas } = await import('html2canvas');
            const canvas = await html2canvas(document.body, {
                ignoreElements: (el) => el === buttonRef.current,
                useCORS: true,
                logging: false,
                scale: Math.min(window.devicePixelRatio || 1, 2),
            });
            const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png', 0.85));
            if (blob) {
                setData('screenshot', new File([blob], 'screenshot.png', { type: 'image/png' }));
            }
        } catch {
            // Screenshot capture is a nice-to-have — fall through to a text-only report if it fails.
        } finally {
            setCapturing(false);
            setOpen(true);
        }
    }

    function closeModal() {
        setOpen(false);
        clearErrors();
        reset();
    }

    function submit(e: FormEvent) {
        e.preventDefault();
        post(route('feature-requests.store'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => closeModal(),
        });
    }

    return (
        <>
            <button
                ref={buttonRef}
                type="button"
                onClick={openModal}
                disabled={capturing}
                aria-label="Send feedback"
                title="Send feedback"
                style={{
                    position: 'fixed',
                    right: 22,
                    bottom: 22,
                    zIndex: 40,
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--primary)',
                    color: '#fff',
                    border: 'none',
                    cursor: capturing ? 'wait' : 'pointer',
                    opacity: capturing ? 0.75 : 1,
                    boxShadow: '0 4px 14px rgba(23,33,43,0.25)',
                }}
            >
                {capturing ? (
                    <Loader2 width={20} height={20} strokeWidth={1.75} className="animate-spin" />
                ) : (
                    <Lightbulb width={20} height={20} strokeWidth={1.75} />
                )}
            </button>

            <Modal show={open} onClose={closeModal} maxWidth="md">
                <form onSubmit={submit} className="p-6">
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        <div>
                            <h3 className="card-title">Send Feedback</h3>
                            <p style={{ marginTop: 4, fontSize: 12.5, color: 'var(--text-muted)' }}>
                                Report a finding or leave a comment for the team.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={closeModal}
                            aria-label="Close"
                            style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                        >
                            <X width={16} height={16} />
                        </button>
                    </div>

                    <div className="form-group" style={{ marginTop: 18 }}>
                        <label className="form-label">Type</label>
                        <div className="btn-group">
                            <button
                                type="button"
                                className={`btn btn-outline${data.type === 'comment' ? ' active' : ''}`}
                                onClick={() => setData('type', 'comment')}
                            >
                                Comment
                            </button>
                            <button
                                type="button"
                                className={`btn btn-outline${data.type === 'finding' ? ' active' : ''}`}
                                onClick={() => setData('type', 'finding')}
                            >
                                Finding
                            </button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="feature-request-message">
                            {data.type === 'finding' ? 'What did you find?' : 'What’s on your mind?'}
                        </label>
                        <textarea
                            id="feature-request-message"
                            className="form-control"
                            rows={5}
                            required
                            value={data.message}
                            onChange={(e) => setData('message', e.target.value)}
                            placeholder={
                                data.type === 'finding'
                                    ? 'Describe what you noticed and where...'
                                    : 'Share an idea, request, or feedback...'
                            }
                        />
                        {errors.message && <p className="form-error mt-1">{errors.message}</p>}
                    </div>

                    {screenshotPreviewUrl && (
                        <div className="form-group">
                            <label className="form-label">Screenshot</label>
                            <div
                                style={{
                                    position: 'relative',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: 'var(--radius)',
                                    overflow: 'hidden',
                                }}
                            >
                                <img
                                    src={screenshotPreviewUrl}
                                    alt="Captured screenshot preview"
                                    style={{ display: 'block', width: '100%', maxHeight: 180, objectFit: 'cover', objectPosition: 'top' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setData('screenshot', null)}
                                    style={{
                                        position: 'absolute',
                                        top: 8,
                                        right: 8,
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 5,
                                        fontSize: 11.5,
                                        fontWeight: 500,
                                        color: '#fff',
                                        background: 'rgba(23,33,43,0.72)',
                                        border: 'none',
                                        borderRadius: 6,
                                        padding: '5px 9px',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <X width={12} height={12} strokeWidth={2} />
                                    Remove screenshot
                                </button>
                            </div>
                            <p style={{ marginTop: 6, fontSize: 11.5, color: 'var(--text-muted)' }}>
                                Captured automatically from this page. Remove it if you&rsquo;d rather send text only.
                            </p>
                        </div>
                    )}

                    <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                        <button type="button" onClick={closeModal} className="btn btn-outline">
                            Cancel
                        </button>
                        <button type="submit" disabled={processing} className="btn btn-primary">
                            Submit
                        </button>
                    </div>
                </form>
            </Modal>
        </>
    );
}
