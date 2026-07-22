<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::factory()->administrator()->create([
            'name' => 'Alex Rivera',
            'email' => 'admin@revisiondesk.test',
            'password' => Hash::make('password'),
        ]);

        User::factory()->projectManager()->create([
            'name' => 'Jordan Cruz',
            'email' => 'pm@revisiondesk.test',
            'password' => Hash::make('password'),
        ]);

        $developerNames = ['Sam Dela Cruz', 'Riley Santos', 'Casey Reyes'];
        foreach ($developerNames as $index => $name) {
            User::factory()->developer()->create([
                'name' => $name,
                'email' => 'developer'.($index + 1).'@revisiondesk.test',
                'password' => Hash::make('password'),
                'can_view_credentials' => $index === 0,
            ]);
        }
    }
}
