<?php

namespace Database\Factories;

use App\Models\Task;
use App\Models\Website;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Task>
 */
class TaskFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $taskTypes = [
            'bug_fix', 'website_revision', 'content_update', 'design_update',
            'mobile_responsive_issue', 'form_issue', 'speed_optimization',
            'seo_update', 'plugin_update', 'security_issue', 'new_feature',
        ];

        return [
            'title' => fake()->sentence(6),
            'website_id' => Website::factory(),
            'task_type' => fake()->randomElement($taskTypes),
            'description' => '<p>'.fake()->paragraph(4).'</p>',
            'priority' => fake()->randomElement(['low', 'normal', 'normal', 'high', 'urgent', 'critical']),
            'status' => fake()->randomElement([
                'new', 'assigned', 'in_progress', 'waiting_for_client',
                'ready_for_review', 'revision_needed', 'completed',
            ]),
            'due_date' => fake()->optional(0.8)->dateTimeBetween('-1 week', '+3 weeks'),
            'estimated_minutes' => fake()->optional(0.7)->randomElement([30, 60, 90, 120, 240, 480]),
            'browser' => fake()->optional()->randomElement(['Chrome', 'Firefox', 'Safari', 'Edge']),
            'device' => fake()->optional()->randomElement(['Desktop', 'Mobile', 'Tablet']),
        ];
    }

    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'completed',
            'completed_at' => fake()->dateTimeBetween('-2 weeks', 'now'),
        ]);
    }

    public function overdue(): static
    {
        return $this->state(fn (array $attributes) => [
            'due_date' => fake()->dateTimeBetween('-2 weeks', '-1 day'),
            'status' => fake()->randomElement(['new', 'assigned', 'in_progress']),
        ]);
    }

    public function urgent(): static
    {
        return $this->state(fn (array $attributes) => [
            'priority' => fake()->randomElement(['urgent', 'critical']),
        ]);
    }
}
