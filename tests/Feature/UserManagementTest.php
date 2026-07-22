<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_administrator_can_create_a_team_member(): void
    {
        $admin = User::factory()->administrator()->create();

        $response = $this->actingAs($admin)->post(route('team.store'), [
            'name' => 'New Developer',
            'email' => 'newdev@revisiondesk.test',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'developer',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('users', ['email' => 'newdev@revisiondesk.test', 'role' => 'developer']);
    }

    public function test_developer_cannot_create_a_team_member(): void
    {
        $developer = User::factory()->developer()->create();

        $response = $this->actingAs($developer)->post(route('team.store'), [
            'name' => 'New Developer',
            'email' => 'newdev@revisiondesk.test',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'developer',
        ]);

        $response->assertForbidden();
    }

    public function test_client_cannot_view_the_team_list(): void
    {
        $client = User::factory()->client()->create();

        $this->actingAs($client)->get(route('team.index'))->assertForbidden();
    }

    public function test_project_manager_can_view_but_not_create_team_members(): void
    {
        $pm = User::factory()->projectManager()->create();

        $this->actingAs($pm)->get(route('team.index'))->assertOk();
        $this->actingAs($pm)->get(route('team.create'))->assertForbidden();
    }

    public function test_administrator_cannot_deactivate_their_own_account_from_the_team_page(): void
    {
        $admin = User::factory()->administrator()->create();

        $this->actingAs($admin)->delete(route('team.destroy', $admin))->assertForbidden();
    }

    public function test_administrator_can_deactivate_another_user(): void
    {
        $admin = User::factory()->administrator()->create();
        $developer = User::factory()->developer()->create();

        $response = $this->actingAs($admin)->delete(route('team.destroy', $developer));

        $response->assertRedirect();
        $this->assertSoftDeleted($developer);
    }
}
