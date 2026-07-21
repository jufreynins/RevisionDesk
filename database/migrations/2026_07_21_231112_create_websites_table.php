<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('websites', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('url');
            $table->string('client_name');
            $table->string('website_type')->nullable();
            $table->enum('platform', [
                'wordpress', 'shopify', 'webflow', 'wix', 'squarespace',
                'laravel', 'react', 'static_html', 'other',
            ])->default('other');
            $table->string('hosting_provider')->nullable();
            $table->foreignId('project_manager_id')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('status', ['active', 'on_hold', 'maintenance', 'completed', 'archived'])
                ->default('active');
            $table->string('thumbnail_path')->nullable();
            $table->text('notes')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->index('status');
            $table->index('platform');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('websites');
    }
};
