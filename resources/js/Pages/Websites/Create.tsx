import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { User } from '@/types/models';
import { Head } from '@inertiajs/react';
import WebsiteForm from './WebsiteForm';

interface CreateProps {
    projectManagers: User[];
    teamMembers: User[];
}

export default function Create({ projectManagers, teamMembers }: PageProps<CreateProps>) {
    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold text-zinc-900">Add Website</h2>}
        >
            <Head title="Add Website" />

            <div className="mx-auto max-w-3xl">
                <WebsiteForm
                    projectManagers={projectManagers}
                    teamMembers={teamMembers}
                    submitUrl={route('websites.store')}
                    method="post"
                    submitLabel="Create Website"
                />
            </div>
        </AuthenticatedLayout>
    );
}
