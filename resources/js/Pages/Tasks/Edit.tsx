import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Tag, Task, User, Website } from '@/types/models';
import { Head } from '@inertiajs/react';
import TaskForm from './TaskForm';

interface EditProps {
    task: Task;
    websites: Website[];
    users: User[];
    tags: Tag[];
}

export default function Edit({ task, websites, users, tags }: PageProps<EditProps>) {
    return (
        <AuthenticatedLayout
            header={
                <div>
                    <div className="page-pretitle">Workspace</div>
                    <h1 className="page-title">Edit {task.ticket_number}</h1>
                </div>
            }
        >
            <Head title={`Edit ${task.ticket_number}`} />

            <div style={{ maxWidth: 900 }}>
                <TaskForm
                    mode="edit"
                    task={task}
                    websites={websites}
                    users={users}
                    tags={tags}
                    submitUrl={route('tasks.update', task.id)}
                />
            </div>
        </AuthenticatedLayout>
    );
}
