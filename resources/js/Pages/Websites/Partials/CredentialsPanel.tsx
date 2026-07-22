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
        <div className="rounded-lg border border-zinc-200 p-3">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-zinc-900">{credential.label}</p>
                    {credential.login_url && (
                        <a
                            href={credential.login_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-emerald-700 hover:underline"
                        >
                            {credential.login_url}
                        </a>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {credential.can_reveal && (
                        <button
                            onClick={toggleReveal}
                            disabled={loading}
                            className="inline-flex items-center gap-1 rounded-md border border-zinc-300 px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-50"
                        >
                            {revealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                            {revealed ? 'Hide' : 'Reveal'}
                        </button>
                    )}
                    {credential.can_manage && (
                        <button onClick={remove} className="text-zinc-300 hover:text-red-600">
                            <Trash2 className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>
            </div>

            {revealed && (
                <div className="mt-2 space-y-1">
                    <RevealedValue label="Username" value={revealed.username} />
                    <RevealedValue label="Password" value={revealed.password} />
                </div>
            )}

            {credential.notes && <p className="mt-2 text-xs text-zinc-500">{credential.notes}</p>}
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
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
                <h3 className="flex items-center gap-1.5 text-sm font-semibold text-zinc-900">
                    <KeyRound className="h-4 w-4" /> Credentials
                </h3>
                {canCreateCredential && (
                    <button
                        onClick={() => setShowForm((v) => !v)}
                        className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 hover:underline"
                    >
                        <Plus className="h-3.5 w-3.5" /> Add
                    </button>
                )}
            </div>

            {credentials.length === 0 && !showForm && (
                <p className="text-sm text-zinc-500">No credentials stored for this website.</p>
            )}

            <div className="space-y-2">
                {credentials.map((credential) => (
                    <CredentialRow key={credential.id} websiteId={websiteId} credential={credential} />
                ))}
            </div>

            {showForm && (
                <form onSubmit={submit} className="mt-3 space-y-2 rounded-lg bg-zinc-50 p-3">
                    <div>
                        <InputLabel htmlFor="cred-label" value="Label" />
                        <TextInput
                            id="cred-label"
                            className="mt-1 block w-full text-sm"
                            value={data.label}
                            onChange={(e) => setData('label', e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <InputLabel htmlFor="cred-url" value="Login URL" />
                        <TextInput
                            id="cred-url"
                            className="mt-1 block w-full text-sm"
                            value={data.login_url}
                            onChange={(e) => setData('login_url', e.target.value)}
                        />
                    </div>
                    <div>
                        <InputLabel htmlFor="cred-username" value="Username" />
                        <TextInput
                            id="cred-username"
                            className="mt-1 block w-full text-sm"
                            value={data.username}
                            onChange={(e) => setData('username', e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <InputLabel htmlFor="cred-password" value="Password" />
                        <TextInput
                            id="cred-password"
                            type="password"
                            className="mt-1 block w-full text-sm"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full rounded-lg bg-emerald-700 py-1.5 text-sm font-semibold text-white hover:bg-emerald-800"
                    >
                        Save Credential
                    </button>
                </form>
            )}
        </div>
    );
}
