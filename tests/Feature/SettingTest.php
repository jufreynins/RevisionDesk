<?php

namespace Tests\Feature;

use App\Models\Setting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SettingTest extends TestCase
{
    use RefreshDatabase;

    public function test_administrator_can_update_settings(): void
    {
        $admin = User::factory()->administrator()->create();

        $response = $this->actingAs($admin)->post(route('settings.update'), [
            'company_name' => 'Acme Agency',
            'default_task_priority' => 'high',
            'default_task_status' => 'assigned',
            'file_upload_size_limit_kb' => '5120',
            'ticket_number_prefix' => 'ACM',
            'timezone' => 'Asia/Manila',
            'date_format' => 'Y-m-d',
            'email_notifications_enabled' => true,
        ]);

        $response->assertRedirect();
        $this->assertSame('Acme Agency', Setting::get('company_name'));
        $this->assertSame('ACM', Setting::get('ticket_number_prefix'));
    }

    public function test_non_administrator_cannot_access_settings(): void
    {
        $pm = User::factory()->projectManager()->create();

        $this->actingAs($pm)->get(route('settings.index'))->assertForbidden();
        $this->actingAs($pm)->post(route('settings.update'), [])->assertForbidden();
    }
}
