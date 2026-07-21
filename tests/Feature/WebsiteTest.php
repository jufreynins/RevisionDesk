<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Website;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WebsiteTest extends TestCase
{
    use RefreshDatabase;

    public function test_administrator_can_create_a_website(): void
    {
        $admin = User::factory()->administrator()->create();

        $response = $this->actingAs($admin)->post(route('websites.store'), [
            'name' => 'Test Client Site',
            'url' => 'https://example.com',
            'client_name' => 'Test Client Inc.',
            'platform' => 'wordpress',
            'status' => 'active',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('websites', ['name' => 'Test Client Site']);
    }

    public function test_developer_cannot_create_a_website(): void
    {
        $developer = User::factory()->developer()->create();

        $response = $this->actingAs($developer)->post(route('websites.store'), [
            'name' => 'Test Client Site',
            'url' => 'https://example.com',
            'client_name' => 'Test Client Inc.',
            'platform' => 'wordpress',
            'status' => 'active',
        ]);

        $response->assertForbidden();
        $this->assertDatabaseMissing('websites', ['name' => 'Test Client Site']);
    }

    public function test_client_cannot_view_the_websites_module(): void
    {
        $client = User::factory()->client()->create();

        $this->actingAs($client)->get(route('websites.index'))->assertForbidden();
    }

    public function test_project_manager_only_sees_their_own_managed_websites(): void
    {
        $pmA = User::factory()->projectManager()->create();
        $pmB = User::factory()->projectManager()->create();

        Website::factory()->create(['project_manager_id' => $pmA->id, 'name' => 'Owned by A']);
        Website::factory()->create(['project_manager_id' => $pmB->id, 'name' => 'Owned by B']);

        $response = $this->actingAs($pmA)->get(route('websites.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->has('websites.data', 1)
            ->where('websites.data.0.name', 'Owned by A')
        );
    }
}
