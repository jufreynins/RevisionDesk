<?php

namespace Tests\Feature;

use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TaskCommentTest extends TestCase
{
    use RefreshDatabase;

    public function test_developer_can_post_an_internal_comment(): void
    {
        $developer = User::factory()->developer()->create();
        $task = Task::factory()->create(['assigned_to_id' => $developer->id]);

        $response = $this->actingAs($developer)->post(route('tasks.comments.store', $task), [
            'body' => 'Staging password rotated.',
            'is_internal' => true,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('task_comments', [
            'task_id' => $task->id,
            'is_internal' => true,
        ]);
    }

    public function test_client_cannot_post_an_internal_comment(): void
    {
        $client = User::factory()->client()->create();
        $task = Task::factory()->create(['requester_id' => $client->id]);

        $response = $this->actingAs($client)->post(route('tasks.comments.store', $task), [
            'body' => 'Trying to sneak an internal note in.',
            'is_internal' => true,
        ]);

        $response->assertForbidden();
    }

    public function test_internal_comments_are_not_returned_to_client_users(): void
    {
        $client = User::factory()->client()->create();
        $developer = User::factory()->developer()->create();
        $task = Task::factory()->create(['requester_id' => $client->id, 'assigned_to_id' => $developer->id]);

        $task->comments()->create([
            'user_id' => $developer->id,
            'body' => 'Internal-only debugging note.',
            'is_internal' => true,
        ]);

        $task->comments()->create([
            'user_id' => $client->id,
            'body' => 'Client-visible reply.',
            'is_internal' => false,
        ]);

        $response = $this->actingAs($client)->get(route('tasks.show', $task));

        $response->assertInertia(fn ($page) => $page
            ->has('comments', 1)
            ->where('comments.0.body', 'Client-visible reply.')
        );
    }

    public function test_internal_comments_are_visible_to_staff(): void
    {
        $developer = User::factory()->developer()->create();
        $task = Task::factory()->create(['assigned_to_id' => $developer->id]);

        $task->comments()->create([
            'user_id' => $developer->id,
            'body' => 'Internal-only debugging note.',
            'is_internal' => true,
        ]);

        $response = $this->actingAs($developer)->get(route('tasks.show', $task));

        $response->assertInertia(fn ($page) => $page->has('comments', 1));
    }
}
