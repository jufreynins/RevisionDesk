import InputError from '@/Components/InputError';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            <div className="auth-title">Welcome back</div>
            <div className="auth-subtitle">Sign in to continue to RevisionDesk.</div>

            {status && (
                <div className="form-group" style={{ color: 'var(--green)', fontSize: 13 }}>
                    {status}
                </div>
            )}

            <form onSubmit={submit}>
                <div className="form-group">
                    <label className="form-label" htmlFor="email">
                        Email
                    </label>
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                    />
                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="form-group">
                    <label className="form-label" htmlFor="password">
                        Password
                    </label>
                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                    />
                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="auth-actions">
                    <label className="form-check">
                        <input
                            type="checkbox"
                            name="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', (e.target.checked || false) as false)}
                        />
                        Remember me
                    </label>

                    {canResetPassword && <Link href={route('password.request')}>Forgot password?</Link>}
                </div>

                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={processing}
                    style={{ width: '100%', justifyContent: 'center', height: 38 }}
                >
                    Sign in
                </button>
            </form>
        </GuestLayout>
    );
}
