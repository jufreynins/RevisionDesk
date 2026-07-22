import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import UserForm from './UserForm';

export default function Create() {
    return (
        <AuthenticatedLayout
            header={
                <div>
                    <div className="page-pretitle">Admin</div>
                    <h1 className="page-title">Add Team Member</h1>
                </div>
            }
        >
            <Head title="Add Team Member" />

            <div style={{ maxWidth: 640 }}>
                <UserForm submitUrl={route('team.store')} method="post" submitLabel="Create Account" />
            </div>
        </AuthenticatedLayout>
    );
}
