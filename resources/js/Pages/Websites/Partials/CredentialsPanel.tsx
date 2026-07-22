import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';
import { Check, Copy, Eye, EyeOff, KeyRound, Plus, Trash2 } from 'lucide-react';
import { FormEvent, useState } from 'react';

interface CredentialSummary {
    id: number;
    label: string;
    login_url: string | null;
    notes: string | null;
    can_reveal: boolean;
    can_manage: boolean;
}

function RevealedValue({ label, value }: { label: string; value: string }) {
    const [copied, setCopied] = useState(false);

    function copy() {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    }

    return (
        <div className="flex items-center justify-between gap-2 rounded-md bg-zinc-50 px-2 py-1 text-xs">
            <span className="text-zinc-500">{label}:</span>
            <code className="flex-1 truncate text-zinc-800">{value}</code>
            <button onClick={copy} className="shrink-0 text-zinc-400 hover:text-zinc-700">
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
        </div>
    );
}

function CredentialRow({ websiteId, credential }: { websiteId: number; credential: CredentialSummary }) {
    const [revealed, setRevealed] = useState<{ username: string; password: string } | null>(null);
    const [loading, setLoading] = useState(false);

    async function toggleReveal() {
        if (revealed) {
            setRevealed(null);
            return;
        }

        setLoading(true);
        try {
            const { data } = await window.axios.get(
                route('websites.credentials.reveal', [websiteId, credential.id]),
            );
            setRevealed(data);
        } finally {
            setLoading(false);
        }
    }

    function remove() {
        if (confirm(`Delete credential "${credential.label}"?`)) {
            window.axios
                .delete(route('websites.credentials.destroy', [websiteId, credential.id]))
                .then(() => window.location.reload());
        }
    }

    return (
        <div style={{ border: '1px solid var(--border-color)', borderRadius: 8, padding: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <p style={{ fontSize: 13, fontWeight: 500 }}>{credential.label}</p>
                    {credential.login_url && (
                        <a href={credential.login_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11 }}>
                            {credential.login_url}
                        </a>
                    )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {credential.can_reveal && (
                        <button onClick={toggleReveal} disabled={loading} className="btn btn-outline btn-sm">
                            {revealed ? <EyeOff width={14} height={14} strokeWidth={1.5} /> : <Eye width={14} height={14} strokeWidth={1.5} />}
                            {revealed ? 'Hide' : 'Reveal'}
                        </button>
                    )}
                    {credential.can_manage && (
                        <button onClick={remove} style={{ color: 'var(--text-muted)' }}>
                            <Trash2 width={14} height={14} strokeWidth={1.5} />
                        </button>
                    )}
                </div>
            </div>

            {revealed && (
                <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <RevealedValue label="Username" value={revealed.username} />
                    <RevealedValue label="Password" value={revealed.password} />
                </div>
            )}

            {credential.notes && <p style={{ marginTop: 8, fontSize: 11, color: 'var(--text-muted)' }}>{credential.notes}</p>}
        </div>
    );
}

export default function CredentialsPanel({
    websiteId,
    credentials,
    canCreateCredential,
}: {
    websiteId: number;
    credentials: CredentialSummary[];
    canCreateCredential: boolean;
}) {
    const [showForm, setShowForm] = useState(false);
    const { data, setData, post, processing, reset } = useForm({
        label: '',
        login_url: '',
        username: '',
        password: '',
        notes: '',
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        post(route('websites.credentials.store', websiteId), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setShowForm(false);
            },
        });
    }

    return (
        <div className="card">
            <div className="card-header">
                <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <KeyRound width={16} height={16} strokeWidth={1.5} /> Credentials
                </div>
                {canCreateCredential && (
                    <button onClick={() => setShowForm((v) => !v)} className="btn btn-outline btn-sm">
                        <Plus width={14} height={14} strokeWidth={1.5} /> Add
                    </button>
                )}
            </div>
            <div className="card-body">
                {credentials.length === 0 && !showForm && (
                    <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No credentials stored for this website.</p>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {credentials.map((credential) => (
                        <CredentialRow key={credential.id} websiteId={websiteId} credential={credential} />
                    ))}
                </div>

                {showForm && (
                    <form onSubmit={submit} style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div className="form-group">
                            <InputLabel htmlFor="cred-label" value="Label" />
                            <TextInput id="cred-label" value={data.label} onChange={(e) => setData('label', e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <InputLabel htmlFor="cred-url" value="Login URL" />
                            <TextInput id="cred-url" value={data.login_url} onChange={(e) => setData('login_url', e.target.value)} />
                        </div>
                        <div className="form-group">
                            <InputLabel htmlFor="cred-username" value="Username" />
                            <TextInput
                                id="cred-username"
                                value={data.username}
                                onChange={(e) => setData('username', e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <InputLabel htmlFor="cred-password" value="Password" />
                            <TextInput
                                id="cred-password"
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" disabled={processing} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                            Save Credential
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
