<?php

namespace Database\Factories;

use App\Models\Task;
use App\Models\TaskTimeEntry;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TaskTimeEntry>
 */
class TaskTimeEntryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'task_id' => Task::factory(),
            'user_id' => User::factory(),
            'work_date' => fake()->dateTimeBetween('-2 weeks', 'now'),
            'minutes_spent' => fake()->randomElement([15, 30, 45, 60, 90, 120]),
            'work_description' => fake()->sentence(8),
        ];
    }
}
