<?php

namespace Tests\Feature;

use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TaskCommentTest extends TestCase
{
    use RefreshDatabase;

    public function test_assigned_developer_can_post_a_comment(): void
    {
        $developer = User::factory()->developer()->create();
        $task = Task::factory()->create(['assigned_to_id' => $developer->id]);

        $response = $this->actingAs($developer)->post(route('tasks.comments.store', $task), [
            'body' => 'Staging password rotated.',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('task_comments', [
            'task_id' => $task->id,
            'user_id' => $developer->id,
        ]);
    }

    public function test_developer_cannot_comment_on_a_task_not_assigned_to_them(): void
    {
        $developer = User::factory()->developer()->create();
        $task = Task::factory()->create(['assigned_to_id' => null]);

        $response = $this->actingAs($developer)->post(route('tasks.comments.store', $task), [
            'body' => 'Trying to comment on a task I cannot see.',
        ]);

        $response->assertForbidden();
    }

    public function test_comments_are_visible_to_authorized_viewers(): void
    {
        $developer = User::factory()->developer()->create();
        $task = Task::factory()->create(['assigned_to_id' => $developer->id]);

        $task->comments()->create([
            'user_id' => $developer->id,
            'body' => 'Investigating the checkout bug.',
        ]);

        $response = $this->actingAs($developer)->get(route('tasks.show', $task));

        $response->assertInertia(fn ($page) => $page->has('comments', 1));
    }
}
