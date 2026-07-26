import { FeatureRequestType } from '@/types/models';
import { useForm } from '@inertiajs/react';
import { Lightbulb, X } from 'lucide-react';
import { FormEvent, useState } from 'react';
import Modal from './Modal';

export default function FloatingFeatureRequestButton() {
    const [open, setOpen] = useState(false);
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        type: 'comment' as FeatureRequestType,
        message: '',
        page_url: '',
    });

    function openModal() {
        setData('page_url', window.location.pathname);
        setOpen(true);
    }

    function closeModal() {
        setOpen(false);
        clearErrors();
        reset();
    }

    function submit(e: FormEvent) {
        e.preventDefault();
        post(route('feature-requests.store'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
        });
    }

    return (
        <>
            <button
                type="button"
                onClick={openModal}
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
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(23,33,43,0.25)',
                }}
            >
                <Lightbulb width={20} height={20} strokeWidth={1.75} />
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
