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
            header={<h2 className="text-xl font-semibold text-zinc-900">Edit {task.ticket_number}</h2>}
        >
            <Head title={`Edit ${task.ticket_number}`} />

            <div className="mx-auto max-w-4xl">
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
