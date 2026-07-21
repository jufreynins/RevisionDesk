import { PRIORITY_OPTIONS, STATUS_OPTIONS } from '@/Components/Badges';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import RichTextEditor from '@/Components/RichTextEditor';
import TextInput from '@/Components/TextInput';
import { Tag, Task, User, Website } from '@/types/models';
import { useForm } from '@inertiajs/react';
import { Paperclip, Plus, Trash2 } from 'lucide-react';
import { FormEvent, useState } from 'react';

const TASK_TYPES = [
    'bug_fix', 'website_revision', 'content_update', 'design_update',
    'mobile_responsive_issue', 'form_issue', 'email_issue', 'speed_optimization',
    'seo_update', 'plugin_update', 'security_issue', 'hosting_or_domain_issue',
    'new_feature', 'website_maintenance', 'other',
];

interface TaskFormProps {
    mode: 'create' | 'edit';
    task?: Task;
    websites: Website[];
    users: User[];
    tags: Tag[];
    defaultWebsiteId?: number | null;
    submitUrl: string;
}

export default function TaskForm({ mode, task, websites, users, tags, defaultWebsiteId, submitUrl }: TaskFormProps) {
    const [showRevisionDetails, setShowRevisionDetails] = useState(
        !!(task?.page_name || task?.current_issue || task?.requested_change),
    );

    const { data, setData, post, put, processing, errors } = useForm({
        title: task?.title ?? '',
        website_id: task?.website_id ?? defaultWebsiteId ?? ('' as number | ''),
        page_url: task?.page_url ?? '',
        task_type: task?.task_type ?? 'other',
        description: task?.description ?? '',
        priority: task?.priority ?? 'normal',
        status: task?.status ?? 'new',
        assigned_to_id: task?.assigned_to_id ?? ('' as number | ''),
        requester_id: task?.requester_id ?? ('' as number | ''),
        due_date: task?.due_date?.slice(0, 10) ?? '',
        estimated_minutes: task?.estimated_minutes ?? ('' as number | ''),
        internal_notes: task?.internal_notes ?? '',
        client_notes: task?.client_notes ?? '',
        browser: task?.browser ?? '',
        device: task?.device ?? '',
        page_name: task?.page_name ?? '',
        page_section: task?.page_section ?? '',
        current_issue: task?.current_issue ?? '',
        requested_change: task?.requested_change ?? '',
        expected_result: task?.expected_result ?? '',
        steps_to_reproduce: task?.steps_to_reproduce ?? '',
        client_deadline: task?.client_deadline?.slice(0, 10) ?? '',
        tag_ids: task?.tags?.map((t) => t.id) ?? ([] as number[]),
        checklist_items: [] as string[],
        attachments: [] as File[],
    });

    const [newChecklistItem, setNewChecklistItem] = useState('');

    function submit(e: FormEvent) {
        e.preventDefault();
        if (mode === 'create') {
            post(submitUrl);
        } else {
            put(submitUrl);
        }
    }

    function onWebsiteChange(websiteId: string) {
        const id = websiteId ? Number(websiteId) : '';
        setData('website_id', id);

        if (mode === 'create' && id) {
            const website = websites.find((w) => w.id === id);
            if (website && !data.page_url) {
                setData('page_url', website.url);
            }
        }
    }

    function toggleTag(id: number) {
        setData('tag_ids', data.tag_ids.includes(id) ? data.tag_ids.filter((t) => t !== id) : [...data.tag_ids, id]);
    }

    function addChecklistItem() {
        if (newChecklistItem.trim() === '') return;
        setData('checklist_items', [...data.checklist_items, newChecklistItem.trim()]);
        setNewChecklistItem('');
    }

    return (
        <form onSubmit={submit} className="space-y-6">
            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-sm font-semibold text-zinc-900">Task Details</h3>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                        <InputLabel htmlFor="title" value="Task Title" />
                        <TextInput
                            id="title"
                            className="mt-1 block w-full"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            required
                        />
                        <InputError message={errors.title} className="mt-1" />
                    </div>

                    <div>
                        <InputLabel htmlFor="website_id" value="Website" />
                        <select
                            id="website_id"
                            className="mt-1 block w-full rounded-md border-zinc-300 text-sm focus:border-emerald-600 focus:ring-emerald-600"
                            value={data.website_id}
                            onChange={(e) => onWebsiteChange(e.target.value)}
                            required
                        >
                            <option value="">Select a website</option>
                            {websites.map((w) => (
                                <option key={w.id} value={w.id}>
                                    {w.name}
                                </option>
                            ))}
                        </select>
                        <InputError message={errors.website_id} className="mt-1" />
                    </div>

                    <div>
                        <InputLabel htmlFor="page_url" value="Page URL (optional override)" />
                        <TextInput
                            id="page_url"
                            className="mt-1 block w-full"
                            value={data.page_url}
                            onChange={(e) => setData('page_url', e.target.value)}
                        />
                        <InputError message={errors.page_url} className="mt-1" />
                    </div>

                    <div>
                        <InputLabel htmlFor="task_type" value="Task Type" />
                        <select
                            id="task_type"
                            className="mt-1 block w-full rounded-md border-zinc-300 text-sm focus:border-emerald-600 focus:ring-emerald-600"
                            value={data.task_type}
                            onChange={(e) => setData('task_type', e.target.value as Task['task_type'])}
                        >
                            {TASK_TYPES.map((t) => (
                                <option key={t} value={t}>
                                    {t.replace(/_/g, ' ')}
                                </option>
                            ))}
                        </select>
                        <InputError message={errors.task_type} className="mt-1" />
                    </div>

                    <div>
                        <InputLabel htmlFor="priority" value="Priority" />
                        <select
                            id="priority"
                            className="mt-1 block w-full rounded-md border-zinc-300 text-sm focus:border-emerald-600 focus:ring-emerald-600"
                            value={data.priority}
                            onChange={(e) => setData('priority', e.target.value as Task['priority'])}
                        >
                            {PRIORITY_OPTIONS.map((p) => (
                                <option key={p.value} value={p.value}>
                                    {p.label}
                                </option>
                            ))}
                        </select>
                        <InputError message={errors.priority} className="mt-1" />
                    </div>

                    <div>
                        <InputLabel htmlFor="status" value="Status" />
                        <select
                            id="status"
                            className="mt-1 block w-full rounded-md border-zinc-300 text-sm focus:border-emerald-600 focus:ring-emerald-600"
                            value={data.status}
                            onChange={(e) => setData('status', e.target.value as Task['status'])}
                        >
                            {STATUS_OPTIONS.map((s) => (
                                <option key={s.value} value={s.value}>
                                    {s.label}
                                </option>
                            ))}
                        </select>
                        <InputError message={errors.status} className="mt-1" />
                    </div>

                    <div>
                        <InputLabel htmlFor="assigned_to_id" value="Assigned User" />
                        <select
                            id="assigned_to_id"
                            className="mt-1 block w-full rounded-md border-zinc-300 text-sm focus:border-emerald-600 focus:ring-emerald-600"
                            value={data.assigned_to_id}
                            onChange={(e) => setData('assigned_to_id', e.target.value ? Number(e.target.value) : '')}
                        >
                            <option value="">Unassigned</option>
                            {users
                                .filter((u) => u.role !== 'client')
                                .map((u) => (
                                    <option key={u.id} value={u.id}>
                                        {u.name}
                                    </option>
                                ))}
                        </select>
                        <InputError message={errors.assigned_to_id} className="mt-1" />
                    </div>

                    <div>
                        <InputLabel htmlFor="requester_id" value="Requester" />
                        <select
                            id="requester_id"
                            className="mt-1 block w-full rounded-md border-zinc-300 text-sm focus:border-emerald-600 focus:ring-emerald-600"
                            value={data.requester_id}
                            onChange={(e) => setData('requester_id', e.target.value ? Number(e.target.value) : '')}
                        >
                            <option value="">Me</option>
                            {users.map((u) => (
                                <option key={u.id} value={u.id}>
                                    {u.name} {u.role === 'client' ? '(client)' : ''}
                                </option>
                            ))}
                        </select>
                        <InputError message={errors.requester_id} className="mt-1" />
                    </div>

                    <div>
                        <InputLabel htmlFor="due_date" value="Due Date" />
                        <TextInput
                            id="due_date"
                            type="date"
                            className="mt-1 block w-full"
                            value={data.due_date}
                            onChange={(e) => setData('due_date', e.target.value)}
                        />
                        <InputError message={errors.due_date} className="mt-1" />
                    </div>

                    <div>
                        <InputLabel htmlFor="estimated_minutes" value="Estimated Time (minutes)" />
                        <TextInput
                            id="estimated_minutes"
                            type="number"
                            min="0"
                            className="mt-1 block w-full"
                            value={data.estimated_minutes}
                            onChange={(e) =>
                                setData('estimated_minutes', e.target.value ? Number(e.target.value) : '')
                            }
                        />
                        <InputError message={errors.estimated_minutes} className="mt-1" />
                    </div>

                    <div>
                        <InputLabel htmlFor="browser" value="Browser" />
                        <TextInput
                            id="browser"
                            className="mt-1 block w-full"
                            value={data.browser}
                            onChange={(e) => setData('browser', e.target.value)}
                            placeholder="Chrome, Safari, ..."
                        />
                    </div>

                    <div>
                        <InputLabel htmlFor="device" value="Device" />
                        <TextInput
                            id="device"
                            className="mt-1 block w-full"
                            value={data.device}
                            onChange={(e) => setData('device', e.target.value)}
                            placeholder="Desktop, Mobile, Tablet"
                        />
                    </div>
                </div>

                <div className="mt-4">
                    <InputLabel value="Tags" />
                    <div className="mt-2 flex flex-wrap gap-2">
                        {tags.map((tag) => {
                            const selected = data.tag_ids.includes(tag.id);
                            return (
                                <button
                                    type="button"
                                    key={tag.id}
                                    onClick={() => toggleTag(tag.id)}
                                    className={`rounded-full px-3 py-1 text-xs ${
                                        selected
                                            ? 'bg-emerald-700 text-white'
                                            : 'border border-zinc-300 text-zinc-600 hover:bg-zinc-50'
                                    }`}
                                >
                                    {tag.name}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-sm font-semibold text-zinc-900">Description</h3>
                <RichTextEditor value={data.description} onChange={(html) => setData('description', html)} />
                <InputError message={errors.description} className="mt-1" />
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
                <button
                    type="button"
                    onClick={() => setShowRevisionDetails((v) => !v)}
                    className="text-sm font-semibold text-emerald-700 hover:underline"
                >
                    {showRevisionDetails ? 'Hide' : 'Add'} website revision details
                </button>

                {showRevisionDetails && (
                    <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div>
                            <InputLabel htmlFor="page_name" value="Page Name" />
                            <TextInput
                                id="page_name"
                                className="mt-1 block w-full"
                                value={data.page_name}
                                onChange={(e) => setData('page_name', e.target.value)}
                            />
                        </div>
                        <div>
                            <InputLabel htmlFor="page_section" value="Page Section" />
                            <TextInput
                                id="page_section"
                                className="mt-1 block w-full"
                                value={data.page_section}
                                onChange={(e) => setData('page_section', e.target.value)}
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <InputLabel htmlFor="current_issue" value="Current Issue" />
                            <textarea
                                id="current_issue"
                                rows={2}
                                className="mt-1 block w-full rounded-md border-zinc-300 text-sm focus:border-emerald-600 focus:ring-emerald-600"
                                value={data.current_issue}
                                onChange={(e) => setData('current_issue', e.target.value)}
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <InputLabel htmlFor="requested_change" value="Requested Change" />
                            <textarea
                                id="requested_change"
                                rows={2}
                                className="mt-1 block w-full rounded-md border-zinc-300 text-sm focus:border-emerald-600 focus:ring-emerald-600"
                                value={data.requested_change}
                                onChange={(e) => setData('requested_change', e.target.value)}
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <InputLabel htmlFor="expected_result" value="Expected Result" />
                            <textarea
                                id="expected_result"
                                rows={2}
                                className="mt-1 block w-full rounded-md border-zinc-300 text-sm focus:border-emerald-600 focus:ring-emerald-600"
                                value={data.expected_result}
                                onChange={(e) => setData('expected_result', e.target.value)}
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <InputLabel htmlFor="steps_to_reproduce" value="Steps to Reproduce" />
                            <textarea
                                id="steps_to_reproduce"
                                rows={3}
                                className="mt-1 block w-full rounded-md border-zinc-300 text-sm focus:border-emerald-600 focus:ring-emerald-600"
                                value={data.steps_to_reproduce}
                                onChange={(e) => setData('steps_to_reproduce', e.target.value)}
                            />
                        </div>
                        <div>
                            <InputLabel htmlFor="client_deadline" value="Client Deadline" />
                            <TextInput
                                id="client_deadline"
                                type="date"
                                className="mt-1 block w-full"
                                value={data.client_deadline}
                                onChange={(e) => setData('client_deadline', e.target.value)}
                            />
                        </div>
                    </div>
                )}
            </div>

            {mode === 'create' && (
                <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-sm font-semibold text-zinc-900">Checklist</h3>
                    <div className="flex gap-2">
                        <TextInput
                            className="block w-full"
                            value={newChecklistItem}
                            onChange={(e) => setNewChecklistItem(e.target.value)}
                            placeholder="Add a checklist item..."
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    addChecklistItem();
                                }
                            }}
                        />
                        <button
                            type="button"
                            onClick={addChecklistItem}
                            className="inline-flex items-center gap-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-50"
                        >
                            <Plus className="h-4 w-4" /> Add
                        </button>
                    </div>
                    {data.checklist_items.length > 0 && (
                        <ul className="mt-3 space-y-1.5">
                            {data.checklist_items.map((item, index) => (
                                <li key={index} className="flex items-center justify-between text-sm text-zinc-700">
                                    {item}
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setData(
                                                'checklist_items',
                                                data.checklist_items.filter((_, i) => i !== index),
                                            )
                                        }
                                        className="text-zinc-400 hover:text-red-600"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            {mode === 'create' && (
                <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-sm font-semibold text-zinc-900">Attachments</h3>
                    <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-zinc-300 px-4 py-3 text-sm text-zinc-500 hover:bg-zinc-50">
                        <Paperclip className="h-4 w-4" />
                        {data.attachments.length > 0
                            ? `${data.attachments.length} file(s) selected`
                            : 'Attach screenshots or files'}
                        <input
                            type="file"
                            multiple
                            className="hidden"
                            onChange={(e) => setData('attachments', Array.from(e.target.files ?? []))}
                        />
                    </label>
                    <InputError message={errors.attachments} className="mt-1" />
                </div>
            )}

            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-sm font-semibold text-zinc-900">Notes</h3>
                <div className="space-y-4">
                    <div>
                        <InputLabel htmlFor="internal_notes" value="Internal Notes (staff only)" />
                        <textarea
                            id="internal_notes"
                            rows={3}
                            className="mt-1 block w-full rounded-md border-zinc-300 text-sm focus:border-emerald-600 focus:ring-emerald-600"
                            value={data.internal_notes}
                            onChange={(e) => setData('internal_notes', e.target.value)}
                        />
                    </div>
                    <div>
                        <InputLabel htmlFor="client_notes" value="Client-Visible Notes" />
                        <textarea
                            id="client_notes"
                            rows={3}
                            className="mt-1 block w-full rounded-md border-zinc-300 text-sm focus:border-emerald-600 focus:ring-emerald-600"
                            value={data.client_notes}
                            onChange={(e) => setData('client_notes', e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <PrimaryButton disabled={processing}>
                    {mode === 'create' ? 'Create Task' : 'Save Changes'}
                </PrimaryButton>
            </div>
        </form>
    );
}
