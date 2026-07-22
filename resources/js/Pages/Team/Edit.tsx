import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { User } from '@/types/models';
import { Head } from '@inertiajs/react';
import UserForm from './UserForm';

interface EditProps {
    member: User;
}

export default function Edit({ member }: PageProps<EditProps>) {
    return (
        <AuthenticatedLayout
            header={
                <div>
                    <div className="page-pretitle">Admin</div>
                    <h1 className="page-title">Edit {member.name}</h1>
                </div>
            }
        >
            <Head title={`Edit ${member.name}`} />

            <div style={{ maxWidth: 640 }}>
                <UserForm member={member} submitUrl={route('team.update', member.id)} method="put" submitLabel="Save Changes" />
            </div>
        </AuthenticatedLayout>
    );
}
