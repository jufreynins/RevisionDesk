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
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card">
                <div className="card-header">
                    <div className="card-title">Task Details</div>
                </div>
                <div className="card-body">
                    <div className="form-group">
                        <InputLabel htmlFor="title" value="Task Title" />
                        <TextInput id="title" value={data.title} onChange={(e) => setData('title', e.target.value)} required />
                        <InputError message={errors.title} className="mt-1" />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <InputLabel htmlFor="website_id" value="Website" />
                            <select
                                id="website_id"
                                className="form-control"
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

                        <div className="form-group">
                            <InputLabel htmlFor="page_url" value="Page URL (optional override)" />
                            <TextInput id="page_url" value={data.page_url} onChange={(e) => setData('page_url', e.target.value)} />
                            <InputError message={errors.page_url} className="mt-1" />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <InputLabel htmlFor="task_type" value="Task Type" />
                            <select
                                id="task_type"
                                className="form-control"
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

                        <div className="form-group">
                            <InputLabel htmlFor="priority" value="Priority" />
                            <select
                                id="priority"
                                className="form-control"
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
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <InputLabel htmlFor="status" value="Status" />
                            <select
                                id="status"
                                className="form-control"
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

                        <div className="form-group">
                            <InputLabel htmlFor="assigned_to_id" value="Assigned User" />
                            <select
                                id="assigned_to_id"
                                className="form-control"
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
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <InputLabel htmlFor="requester_id" value="Requester" />
                            <select
                                id="requester_id"
                                className="form-control"
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

                        <div className="form-group">
                            <InputLabel htmlFor="due_date" value="Due Date" />
                            <TextInput
                                id="due_date"
                                type="date"
                                value={data.due_date}
                                onChange={(e) => setData('due_date', e.target.value)}
                            />
                            <InputError message={errors.due_date} className="mt-1" />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <InputLabel htmlFor="estimated_minutes" value="Estimated Time (minutes)" />
                            <TextInput
                                id="estimated_minutes"
                                type="number"
                                min="0"
                                value={data.estimated_minutes}
                                onChange={(e) => setData('estimated_minutes', e.target.value ? Number(e.target.value) : '')}
                            />
                            <InputError message={errors.estimated_minutes} className="mt-1" />
                        </div>

                        <div className="form-group">
                            <InputLabel htmlFor="browser" value="Browser" />
                            <TextInput
                                id="browser"
                                value={data.browser}
                                onChange={(e) => setData('browser', e.target.value)}
                                placeholder="Chrome, Safari, ..."
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <InputLabel htmlFor="device" value="Device" />
                        <TextInput
                            id="device"
                            value={data.device}
                            onChange={(e) => setData('device', e.target.value)}
                            placeholder="Desktop, Mobile, Tablet"
                        />
                    </div>

                    <div className="form-group">
                        <InputLabel value="Tags" />
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
                            {tags.map((tag) => {
                                const selected = data.tag_ids.includes(tag.id);
                                return (
                                    <button
                                        type="button"
                                        key={tag.id}
                                        onClick={() => toggleTag(tag.id)}
                                        className={selected ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm'}
                                    >
                                        {tag.name}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <div className="card-title">Description</div>
                </div>
                <div className="card-body">
                    <RichTextEditor value={data.description} onChange={(html) => setData('description', html)} />
                    <InputError message={errors.description} className="mt-1" />
                </div>
            </div>

            <div className="card">
                <div className="card-body">
                    <button
                        type="button"
                        onClick={() => setShowRevisionDetails((v) => !v)}
                        className="btn btn-outline btn-sm"
                    >
                        {showRevisionDetails ? 'Hide' : 'Add'} website revision details
                    </button>

                    {showRevisionDetails && (
                        <div style={{ marginTop: 16 }}>
                            <div className="form-row">
                                <div className="form-group">
                                    <InputLabel htmlFor="page_name" value="Page Name" />
                                    <TextInput id="page_name" value={data.page_name} onChange={(e) => setData('page_name', e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <InputLabel htmlFor="page_section" value="Page Section" />
                                    <TextInput
                                        id="page_section"
                                        value={data.page_section}
                                        onChange={(e) => setData('page_section', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <InputLabel htmlFor="current_issue" value="Current Issue" />
                                <textarea
                                    id="current_issue"
                                    rows={2}
                                    className="form-control"
                                    value={data.current_issue}
                                    onChange={(e) => setData('current_issue', e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <InputLabel htmlFor="requested_change" value="Requested Change" />
                                <textarea
                                    id="requested_change"
                                    rows={2}
                                    className="form-control"
                                    value={data.requested_change}
                                    onChange={(e) => setData('requested_change', e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <InputLabel htmlFor="expected_result" value="Expected Result" />
                                <textarea
                                    id="expected_result"
                                    rows={2}
                                    className="form-control"
                                    value={data.expected_result}
                                    onChange={(e) => setData('expected_result', e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <InputLabel htmlFor="steps_to_reproduce" value="Steps to Reproduce" />
                                <textarea
                                    id="steps_to_reproduce"
                                    rows={3}
                                    className="form-control"
                                    value={data.steps_to_reproduce}
                                    onChange={(e) => setData('steps_to_reproduce', e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <InputLabel htmlFor="client_deadline" value="Client Deadline" />
                                <TextInput
                                    id="client_deadline"
                                    type="date"
                                    value={data.client_deadline}
                                    onChange={(e) => setData('client_deadline', e.target.value)}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {mode === 'create' && (
                <div className="card">
                    <div className="card-header">
                        <div className="card-title">Checklist</div>
                    </div>
                    <div className="card-body">
                        <div style={{ display: 'flex', gap: 8 }}>
                            <TextInput
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
                            <button type="button" onClick={addChecklistItem} className="btn btn-outline">
                                <Plus width={16} height={16} strokeWidth={1.5} /> Add
                            </button>
                        </div>
                        {data.checklist_items.length > 0 && (
                            <ul style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {data.checklist_items.map((item, index) => (
                                    <li
                                        key={index}
                                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13 }}
                                    >
                                        {item}
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setData('checklist_items', data.checklist_items.filter((_, i) => i !== index))
                                            }
                                            style={{ color: 'var(--text-muted)' }}
                                        >
                                            <Trash2 width={14} height={14} strokeWidth={1.5} />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}

            {mode === 'create' && (
                <div className="card">
                    <div className="card-header">
                        <div className="card-title">Attachments</div>
                    </div>
                    <div className="card-body">
                        <label
                            style={{
                                display: 'flex',
                                cursor: 'pointer',
                                alignItems: 'center',
                                gap: 8,
                                borderRadius: 8,
                                border: '1px dashed var(--border-color)',
                                padding: '12px 16px',
                                fontSize: 13,
                                color: 'var(--text-muted)',
                            }}
                        >
                            <Paperclip width={16} height={16} strokeWidth={1.5} />
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
                </div>
            )}

            <div className="card">
                <div className="card-header">
                    <div className="card-title">Notes</div>
                </div>
                <div className="card-body">
                    <div className="form-group">
                        <InputLabel htmlFor="internal_notes" value="Internal Notes (staff only)" />
                        <textarea
                            id="internal_notes"
                            rows={3}
                            className="form-control"
                            value={data.internal_notes}
                            onChange={(e) => setData('internal_notes', e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <InputLabel htmlFor="client_notes" value="Client-Visible Notes" />
                        <textarea
                            id="client_notes"
                            rows={3}
                            className="form-control"
                            value={data.client_notes}
                            onChange={(e) => setData('client_notes', e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="form-actions right">
                <PrimaryButton disabled={processing}>{mode === 'create' ? 'Create Task' : 'Save Changes'}</PrimaryButton>
            </div>
        </form>
    );
}
