import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { User } from '@/types/models';
import { useForm } from '@inertiajs/react';
import { FormEvent } from 'react';

const ROLES = [
    { value: 'administrator', label: 'Administrator' },
    { value: 'project_manager', label: 'Project Manager' },
    { value: 'developer', label: 'Developer' },
];

interface UserFormProps {
    member?: User;
    submitUrl: string;
    method: 'post' | 'put';
    submitLabel: string;
}

export default function UserForm({ member, submitUrl, method, submitLabel }: UserFormProps) {
    const { data, setData, post, put, processing, errors } = useForm({
        name: member?.name ?? '',
        email: member?.email ?? '',
        password: '',
        password_confirmation: '',
        role: member?.role ?? 'developer',
        phone: member?.phone ?? '',
        is_active: member?.is_active ?? true,
        can_view_credentials: member?.can_view_credentials ?? false,
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        if (method === 'post') {
            post(submitUrl);
        } else {
            put(submitUrl);
        }
    }

    return (
        <div className="card">
            <div className="card-body">
                <form onSubmit={submit}>
                    <div className="form-row">
                        <div className="form-group">
                            <InputLabel htmlFor="name" value="Full Name" />
                            <TextInput id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} required />
                            <InputError message={errors.name} className="mt-1" />
                        </div>

                        <div className="form-group">
                            <InputLabel htmlFor="email" value="Email" />
                            <TextInput id="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} required />
                            <InputError message={errors.email} className="mt-1" />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <InputLabel htmlFor="role" value="Role" />
                            <select id="role" className="form-control" value={data.role} onChange={(e) => setData('role', e.target.value as User['role'])}>
                                {ROLES.map((r) => (
                                    <option key={r.value} value={r.value}>
                                        {r.label}
                                    </option>
                                ))}
                            </select>
                            <InputError message={errors.role} className="mt-1" />
                        </div>

                        <div className="form-group">
                            <InputLabel htmlFor="phone" value="Phone" />
                            <TextInput id="phone" value={data.phone} onChange={(e) => setData('phone', e.target.value)} />
                            <InputError message={errors.phone} className="mt-1" />
                        </div>
                    </div>

                    {!member ? (
                        <div className="form-row">
                            <div className="form-group">
                                <InputLabel htmlFor="password" value="Password" />
                                <TextInput
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    required
                                />
                                <InputError message={errors.password} className="mt-1" />
                            </div>

                            <div className="form-group">
                                <InputLabel htmlFor="password_confirmation" value="Confirm Password" />
                                <TextInput
                                    id="password_confirmation"
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="form-group">
                            <InputLabel value="Password" />
                            <div
                                style={{
                                    fontSize: 12.5,
                                    color: 'var(--text-muted)',
                                    background: 'var(--bg-surface-secondary)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: 'var(--radius-sm)',
                                    padding: '8px 12px',
                                }}
                            >
                                Can&rsquo;t be changed here. {member.name} can update their own password from{' '}
                                <strong>Profile</strong> after logging in.
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, borderTop: '1px solid var(--border-color)', paddingTop: 16, marginTop: 4 }}>
                        <label className="form-check" style={{ margin: 0 }}>
                            <input type="checkbox" checked={data.is_active} onChange={(e) => setData('is_active', e.target.checked)} />
                            Active (can log in)
                        </label>
                        <label className="form-check" style={{ margin: 0 }}>
                            <input
                                type="checkbox"
                                checked={data.can_view_credentials}
                                onChange={(e) => setData('can_view_credentials', e.target.checked)}
                            />
                            Permitted to view website credentials (developers only)
                        </label>
                    </div>

                    <div className="form-actions right">
                        <PrimaryButton disabled={processing}>{submitLabel}</PrimaryButton>
                    </div>
                </form>
            </div>
        </div>
    );
}
