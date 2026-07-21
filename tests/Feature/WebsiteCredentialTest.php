<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Website;
use App\Models\WebsiteCredential;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class WebsiteCredentialTest extends TestCase
{
    use RefreshDatabase;

    public function test_password_is_encrypted_at_rest_and_decrypts_correctly(): void
    {
        $website = Website::factory()->create();

        $credential = WebsiteCredential::create([
            'website_id' => $website->id,
            'label' => 'WP Admin',
            'username' => 'admin',
            'password' => 'CorrectHorseBatteryStaple',
        ]);

        $rawValue = DB::table('website_credentials')->where('id', $credential->id)->value('password');

        $this->assertStringNotContainsString('CorrectHorseBatteryStaple', $rawValue);
        $this->assertSame('CorrectHorseBatteryStaple', $credential->fresh()->password);
    }

    public function test_password_is_never_serialized_to_arrays_or_json(): void
    {
        $website = Website::factory()->create();

        $credential = WebsiteCredential::create([
            'website_id' => $website->id,
            'label' => 'WP Admin',
            'username' => 'admin',
            'password' => 'CorrectHorseBatteryStaple',
        ]);

        $this->assertArrayNotHasKey('password', $credential->toArray());
        $this->assertStringNotContainsString('CorrectHorseBatteryStaple', $credential->toJson());
    }

    public function test_developer_without_permission_cannot_view_credentials(): void
    {
        $developer = User::factory()->developer()->create(['can_view_credentials' => false]);
        $website = Website::factory()->create();
        $website->teamMembers()->attach($developer->id);

        $this->assertFalse($developer->can('view', WebsiteCredential::create([
            'website_id' => $website->id,
            'label' => 'WP Admin',
            'username' => 'admin',
            'password' => 'secret',
        ])));
    }

    public function test_developer_with_permission_and_team_membership_can_view_credentials(): void
    {
        $developer = User::factory()->developer()->create(['can_view_credentials' => true]);
        $website = Website::factory()->create();
        $website->teamMembers()->attach($developer->id);

        $credential = WebsiteCredential::create([
            'website_id' => $website->id,
            'label' => 'WP Admin',
            'username' => 'admin',
            'password' => 'secret',
        ]);

        $this->assertTrue($developer->can('view', $credential));
    }

    public function test_client_can_never_view_credentials(): void
    {
        $client = User::factory()->client()->create();
        $website = Website::factory()->create();

        $credential = WebsiteCredential::create([
            'website_id' => $website->id,
            'label' => 'WP Admin',
            'username' => 'admin',
            'password' => 'secret',
        ]);

        $this->assertFalse($client->can('view', $credential));
    }
}
