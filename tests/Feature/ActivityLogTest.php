<?php

namespace Tests\Feature;

use App\Models\Task;
use App\Models\User;
use App\Models\Website;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ActivityLogTest extends TestCase
{
    use RefreshDatabase;

    public function test_client_cannot_access_the_activity_log(): void
    {
        $client = User::factory()->client()->create();

        $this->actingAs($client)->get(route('activity-log.index'))->assertForbidden();
    }

    public function test_project_manager_only_sees_activity_for_their_own_websites(): void
    {
        $pmA = User::factory()->projectManager()->create();
        $pmB = User::factory()->projectManager()->create();

        $websiteA = Website::factory()->create(['project_manager_id' => $pmA->id]);
        $websiteB = Website::factory()->create(['project_manager_id' => $pmB->id]);

        $taskA = Task::factory()->create(['website_id' => $websiteA->id]);
        $taskB = Task::factory()->create(['website_id' => $websiteB->id]);

        $taskA->activities()->create(['user_id' => $pmA->id, 'action' => 'created']);
        $taskB->activities()->create(['user_id' => $pmB->id, 'action' => 'created']);

        $response = $this->actingAs($pmA)->get(route('activity-log.index'));

        $response->assertInertia(fn ($page) => $page
            ->has('activities.data', 1)
            ->where('activities.data.0.task_id', $taskA->id)
        );
    }

    public function test_administrator_sees_all_activity(): void
    {
        $admin = User::factory()->administrator()->create();
        $task = Task::factory()->create();
        $task->activities()->create(['user_id' => $admin->id, 'action' => 'created']);

        $response = $this->actingAs($admin)->get(route('activity-log.index'));

        $response->assertInertia(fn ($page) => $page->has('activities.data', 1));
    }
}
