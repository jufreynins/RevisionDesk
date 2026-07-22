import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({
    mustVerifyEmail,
    status,
}: PageProps<{ mustVerifyEmail: boolean; status?: string }>) {
    return (
        <AuthenticatedLayout
            header={
                <div>
                    <div className="page-pretitle">Account</div>
                    <h1 className="page-title">Profile</h1>
                </div>
            }
        >
            <Head title="Profile" />

            <div style={{ maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="card">
                    <div className="card-body">
                        <UpdateProfileInformationForm mustVerifyEmail={mustVerifyEmail} status={status} />
                    </div>
                </div>

                <div className="card">
                    <div className="card-body">
                        <UpdatePasswordForm />
                    </div>
                </div>

                <div className="card">
                    <div className="card-body">
                        <DeleteUserForm />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
