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
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-zinc-900">Settings</h2>}>
            <Head title="Settings" />

            <form onSubmit={submit} className="mx-auto max-w-3xl space-y-6">
                <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-sm font-semibold text-zinc-900">Company</h3>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div>
                            <InputLabel htmlFor="company_name" value="Company Name" />
                            <TextInput
                                id="company_name"
                                className="mt-1 block w-full"
                                value={data.company_name}
                                onChange={(e) => setData('company_name', e.target.value)}
                                required
                            />
                            <InputError message={errors.company_name} className="mt-1" />
                        </div>

                        <div>
                            <InputLabel htmlFor="company_logo" value="Company Logo" />
                            {settings.company_logo && (
                                <img
                                    src={`/storage/${settings.company_logo}`}
                                    alt="Current logo"
                                    className="mt-1 h-10 w-auto rounded border border-zinc-200 object-contain"
                                />
                            )}
                            <input
                                id="company_logo"
                                type="file"
                                accept="image/*"
                                className="mt-1 block w-full text-sm text-zinc-600"
                                onChange={(e) => setData('company_logo', e.target.files?.[0] ?? null)}
                            />
                            <InputError message={errors.company_logo} className="mt-1" />
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-sm font-semibold text-zinc-900">Task Defaults</h3>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div>
                            <InputLabel htmlFor="default_task_priority" value="Default Priority" />
                            <select
                                id="default_task_priority"
                                className="mt-1 block w-full rounded-md border-zinc-300 text-sm focus:border-emerald-600 focus:ring-emerald-600"
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

                        <div>
                            <InputLabel htmlFor="default_task_status" value="Default Status" />
                            <select
                                id="default_task_status"
                                className="mt-1 block w-full rounded-md border-zinc-300 text-sm focus:border-emerald-600 focus:ring-emerald-600"
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

                        <div>
                            <InputLabel htmlFor="ticket_number_prefix" value="Ticket Number Prefix" />
                            <TextInput
                                id="ticket_number_prefix"
                                className="mt-1 block w-full"
                                value={data.ticket_number_prefix}
                                onChange={(e) => setData('ticket_number_prefix', e.target.value.toUpperCase())}
                                required
                            />
                            <InputError message={errors.ticket_number_prefix} className="mt-1" />
                        </div>

                        <div>
                            <InputLabel htmlFor="file_upload_size_limit_kb" value="File Upload Size Limit (KB)" />
                            <TextInput
                                id="file_upload_size_limit_kb"
                                type="number"
                                className="mt-1 block w-full"
                                value={data.file_upload_size_limit_kb}
                                onChange={(e) => setData('file_upload_size_limit_kb', e.target.value)}
                                required
                            />
                            <InputError message={errors.file_upload_size_limit_kb} className="mt-1" />
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-sm font-semibold text-zinc-900">Regional</h3>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div>
                            <InputLabel htmlFor="timezone" value="Timezone" />
                            <TextInput
                                id="timezone"
                                className="mt-1 block w-full"
                                value={data.timezone}
                                onChange={(e) => setData('timezone', e.target.value)}
                                placeholder="Asia/Manila"
                                required
                            />
                            <InputError message={errors.timezone} className="mt-1" />
                        </div>

                        <div>
                            <InputLabel htmlFor="date_format" value="Date Format" />
                            <TextInput
                                id="date_format"
                                className="mt-1 block w-full"
                                value={data.date_format}
                                onChange={(e) => setData('date_format', e.target.value)}
                                placeholder="M j, Y"
                                required
                            />
                            <InputError message={errors.date_format} className="mt-1" />
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-sm font-semibold text-zinc-900">Notifications</h3>
                    <label className="flex items-center gap-2 text-sm text-zinc-700">
                        <input
                            type="checkbox"
                            checked={data.email_notifications_enabled}
                            onChange={(e) => setData('email_notifications_enabled', e.target.checked)}
                            className="rounded border-zinc-300 text-emerald-700 focus:ring-emerald-600"
                        />
                        Send email notifications in addition to in-app notifications
                    </label>
                </div>

                <div className="flex justify-end">
                    <PrimaryButton disabled={processing}>Save Settings</PrimaryButton>
                </div>
            </form>
        </AuthenticatedLayout>
    );
}
