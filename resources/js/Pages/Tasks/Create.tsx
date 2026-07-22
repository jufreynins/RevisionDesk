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
        <AuthenticatedLayout
            header={
                <div>
                    <div className="page-pretitle">Workspace</div>
                    <h1 className="page-title">Add New Task</h1>
                </div>
            }
        >
            <Head title="Add New Task" />

            <div style={{ maxWidth: 900 }}>
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
