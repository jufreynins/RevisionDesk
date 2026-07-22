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
    { value: 'client', label: 'Client' },
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
        <form onSubmit={submit} className="space-y-6 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                    <InputLabel htmlFor="name" value="Full Name" />
                    <TextInput
                        id="name"
                        className="mt-1 block w-full"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                    />
                    <InputError message={errors.name} className="mt-1" />
                </div>

                <div>
                    <InputLabel htmlFor="email" value="Email" />
                    <TextInput
                        id="email"
                        type="email"
                        className="mt-1 block w-full"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                    />
                    <InputError message={errors.email} className="mt-1" />
                </div>

                <div>
                    <InputLabel htmlFor="role" value="Role" />
                    <select
                        id="role"
                        className="mt-1 block w-full rounded-md border-zinc-300 text-sm focus:border-emerald-600 focus:ring-emerald-600"
                        value={data.role}
                        onChange={(e) => setData('role', e.target.value as User['role'])}
                    >
                        {ROLES.map((r) => (
                            <option key={r.value} value={r.value}>
                                {r.label}
                            </option>
                        ))}
                    </select>
                    <InputError message={errors.role} className="mt-1" />
                </div>

                <div>
                    <InputLabel htmlFor="phone" value="Phone" />
                    <TextInput
                        id="phone"
                        className="mt-1 block w-full"
                        value={data.phone}
                        onChange={(e) => setData('phone', e.target.value)}
                    />
                    <InputError message={errors.phone} className="mt-1" />
                </div>

                {!member && (
                    <>
                        <div>
                            <InputLabel htmlFor="password" value="Password" />
                            <TextInput
                                id="password"
                                type="password"
                                className="mt-1 block w-full"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                required
                            />
                            <InputError message={errors.password} className="mt-1" />
                        </div>

                        <div>
                            <InputLabel htmlFor="password_confirmation" value="Confirm Password" />
                            <TextInput
                                id="password_confirmation"
                                type="password"
                                className="mt-1 block w-full"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                required
                            />
                        </div>
                    </>
                )}
            </div>

            <div className="space-y-3 border-t border-zinc-100 pt-4">
                <label className="flex items-center gap-2 text-sm text-zinc-700">
                    <input
                        type="checkbox"
                        checked={data.is_active}
                        onChange={(e) => setData('is_active', e.target.checked)}
                        className="rounded border-zinc-300 text-emerald-700 focus:ring-emerald-600"
                    />
                    Active (can log in)
                </label>
                <label className="flex items-center gap-2 text-sm text-zinc-700">
                    <input
                        type="checkbox"
                        checked={data.can_view_credentials}
                        onChange={(e) => setData('can_view_credentials', e.target.checked)}
                        className="rounded border-zinc-300 text-emerald-700 focus:ring-emerald-600"
                    />
                    Permitted to view website credentials (developers only)
                </label>
            </div>

            <div className="flex justify-end">
                <PrimaryButton disabled={processing}>{submitLabel}</PrimaryButton>
            </div>
        </form>
    );
}
