import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Tag, User, Website } from '@/types/models';
import { Head } from '@inertiajs/react';
import TaskForm from './TaskForm';

interface CreateProps {
    websites: Website[];
    users: User[];
    tags: Tag[];
    defaultWebsiteId: number | null;
}

export default function Create({ websites, users, tags, defaultWebsiteId }: PageProps<CreateProps>) {
    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-zinc-900">Add New Task</h2>}>
            <Head title="Add New Task" />

            <div className="mx-auto max-w-4xl">
                <TaskForm
                    mode="create"
                    websites={websites}
                    users={users}
                    tags={tags}
                    defaultWebsiteId={defaultWebsiteId}
                    submitUrl={route('tasks.store')}
                />
            </div>
        </AuthenticatedLayout>
    );
}
