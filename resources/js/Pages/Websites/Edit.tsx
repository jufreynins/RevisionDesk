import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { User, Website } from '@/types/models';
import { Head } from '@inertiajs/react';
import WebsiteForm from './WebsiteForm';

interface EditProps {
    website: Website & { team_members?: { id: number }[] };
    projectManagers: User[];
    teamMembers: User[];
}

export default function Edit({ website, projectManagers, teamMembers }: PageProps<EditProps>) {
    return (
        <AuthenticatedLayout
            header={
                <div>
                    <div className="page-pretitle">Client Work</div>
                    <h1 className="page-title">Edit {website.name}</h1>
                </div>
            }
        >
            <Head title={`Edit ${website.name}`} />

            <div style={{ maxWidth: 760 }}>
                <WebsiteForm
                    website={website}
                    projectManagers={projectManagers}
                    teamMembers={teamMembers}
                    submitUrl={route('websites.update', website.id)}
                    method="put"
                    submitLabel="Save Changes"
                />
            </div>
        </AuthenticatedLayout>
    );
}
