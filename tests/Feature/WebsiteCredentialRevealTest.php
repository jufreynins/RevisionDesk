<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Website;
use App\Models\WebsiteCredential;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WebsiteCredentialRevealTest extends TestCase
{
    use RefreshDatabase;

    public function test_authorized_user_can_reveal_a_credential_and_it_is_logged(): void
    {
        $pm = User::factory()->projectManager()->create();
        $website = Website::factory()->create(['project_manager_id' => $pm->id]);
        $credential = WebsiteCredential::create([
            'website_id' => $website->id,
            'label' => 'WP Admin',
            'username' => 'admin',
            'password' => 'secret-pass',
        ]);

        $response = $this->actingAs($pm)->getJson(
            route('websites.credentials.reveal', [$website->id, $credential->id])
        );

        $response->assertOk()->assertJson(['username' => 'admin', 'password' => 'secret-pass']);

        $this->assertDatabaseHas('credential_views', [
            'website_credential_id' => $credential->id,
            'user_id' => $pm->id,
        ]);
    }

    public function test_unauthorized_developer_cannot_reveal_a_credential(): void
    {
        $developer = User::factory()->developer()->create(['can_view_credentials' => false]);
        $website = Website::factory()->create();
        $website->teamMembers()->attach($developer->id);
        $credential = WebsiteCredential::create([
            'website_id' => $website->id,
            'label' => 'WP Admin',
            'username' => 'admin',
            'password' => 'secret-pass',
        ]);

        $response = $this->actingAs($developer)->getJson(
            route('websites.credentials.reveal', [$website->id, $credential->id])
        );

        $response->assertForbidden();
        $this->assertDatabaseMissing('credential_views', ['website_credential_id' => $credential->id]);
    }
}
