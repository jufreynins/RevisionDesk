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
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->string('ticket_number')->unique();
            $table->string('title');
            $table->foreignId('website_id')->constrained()->cascadeOnDelete();
            $table->string('page_url')->nullable();

            $table->enum('task_type', [
                'bug_fix', 'website_revision', 'content_update', 'design_update',
                'mobile_responsive_issue', 'form_issue', 'email_issue',
                'speed_optimization', 'seo_update', 'plugin_update', 'security_issue',
                'hosting_or_domain_issue', 'new_feature', 'website_maintenance', 'other',
            ])->default('other');

            $table->longText('description')->nullable();

            $table->enum('priority', ['low', 'normal', 'high', 'urgent', 'critical'])->default('normal');
            $table->enum('status', [
                'new', 'assigned', 'in_progress', 'waiting_for_client', 'blocked',
                'ready_for_review', 'revision_needed', 'approved', 'completed', 'cancelled',
            ])->default('new');

            $table->foreignId('assigned_to_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('requester_id')->nullable()->constrained('users')->nullOnDelete();

            $table->date('due_date')->nullable();
            $table->unsignedInteger('estimated_minutes')->nullable();

            $table->text('internal_notes')->nullable();
            $table->text('client_notes')->nullable();

            $table->string('browser')->nullable();
            $table->string('device')->nullable();

            $table->foreignId('related_task_id')->nullable()->constrained('tasks')->nullOnDelete();
            $table->boolean('is_recurring')->default(false);
            $table->string('recurrence_rule')->nullable();

            // Website revision workflow fields
            $table->string('page_name')->nullable();
            $table->string('page_section')->nullable();
            $table->text('current_issue')->nullable();
            $table->text('requested_change')->nullable();
            $table->text('expected_result')->nullable();
            $table->text('steps_to_reproduce')->nullable();
            $table->string('screenshot_before_path')->nullable();
            $table->string('reference_image_path')->nullable();
            $table->date('client_deadline')->nullable();

            $table->timestamp('submitted_for_review_at')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('completed_at')->nullable();

            $table->softDeletes();
            $table->timestamps();

            $table->index('status');
            $table->index('priority');
            $table->index('due_date');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
