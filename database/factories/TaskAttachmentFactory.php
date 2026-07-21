<?php

namespace Database\Factories;

use App\Models\Task;
use App\Models\TaskAttachment;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<TaskAttachment>
 */
class TaskAttachmentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $isImage = fake()->boolean(80);
        $extension = $isImage ? fake()->randomElement(['png', 'jpg', 'webp']) : fake()->randomElement(['pdf', 'docx', 'zip']);
        $name = Str::slug(fake()->words(3, true)).'.'.$extension;

        return [
            'task_id' => Task::factory(),
            'uploaded_by_id' => User::factory(),
            'original_name' => $name,
            'stored_path' => 'task-attachments/'.fake()->uuid().'-'.$name,
            'mime_type' => $isImage ? "image/{$extension}" : 'application/octet-stream',
            'size_bytes' => fake()->numberBetween(15_000, 4_000_000),
            'is_image' => $isImage,
        ];
    }
}
