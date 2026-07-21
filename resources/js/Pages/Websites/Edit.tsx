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
            header={<h2 className="text-xl font-semibold text-zinc-900">Edit {website.name}</h2>}
        >
            <Head title={`Edit ${website.name}`} />

            <div className="mx-auto max-w-3xl">
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
