<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * Model lifecycle hooks (ticket number generation, tag slugs) must fire
     * during seeding, so this intentionally does not use WithoutModelEvents.
     */
    public function run(): void
    {
        $this->call([
            SettingSeeder::class,
            UserSeeder::class,
            WebsiteSeeder::class,
            TaskSeeder::class,
        ]);
    }
}
