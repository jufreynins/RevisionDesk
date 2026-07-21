<?php

namespace Tests\Feature;

use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TaskPermissionTest extends TestCase
{
    use RefreshDatabase;

    public function test_client_can_view_their_own_task(): void
    {
        $client = User::factory()->client()->create();
        $task = Task::factory()->create(['requester_id' => $client->id]);

        $this->actingAs($client)->get(route('tasks.show', $task))->assertOk();
    }

    public function test_client_cannot_view_another_clients_task(): void
    {
        $clientA = User::factory()->client()->create();
        $clientB = User::factory()->client()->create();
        $task = Task::factory()->create(['requester_id' => $clientB->id]);

        $this->actingAs($clientA)->get(route('tasks.show', $task))->assertForbidden();
    }

    public function test_administrator_can_view_any_task(): void
    {
        $admin = User::factory()->administrator()->create();
        $task = Task::factory()->create();

        $this->actingAs($admin)->get(route('tasks.show', $task))->assertOk();
    }

    public function test_task_index_only_lists_tasks_visible_to_the_current_role(): void
    {
        $client = User::factory()->client()->create();
        $ownTask = Task::factory()->create(['requester_id' => $client->id]);
        Task::factory()->create();

        $response = $this->actingAs($client)->get(route('tasks.index', ['view' => 'all']));

        $response->assertInertia(fn ($page) => $page
            ->has('tasks.data', 1)
            ->where('tasks.data.0.id', $ownTask->id)
        );
    }
}
