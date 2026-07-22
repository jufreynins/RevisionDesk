import { PRIORITY_OPTIONS, STATUS_OPTIONS } from '@/Components/Badges';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';

interface SettingsIndexProps {
    settings: Record<string, string | null>;
}

export default function Index({ settings }: PageProps<SettingsIndexProps>) {
    const { data, setData, post, processing, errors } = useForm({
        company_name: settings.company_name ?? '',
        company_logo: null as File | null,
        default_task_priority: settings.default_task_priority ?? 'normal',
        default_task_status: settings.default_task_status ?? 'new',
        file_upload_size_limit_kb: settings.file_upload_size_limit_kb ?? '10240',
        ticket_number_prefix: settings.ticket_number_prefix ?? 'WEB',
        timezone: settings.timezone ?? 'Asia/Manila',
        date_format: settings.date_format ?? 'M j, Y',
        email_notifications_enabled: settings.email_notifications_enabled === '1',
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        post(route('settings.update'), { forceFormData: true });
    }

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <div className="page-pretitle">Admin</div>
                    <h1 className="page-title">Settings</h1>
                </div>
            }
        >
            <Head title="Settings" />

            <form onSubmit={submit} style={{ maxWidth: 760, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="card">
                    <div className="card-header">
                        <div className="card-title">Company</div>
                    </div>
                    <div className="card-body">
                        <div className="form-row">
                            <div className="form-group">
                                <InputLabel htmlFor="company_name" value="Company Name" />
                                <TextInput
                                    id="company_name"
                                    value={data.company_name}
                                    onChange={(e) => setData('company_name', e.target.value)}
                                    required
                                />
                                <InputError message={errors.company_name} className="mt-1" />
                            </div>

                            <div className="form-group">
                                <InputLabel htmlFor="company_logo" value="Company Logo" />
                                {settings.company_logo && (
                                    <img
                                        src={`/storage/${settings.company_logo}`}
                                        alt="Current logo"
                                        style={{ height: 40, borderRadius: 6, border: '1px solid var(--border-color)', marginBottom: 6 }}
                                    />
                                )}
                                <input
                                    id="company_logo"
                                    type="file"
                                    accept="image/*"
                                    style={{ fontSize: 13, color: 'var(--text-secondary)' }}
                                    onChange={(e) => setData('company_logo', e.target.files?.[0] ?? null)}
                                />
                                <InputError message={errors.company_logo} className="mt-1" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <div className="card-title">Task Defaults</div>
                    </div>
                    <div className="card-body">
                        <div className="form-row">
                            <div className="form-group">
                                <InputLabel htmlFor="default_task_priority" value="Default Priority" />
                                <select
                                    id="default_task_priority"
                                    className="form-control"
                                    value={data.default_task_priority}
                                    onChange={(e) => setData('default_task_priority', e.target.value)}
                                >
                                    {PRIORITY_OPTIONS.map((p) => (
                                        <option key={p.value} value={p.value}>
                                            {p.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <InputLabel htmlFor="default_task_status" value="Default Status" />
                                <select
                                    id="default_task_status"
                                    className="form-control"
                                    value={data.default_task_status}
                                    onChange={(e) => setData('default_task_status', e.target.value)}
                                >
                                    {STATUS_OPTIONS.map((s) => (
                                        <option key={s.value} value={s.value}>
                                            {s.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <InputLabel htmlFor="ticket_number_prefix" value="Ticket Number Prefix" />
                                <TextInput
                                    id="ticket_number_prefix"
                                    value={data.ticket_number_prefix}
                                    onChange={(e) => setData('ticket_number_prefix', e.target.value.toUpperCase())}
                                    required
                                />
                                <InputError message={errors.ticket_number_prefix} className="mt-1" />
                            </div>

                            <div className="form-group">
                                <InputLabel htmlFor="file_upload_size_limit_kb" value="File Upload Size Limit (KB)" />
                                <TextInput
                                    id="file_upload_size_limit_kb"
                                    type="number"
                                    value={data.file_upload_size_limit_kb}
                                    onChange={(e) => setData('file_upload_size_limit_kb', e.target.value)}
                                    required
                                />
                                <InputError message={errors.file_upload_size_limit_kb} className="mt-1" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <div className="card-title">Regional</div>
                    </div>
                    <div className="card-body">
                        <div className="form-row">
                            <div className="form-group">
                                <InputLabel htmlFor="timezone" value="Timezone" />
                                <TextInput
                                    id="timezone"
                                    value={data.timezone}
                                    onChange={(e) => setData('timezone', e.target.value)}
                                    placeholder="Asia/Manila"
                                    required
                                />
                                <InputError message={errors.timezone} className="mt-1" />
                            </div>

                            <div className="form-group">
                                <InputLabel htmlFor="date_format" value="Date Format" />
                                <TextInput
                                    id="date_format"
                                    value={data.date_format}
                                    onChange={(e) => setData('date_format', e.target.value)}
                                    placeholder="M j, Y"
                                    required
                                />
                                <InputError message={errors.date_format} className="mt-1" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <div className="card-title">Notifications</div>
                    </div>
                    <div className="card-body">
                        <label className="form-check" style={{ margin: 0 }}>
                            <input
                                type="checkbox"
                                checked={data.email_notifications_enabled}
                                onChange={(e) => setData('email_notifications_enabled', e.target.checked)}
                            />
                            Send email notifications in addition to in-app notifications
                        </label>
                    </div>
                </div>

                <div className="form-actions right">
                    <PrimaryButton disabled={processing}>Save Settings</PrimaryButton>
                </div>
            </form>
        </AuthenticatedLayout>
    );
}
