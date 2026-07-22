<?php

namespace Tests\Feature;

use App\Models\Task;
use App\Models\User;
use App\Models\Website;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TaskPermissionTest extends TestCase
{
    use RefreshDatabase;

    public function test_developer_can_view_their_assigned_task(): void
    {
        $developer = User::factory()->developer()->create();
        $task = Task::factory()->create(['assigned_to_id' => $developer->id]);

        $this->actingAs($developer)->get(route('tasks.show', $task))->assertOk();
    }

    public function test_developer_cannot_view_a_task_not_assigned_to_them(): void
    {
        $developer = User::factory()->developer()->create();
        $task = Task::factory()->create(['assigned_to_id' => null]);

        $this->actingAs($developer)->get(route('tasks.show', $task))->assertForbidden();
    }

    public function test_project_manager_can_view_a_task_on_their_website(): void
    {
        $pm = User::factory()->projectManager()->create();
        $website = Website::factory()->create(['project_manager_id' => $pm->id]);
        $task = Task::factory()->create(['website_id' => $website->id]);

        $this->actingAs($pm)->get(route('tasks.show', $task))->assertOk();
    }

    public function test_project_manager_cannot_view_a_task_on_another_managers_website(): void
    {
        $pm = User::factory()->projectManager()->create();
        $task = Task::factory()->create();

        $this->actingAs($pm)->get(route('tasks.show', $task))->assertForbidden();
    }

    public function test_administrator_can_view_any_task(): void
    {
        $admin = User::factory()->administrator()->create();
        $task = Task::factory()->create();

        $this->actingAs($admin)->get(route('tasks.show', $task))->assertOk();
    }

    public function test_task_index_only_lists_tasks_visible_to_the_current_role(): void
    {
        $developer = User::factory()->developer()->create();
        $ownTask = Task::factory()->create(['assigned_to_id' => $developer->id]);
        Task::factory()->create();

        $response = $this->actingAs($developer)->get(route('tasks.index', ['view' => 'all']));

        $response->assertInertia(fn ($page) => $page
            ->has('tasks.data', 1)
            ->where('tasks.data.0.id', $ownTask->id)
        );
    }
}
