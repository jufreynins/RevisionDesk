import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('password.email'));
    };

    return (
        <GuestLayout>
            <Head title="Forgot Password" />

            <div className="auth-title">Forgot your password?</div>
            <div className="auth-subtitle">
                No problem. Let us know your email address and we'll email you a password reset link.
            </div>

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
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                    />
                    <InputError message={errors.email} className="mt-2" />
                </div>

                <PrimaryButton disabled={processing} style={{ width: '100%', justifyContent: 'center', height: 38 }}>
                    Email Password Reset Link
                </PrimaryButton>
            </form>
        </GuestLayout>
    );
}
