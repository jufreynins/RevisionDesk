<?php

namespace Database\Seeders;

use App\Models\Tag;
use App\Models\Task;
use App\Models\TaskActivity;
use App\Models\User;
use App\Models\Website;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;

class TaskSeeder extends Seeder
{
    /**
     * A 1x1 transparent PNG, used so seeded attachment records point at a
     * real file on disk (downloads would otherwise 404/error).
     */
    private const PLACEHOLDER_PNG_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $clients = User::where('role', User::ROLE_CLIENT)->get();
        $projectManager = User::where('role', User::ROLE_PROJECT_MANAGER)->firstOrFail();
        $websites = Website::with('teamMembers')->get();

        $tags = collect(['homepage', 'checkout', 'mobile', 'seo', 'urgent-client', 'design'])
            ->map(fn (string $name) => Tag::factory()->create(['name' => $name, 'slug' => $name]));

        $statuses = ['new', 'assigned', 'in_progress', 'waiting_for_client', 'ready_for_review', 'revision_needed', 'completed', 'blocked'];
        $priorities = ['low', 'normal', 'normal', 'high', 'urgent', 'critical'];

        $taskIndex = 0;

        foreach ($websites as $website) {
            $team = $website->teamMembers;

            foreach (range(1, 6) as $i) {
                $taskIndex++;
                $status = $statuses[$taskIndex % count($statuses)];
                $priority = $priorities[array_rand($priorities)];
                $assignee = $team->isNotEmpty() ? $team->random() : null;
                $requester = fake()->boolean(60) && $clients->isNotEmpty()
                    ? $clients->random()
                    : $projectManager;

                $isOverdue = $taskIndex % 7 === 0 && ! in_array($status, ['completed', 'cancelled'], true);
                $isCompletedThisWeek = $status === 'completed' && $taskIndex % 3 === 0;

                $createdAt = now()->subDays(fake()->numberBetween(5, 45));
                $completedAt = null;

                if ($status === 'completed') {
                    $completedAt = $isCompletedThisWeek
                        ? now()->subDays(fake()->numberBetween(0, 4))
                        : $createdAt->copy()->addDays(fake()->numberBetween(1, 10));
                }

                /** @var Task $task */
                $task = Task::factory()->create([
                    'website_id' => $website->id,
                    'status' => $status,
                    'priority' => $priority,
                    'assigned_to_id' => $assignee?->id,
                    'requester_id' => $requester->id,
                    'due_date' => $isOverdue
                        ? now()->subDays(fake()->numberBetween(1, 10))
                        : now()->addDays(fake()->numberBetween(1, 21)),
                    'completed_at' => $completedAt,
                    'internal_notes' => fake()->optional()->sentence(10),
                    'client_notes' => fake()->optional()->sentence(8),
                    'created_at' => $createdAt,
                    'updated_at' => $completedAt ?? $createdAt,
                ]);

                $task->tags()->attach($tags->random(fake()->numberBetween(0, 2))->pluck('id'));

                // Checklist items
                foreach (range(1, fake()->numberBetween(0, 4)) as $c) {
                    $task->checklistItems()->create([
                        'item_text' => fake()->sentence(5),
                        'is_completed' => fake()->boolean(50),
                        'sort_order' => $c,
                    ]);
                }

                // Comments: staff internal note + optional client-visible reply
                if ($assignee) {
                    $task->comments()->create([
                        'user_id' => $assignee->id,
                        'body' => '<p>'.fake()->sentence(12).'</p>',
                        'is_internal' => true,
                    ]);
                }

                if (fake()->boolean(50)) {
                    $task->comments()->create([
                        'user_id' => $requester->id,
                        'body' => '<p>'.fake()->sentence(10).'</p>',
                        'is_internal' => false,
                    ]);
                }

                // Attachment metadata — backed by a real placeholder file so downloads work
                if (fake()->boolean(40)) {
                    $storedPath = 'task-attachments/'.fake()->uuid().'.png';
                    $contents = base64_decode(self::PLACEHOLDER_PNG_BASE64);
                    Storage::disk('local')->put($storedPath, $contents);

                    $task->attachments()->create([
                        'uploaded_by_id' => $assignee?->id ?? $requester->id,
                        'original_name' => 'screenshot-'.fake()->numberBetween(1, 999).'.png',
                        'stored_path' => $storedPath,
                        'mime_type' => 'image/png',
                        'size_bytes' => strlen($contents),
                        'is_image' => true,
                    ]);
                }

                // Time entries for in-progress/completed work
                if ($assignee && in_array($status, ['in_progress', 'ready_for_review', 'completed'], true)) {
                    foreach (range(1, fake()->numberBetween(1, 3)) as $t) {
                        $task->timeEntries()->create([
                            'user_id' => $assignee->id,
                            'work_date' => now()->subDays(fake()->numberBetween(0, 6)),
                            'minutes_spent' => fake()->randomElement([30, 45, 60, 90]),
                            'work_description' => fake()->sentence(6),
                        ]);
                    }
                }

                // Activity history
                $this->logActivity($task, $requester, 'created', null, null);

                if ($assignee) {
                    $this->logActivity($task, $projectManager, 'assigned', null, $assignee->name);
                }

                $this->logActivity($task, $projectManager, 'status_changed', 'new', $status);
            }
        }
    }

    private function logActivity(Task $task, User $user, string $action, ?string $previous, ?string $new): void
    {
        TaskActivity::create([
            'task_id' => $task->id,
            'user_id' => $user->id,
            'action' => $action,
            'previous_value' => $previous,
            'new_value' => $new,
            'created_at' => Carbon::now()->subMinutes(fake()->numberBetween(0, 10_000)),
        ]);
    }
}
