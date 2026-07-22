import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { User, Website } from '@/types/models';
import { useForm } from '@inertiajs/react';
import { FormEvent } from 'react';

const PLATFORMS = ['wordpress', 'shopify', 'webflow', 'wix', 'squarespace', 'laravel', 'react', 'static_html', 'other'];
const STATUSES = ['active', 'on_hold', 'maintenance', 'completed', 'archived'];

interface WebsiteFormProps {
    website?: Website & { team_members?: { id: number }[] };
    projectManagers: User[];
    teamMembers: User[];
    submitUrl: string;
    method: 'post' | 'put';
    submitLabel: string;
}

export default function WebsiteForm({
    website,
    projectManagers,
    teamMembers,
    submitUrl,
    method,
    submitLabel,
}: WebsiteFormProps) {
    const { data, setData, post, put, processing, errors } = useForm({
        name: website?.name ?? '',
        url: website?.url ?? '',
        client_name: website?.client_name ?? '',
        website_type: website?.website_type ?? '',
        platform: website?.platform ?? 'wordpress',
        hosting_provider: website?.hosting_provider ?? '',
        project_manager_id: website?.project_manager_id ?? ('' as number | ''),
        status: website?.status ?? 'active',
        notes: website?.notes ?? '',
        team_member_ids: website?.team_members?.map((m) => m.id) ?? ([] as number[]),
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        if (method === 'post') {
            post(submitUrl);
        } else {
            put(submitUrl);
        }
    }

    function toggleTeamMember(id: number) {
        setData(
            'team_member_ids',
            data.team_member_ids.includes(id)
                ? data.team_member_ids.filter((m) => m !== id)
                : [...data.team_member_ids, id],
        );
    }

    return (
        <div className="card">
            <div className="card-body">
                <form onSubmit={submit}>
                    <div className="form-row">
                        <div className="form-group">
                            <InputLabel htmlFor="name" value="Website Name" />
                            <TextInput id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} required />
                            <InputError message={errors.name} className="mt-1" />
                        </div>

                        <div className="form-group">
                            <InputLabel htmlFor="url" value="Website URL" />
                            <TextInput
                                id="url"
                                type="url"
                                value={data.url}
                                onChange={(e) => setData('url', e.target.value)}
                                placeholder="https://example.com"
                                required
                            />
                            <InputError message={errors.url} className="mt-1" />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <InputLabel htmlFor="client_name" value="Client / Company Name" />
                            <TextInput
                                id="client_name"
                                value={data.client_name}
                                onChange={(e) => setData('client_name', e.target.value)}
                                required
                            />
                            <InputError message={errors.client_name} className="mt-1" />
                        </div>

                        <div className="form-group">
                            <InputLabel htmlFor="website_type" value="Website Type" />
                            <TextInput
                                id="website_type"
                                value={data.website_type}
                                onChange={(e) => setData('website_type', e.target.value)}
                                placeholder="Corporate, E-commerce, ..."
                            />
                            <InputError message={errors.website_type} className="mt-1" />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <InputLabel htmlFor="platform" value="Platform" />
                            <select
                                id="platform"
                                className="form-control"
                                value={data.platform}
                                onChange={(e) => setData('platform', e.target.value as Website['platform'])}
                            >
                                {PLATFORMS.map((p) => (
                                    <option key={p} value={p}>
                                        {p.replace('_', ' ')}
                                    </option>
                                ))}
                            </select>
                            <InputError message={errors.platform} className="mt-1" />
                        </div>

                        <div className="form-group">
                            <InputLabel htmlFor="hosting_provider" value="Hosting Provider" />
                            <TextInput
                                id="hosting_provider"
                                value={data.hosting_provider}
                                onChange={(e) => setData('hosting_provider', e.target.value)}
                            />
                            <InputError message={errors.hosting_provider} className="mt-1" />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <InputLabel htmlFor="project_manager_id" value="Project Manager" />
                            <select
                                id="project_manager_id"
                                className="form-control"
                                value={data.project_manager_id}
                                onChange={(e) =>
                                    setData('project_manager_id', e.target.value ? Number(e.target.value) : '')
                                }
                            >
                                <option value="">Unassigned</option>
                                {projectManagers.map((pm) => (
                                    <option key={pm.id} value={pm.id}>
                                        {pm.name}
                                    </option>
                                ))}
                            </select>
                            <InputError message={errors.project_manager_id} className="mt-1" />
                        </div>

                        <div className="form-group">
                            <InputLabel htmlFor="status" value="Status" />
                            <select
                                id="status"
                                className="form-control"
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value as Website['status'])}
                            >
                                {STATUSES.map((s) => (
                                    <option key={s} value={s}>
                                        {s.replace('_', ' ')}
                                    </option>
                                ))}
                            </select>
                            <InputError message={errors.status} className="mt-1" />
                        </div>
                    </div>

                    <div className="form-group">
                        <InputLabel value="Assigned Team Members" />
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
                            {teamMembers.map((member) => {
                                const selected = data.team_member_ids.includes(member.id);
                                return (
                                    <button
                                        type="button"
                                        key={member.id}
                                        onClick={() => toggleTeamMember(member.id)}
                                        className={selected ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm'}
                                    >
                                        {member.name}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="form-group">
                        <InputLabel htmlFor="notes" value="Notes" />
                        <textarea
                            id="notes"
                            rows={4}
                            className="form-control"
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                        />
                        <InputError message={errors.notes} className="mt-1" />
                    </div>

                    <div className="form-actions right">
                        <PrimaryButton disabled={processing}>{submitLabel}</PrimaryButton>
                    </div>
                </form>
            </div>
        </div>
    );
}
