<?php

namespace Database\Factories;

use App\Models\Website;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Website>
 */
class WebsiteFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->company();

        return [
            'name' => $name,
            'url' => 'https://www.'.Str::slug($name).'.com',
            'client_name' => fake()->company(),
            'website_type' => fake()->randomElement(['Corporate', 'E-commerce', 'Portfolio', 'Blog', 'Landing Page']),
            'platform' => fake()->randomElement(['wordpress', 'shopify', 'webflow', 'laravel', 'react', 'static_html']),
            'hosting_provider' => fake()->randomElement(['SiteGround', 'DigitalOcean', 'Vercel', 'AWS', 'Cloudways']),
            'status' => fake()->randomElement(['active', 'active', 'active', 'on_hold', 'maintenance']),
            'notes' => fake()->optional()->sentence(12),
        ];
    }
}
