<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class SettingController extends Controller
{
    private const KEYS = [
        'company_name',
        'company_logo',
        'default_task_priority',
        'default_task_status',
        'file_upload_size_limit_kb',
        'ticket_number_prefix',
        'timezone',
        'date_format',
        'email_notifications_enabled',
    ];

    public function index(Request $request): Response
    {
        abort_unless($request->user()->isAdministrator(), 403);

        $values = collect(self::KEYS)->mapWithKeys(fn ($key) => [$key => Setting::get($key)]);

        return Inertia::render('Settings/Index', [
            'settings' => $values,
        ]);
    }

    public function update(Request $request)
    {
        abort_unless($request->user()->isAdministrator(), 403);

        $data = $request->validate([
            'company_name' => ['required', 'string', 'max:255'],
            'company_logo' => ['nullable', 'image', 'max:2048'],
            'default_task_priority' => ['required', 'in:low,normal,high,urgent,critical'],
            'default_task_status' => ['required', 'in:new,assigned,in_progress,waiting_for_client,blocked,ready_for_review,revision_needed,approved,completed,cancelled'],
            'file_upload_size_limit_kb' => ['required', 'integer', 'min:512', 'max:51200'],
            'ticket_number_prefix' => ['required', 'string', 'max:10', 'alpha'],
            'timezone' => ['required', 'string', 'timezone'],
            'date_format' => ['required', 'string', 'max:50'],
            'email_notifications_enabled' => ['boolean'],
        ]);

        if ($request->hasFile('company_logo')) {
            $data['company_logo'] = $request->file('company_logo')->store('branding', 'public');
        } else {
            unset($data['company_logo']);
        }

        $data['email_notifications_enabled'] = $request->boolean('email_notifications_enabled') ? '1' : '0';

        foreach ($data as $key => $value) {
            Setting::set($key, (string) $value);
        }

        return back()->with('success', 'Settings updated.');
    }
}
