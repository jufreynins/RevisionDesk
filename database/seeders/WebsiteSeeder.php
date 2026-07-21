<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Website;
use App\Models\WebsiteCredential;
use Illuminate\Database\Seeder;

class WebsiteSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $projectManager = User::where('role', User::ROLE_PROJECT_MANAGER)->firstOrFail();
        $developers = User::where('role', User::ROLE_DEVELOPER)->get();
        $admin = User::where('role', User::ROLE_ADMINISTRATOR)->firstOrFail();

        $websites = [
            ['name' => 'Manila Grind Coffee Co.', 'client_name' => 'Manila Grind Coffee Co.', 'platform' => 'wordpress', 'website_type' => 'E-commerce'],
            ['name' => 'Cebu Coastal Realty', 'client_name' => 'Cebu Coastal Realty Group', 'platform' => 'webflow', 'website_type' => 'Corporate'],
            ['name' => 'BrightPath Tutorial Center', 'client_name' => 'BrightPath Learning Inc.', 'platform' => 'laravel', 'website_type' => 'Web App'],
            ['name' => 'Isla Verde Resort', 'client_name' => 'Isla Verde Hospitality', 'platform' => 'shopify', 'website_type' => 'E-commerce'],
            ['name' => 'Northgate Legal Partners', 'client_name' => 'Northgate Law Firm', 'platform' => 'static_html', 'website_type' => 'Portfolio'],
        ];

        foreach ($websites as $data) {
            $website = Website::factory()->create([
                'name' => $data['name'],
                'client_name' => $data['client_name'],
                'platform' => $data['platform'],
                'website_type' => $data['website_type'],
                'project_manager_id' => $projectManager->id,
                'status' => 'active',
            ]);

            $team = $developers->random(min(2, $developers->count()));
            $website->teamMembers()->attach($team->pluck('id'));

            WebsiteCredential::create([
                'website_id' => $website->id,
                'label' => 'WP Admin (local dev placeholder)',
                'login_url' => $website->url.'/wp-admin',
                'username' => 'demo_admin',
                'password' => 'DemoPass!2026',
                'notes' => 'Placeholder credential for local development/demo only. Not a real account.',
                'created_by_id' => $admin->id,
            ]);
        }
    }
}
