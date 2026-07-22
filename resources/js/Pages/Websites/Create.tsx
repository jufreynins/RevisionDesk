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
            header={
                <div>
                    <div className="page-pretitle">Client Work</div>
                    <h1 className="page-title">Add Website</h1>
                </div>
            }
        >
            <Head title="Add Website" />

            <div style={{ maxWidth: 760 }}>
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
