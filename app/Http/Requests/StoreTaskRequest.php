<?php

namespace App\Http\Requests;

use App\Models\Task;
use Illuminate\Foundation\Http\FormRequest;

class StoreTaskRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('create', Task::class);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'website_id' => ['required', 'exists:websites,id'],
            'page_url' => ['nullable', 'string', 'max:2048'],
            'task_type' => ['required', 'in:bug_fix,website_revision,content_update,design_update,mobile_responsive_issue,form_issue,email_issue,speed_optimization,seo_update,plugin_update,security_issue,hosting_or_domain_issue,new_feature,website_maintenance,other'],
            'description' => ['nullable', 'string'],
            'priority' => ['required', 'in:low,normal,high,urgent,critical'],
            'status' => ['required', 'in:new,assigned,in_progress,waiting_for_client,blocked,ready_for_review,revision_needed,approved,completed,cancelled'],
            'assigned_to_id' => ['nullable', 'exists:users,id'],
            'due_date' => ['nullable', 'date'],
            'estimated_minutes' => ['nullable', 'integer', 'min:0'],
            'internal_notes' => ['nullable', 'string'],
            'related_task_id' => ['nullable', 'exists:tasks,id'],
            'is_recurring' => ['boolean'],
            'recurrence_rule' => ['nullable', 'string', 'max:100'],

            'page_name' => ['nullable', 'string', 'max:255'],
            'page_section' => ['nullable', 'string', 'max:255'],
            'current_issue' => ['nullable', 'string'],
            'requested_change' => ['nullable', 'string'],
            'expected_result' => ['nullable', 'string'],
            'steps_to_reproduce' => ['nullable', 'string'],
            'client_deadline' => ['nullable', 'date'],

            'checklist_items' => ['nullable', 'array'],
            'checklist_items.*' => ['string', 'max:500'],

            'attachments' => ['nullable', 'array'],
            'attachments.*' => ['file', 'max:10240', 'mimes:png,jpg,jpeg,webp,gif,pdf,docx,xlsx,zip,txt'],
        ];
    }
}
