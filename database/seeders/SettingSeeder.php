<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $defaults = [
            'company_name' => 'RevisionDesk Agency',
            'company_logo' => null,
            'default_task_priority' => 'normal',
            'default_task_status' => 'new',
            'file_upload_size_limit_kb' => '10240',
            'ticket_number_prefix' => 'WEB',
            'timezone' => 'Asia/Manila',
            'date_format' => 'M j, Y',
            'email_notifications_enabled' => '1',
        ];

        foreach ($defaults as $key => $value) {
            Setting::set($key, $value);
        }
    }
}
