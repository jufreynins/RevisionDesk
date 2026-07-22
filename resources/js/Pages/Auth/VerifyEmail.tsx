import PrimaryButton from '@/Components/PrimaryButton';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function VerifyEmail({ status }: { status?: string }) {
    const { post, processing } = useForm({});

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('verification.send'));
    };

    return (
        <GuestLayout>
            <Head title="Email Verification" />

            <div className="auth-title">Verify your email</div>
            <div className="auth-subtitle">
                Click the link we emailed you to verify your address. Didn't get it? We can resend it.
            </div>

            {status === 'verification-link-sent' && (
                <div className="form-group" style={{ color: 'var(--green)', fontSize: 13 }}>
                    A new verification link has been sent to your email address.
                </div>
            )}

            <form onSubmit={submit}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                    <PrimaryButton disabled={processing}>Resend Verification Email</PrimaryButton>

                    <Link href={route('logout')} method="post" as="button">
                        Log Out
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
