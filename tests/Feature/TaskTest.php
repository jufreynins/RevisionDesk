<?php

namespace Tests\Feature;

use App\Models\Task;
use App\Models\User;
use App\Models\Website;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TaskTest extends TestCase
{
    use RefreshDatabase;

    public function test_project_manager_can_create_a_task_with_an_auto_generated_ticket_number(): void
    {
        $pm = User::factory()->projectManager()->create();
        $website = Website::factory()->create(['project_manager_id' => $pm->id]);

        $response = $this->actingAs($pm)->post(route('tasks.store'), [
            'title' => 'Fix broken checkout button',
            'website_id' => $website->id,
            'task_type' => 'bug_fix',
            'priority' => 'high',
            'status' => 'new',
        ]);

        $response->assertRedirect();

        $task = Task::firstWhere('title', 'Fix broken checkout button');
        $this->assertNotNull($task);
        $this->assertSame('WEB-0001', $task->ticket_number);
    }

    public function test_developer_cannot_create_a_task(): void
    {
        $developer = User::factory()->developer()->create();
        $website = Website::factory()->create();

        $response = $this->actingAs($developer)->post(route('tasks.store'), [
            'title' => 'Should not be allowed',
            'website_id' => $website->id,
            'task_type' => 'bug_fix',
            'priority' => 'normal',
            'status' => 'new',
        ]);

        $response->assertForbidden();
    }

    public function test_ticket_numbers_increment_sequentially(): void
    {
        $website = Website::factory()->create();

        $first = Task::factory()->create(['website_id' => $website->id]);
        $second = Task::factory()->create(['website_id' => $website->id]);

        $this->assertSame('WEB-0001', $first->ticket_number);
        $this->assertSame('WEB-0002', $second->ticket_number);
    }

    public function test_assigned_developer_can_update_task_status(): void
    {
        $developer = User::factory()->developer()->create();
        $task = Task::factory()->create(['assigned_to_id' => $developer->id, 'status' => 'assigned']);

        $response = $this->actingAs($developer)->patch(route('tasks.status.update', $task), [
            'status' => 'in_progress',
        ]);

        $response->assertRedirect();
        $this->assertSame('in_progress', $task->fresh()->status);
    }

    public function test_developer_cannot_update_status_of_a_task_not_assigned_to_them(): void
    {
        $developer = User::factory()->developer()->create();
        $task = Task::factory()->create(['assigned_to_id' => null, 'status' => 'assigned']);

        $response = $this->actingAs($developer)->patch(route('tasks.status.update', $task), [
            'status' => 'in_progress',
        ]);

        $response->assertForbidden();
    }

    public function test_project_manager_can_approve_a_task_ready_for_review(): void
    {
        $pm = User::factory()->projectManager()->create();
        $website = Website::factory()->create(['project_manager_id' => $pm->id]);
        $task = Task::factory()->create(['website_id' => $website->id, 'status' => 'ready_for_review']);

        $response = $this->actingAs($pm)->patch(route('tasks.status.update', $task), [
            'status' => 'approved',
        ]);

        $response->assertRedirect();
        $this->assertSame('approved', $task->fresh()->status);
    }

    public function test_administrator_can_reopen_a_completed_task(): void
    {
        $admin = User::factory()->administrator()->create();
        $task = Task::factory()->create(['status' => 'completed']);

        $response = $this->actingAs($admin)->post(route('tasks.reopen', $task));

        $response->assertRedirect();
        $this->assertSame('revision_needed', $task->fresh()->status);
    }

    public function test_developer_cannot_reopen_a_completed_task(): void
    {
        $developer = User::factory()->developer()->create();
        $task = Task::factory()->create(['assigned_to_id' => $developer->id, 'status' => 'completed']);

        $response = $this->actingAs($developer)->post(route('tasks.reopen', $task));

        $response->assertForbidden();
    }

    public function test_only_administrator_can_delete_a_task(): void
    {
        $admin = User::factory()->administrator()->create();
        $projectManager = User::factory()->projectManager()->create();
        $task = Task::factory()->create();

        $this->actingAs($projectManager)->delete(route('tasks.destroy', $task))->assertForbidden();
        $this->actingAs($admin)->delete(route('tasks.destroy', $task))->assertRedirect();

        $this->assertSoftDeleted($task);
    }
}
