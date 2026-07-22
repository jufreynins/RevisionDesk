import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import UserForm from './UserForm';

export default function Create() {
    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-zinc-900">Add Team Member</h2>}>
            <Head title="Add Team Member" />

            <div className="mx-auto max-w-2xl">
                <UserForm submitUrl={route('team.store')} method="post" submitLabel="Create Account" />
            </div>
        </AuthenticatedLayout>
    );
}
