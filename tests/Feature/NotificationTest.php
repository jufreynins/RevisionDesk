<?php

namespace Tests\Feature;

use App\Models\Task;
use App\Models\User;
use App\Models\Website;
use App\Notifications\TaskEventNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class NotificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_assigned_developer_is_notified_when_a_comment_is_posted(): void
    {
        Notification::fake();

        $developer = User::factory()->developer()->create();
        $pm = User::factory()->projectManager()->create();
        $website = Website::factory()->create(['project_manager_id' => $pm->id]);
        $task = Task::factory()->create(['website_id' => $website->id, 'assigned_to_id' => $developer->id]);

        $this->actingAs($pm)->post(route('tasks.comments.store', $task), [
            'body' => 'Please check this.',
            'is_internal' => false,
        ]);

        Notification::assertSentTo(
            $developer,
            TaskEventNotification::class,
            fn ($notification) => $notification->type === 'comment_added'
        );
    }

    public function test_client_is_not_notified_of_internal_comments(): void
    {
        Notification::fake();

        $client = User::factory()->client()->create();
        $developer = User::factory()->developer()->create();
        $task = Task::factory()->create(['assigned_to_id' => $developer->id, 'requester_id' => $client->id]);

        $this->actingAs($developer)->post(route('tasks.comments.store', $task), [
            'body' => 'Internal debugging note.',
            'is_internal' => true,
        ]);

        Notification::assertNotSentTo($client, TaskEventNotification::class);
    }

    public function test_client_is_notified_of_client_visible_comments(): void
    {
        Notification::fake();

        $client = User::factory()->client()->create();
        $developer = User::factory()->developer()->create();
        $task = Task::factory()->create(['assigned_to_id' => $developer->id, 'requester_id' => $client->id]);

        $this->actingAs($developer)->post(route('tasks.comments.store', $task), [
            'body' => 'Done, please review.',
            'is_internal' => false,
        ]);

        Notification::assertSentTo($client, TaskEventNotification::class);
    }

    public function test_project_manager_is_notified_when_task_is_submitted_for_review(): void
    {
        Notification::fake();

        $pm = User::factory()->projectManager()->create();
        $developer = User::factory()->developer()->create();
        $website = Website::factory()->create(['project_manager_id' => $pm->id]);
        $task = Task::factory()->create([
            'website_id' => $website->id,
            'assigned_to_id' => $developer->id,
            'status' => 'in_progress',
        ]);

        $this->actingAs($developer)->patch(route('tasks.status.update', $task), [
            'status' => 'ready_for_review',
        ]);

        Notification::assertSentTo(
            $pm,
            TaskEventNotification::class,
            fn ($notification) => $notification->type === 'ready_for_review'
        );
    }

    public function test_actor_does_not_notify_themselves(): void
    {
        Notification::fake();

        $developer = User::factory()->developer()->create();
        $task = Task::factory()->create(['assigned_to_id' => $developer->id, 'requester_id' => $developer->id]);

        $this->actingAs($developer)->post(route('tasks.comments.store', $task), [
            'body' => 'Self comment.',
            'is_internal' => false,
        ]);

        Notification::assertNothingSent();
    }

    public function test_user_can_mark_a_notification_as_read(): void
    {
        $developer = User::factory()->developer()->create();
        $task = Task::factory()->create(['assigned_to_id' => $developer->id]);

        $developer->notify(TaskEventNotification::assigned($task, null));
        $notification = $developer->notifications()->first();

        $this->assertNull($notification->read_at);

        $this->actingAs($developer)->patch(route('notifications.read', $notification->id));

        $this->assertNotNull($notification->fresh()->read_at);
    }

    public function test_user_cannot_mark_another_users_notification_as_read(): void
    {
        $developer = User::factory()->developer()->create();
        $otherUser = User::factory()->developer()->create();
        $task = Task::factory()->create(['assigned_to_id' => $developer->id]);

        $developer->notify(TaskEventNotification::assigned($task, null));
        $notification = $developer->notifications()->first();

        $this->actingAs($otherUser)->patch(route('notifications.read', $notification->id))->assertForbidden();
    }
}
