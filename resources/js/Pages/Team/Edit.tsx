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
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-zinc-900">Edit {member.name}</h2>}>
            <Head title={`Edit ${member.name}`} />

            <div className="mx-auto max-w-2xl">
                <UserForm
                    member={member}
                    submitUrl={route('team.update', member.id)}
                    method="put"
                    submitLabel="Save Changes"
                />
            </div>
        </AuthenticatedLayout>
    );
}
