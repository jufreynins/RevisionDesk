export type UserRole = 'super_admin' | 'administrator' | 'project_manager' | 'developer';

export interface User {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    avatar?: string | null;
    phone?: string | null;
    is_active: boolean;
    can_view_credentials: boolean;
    has_completed_tour: boolean;
    email_verified_at?: string | null;
}

export type WebsitePlatform =
    | 'wordpress'
    | 'shopify'
    | 'webflow'
    | 'wix'
    | 'squarespace'
    | 'laravel'
    | 'react'
    | 'static_html'
    | 'other';

export type WebsiteStatus = 'active' | 'on_hold' | 'maintenance' | 'completed' | 'archived';

export interface Website {
    id: number;
    name: string;
    url: string;
    client_name: string;
    website_type: string | null;
    platform: WebsitePlatform;
    hosting_provider: string | null;
    project_manager_id: number | null;
    project_manager?: User | null;
    team_members?: User[];
    status: WebsiteStatus;
    thumbnail_path: string | null;
    notes: string | null;
    open_tasks_count?: number;
    completed_tasks_count?: number;
    created_at: string;
}

export type TaskPriority = 'low' | 'normal' | 'high' | 'urgent' | 'critical';

export type TaskStatus =
    | 'new'
    | 'assigned'
    | 'in_progress'
    | 'waiting_for_client'
    | 'blocked'
    | 'ready_for_review'
    | 'revision_needed'
    | 'approved'
    | 'completed'
    | 'cancelled';

export type TaskType =
    | 'bug_fix'
    | 'website_revision'
    | 'content_update'
    | 'design_update'
    | 'mobile_responsive_issue'
    | 'form_issue'
    | 'email_issue'
    | 'speed_optimization'
    | 'seo_update'
    | 'plugin_update'
    | 'security_issue'
    | 'hosting_or_domain_issue'
    | 'new_feature'
    | 'website_maintenance'
    | 'other';

export interface TaskAttachment {
    id: number;
    task_id: number;
    task_comment_id: number | null;
    uploaded_by_id: number | null;
    uploaded_by?: User | null;
    original_name: string;
    mime_type: string;
    size_bytes: number;
    is_image: boolean;
    created_at: string;
}

export interface TaskComment {
    id: number;
    task_id: number;
    user_id: number;
    user?: User;
    body: string;
    edited_at: string | null;
    attachments?: TaskAttachment[];
    created_at: string;
}

export interface TaskChecklistItem {
    id: number;
    task_id: number;
    item_text: string;
    is_completed: boolean;
    completed_by_id: number | null;
    completed_by?: User | null;
    completed_at: string | null;
    sort_order: number;
}

export interface TaskTimeEntry {
    id: number;
    task_id: number;
    user_id: number;
    user?: User;
    work_date: string;
    minutes_spent: number;
    work_description: string | null;
}

export interface TaskActivity {
    id: number;
    task_id: number;
    task?: { id: number; ticket_number: string; title: string };
    user_id: number | null;
    user?: User | null;
    action: string;
    previous_value: string | null;
    new_value: string | null;
    created_at: string;
}

export interface Task {
    id: number;
    ticket_number: string;
    title: string;
    website_id: number;
    website?: Website;
    page_url: string | null;
    task_type: TaskType;
    description: string | null;
    priority: TaskPriority;
    status: TaskStatus;
    assigned_to_id: number | null;
    assigned_to?: User | null;
    due_date: string | null;
    estimated_minutes: number | null;
    internal_notes?: string | null;
    related_task_id: number | null;
    related_task?: { id: number; ticket_number: string; title: string } | null;
    is_recurring: boolean;
    recurrence_rule: string | null;
    page_name: string | null;
    page_section: string | null;
    current_issue: string | null;
    requested_change: string | null;
    expected_result: string | null;
    steps_to_reproduce: string | null;
    client_deadline: string | null;
    checklist_items?: TaskChecklistItem[];
    time_entries?: TaskTimeEntry[];
    attachments?: TaskAttachment[];
    activities?: TaskActivity[];
    submitted_for_review_at: string | null;
    approved_at: string | null;
    completed_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface Paginated<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

export interface AppNotification {
    id: string;
    type: string;
    data: {
        type: string;
        task_id: number;
        ticket_number: string;
        task_title: string;
        message: string;
        actor_name: string | null;
    };
    read_at: string | null;
    created_at: string;
}

export interface TaskPermissions {
    canEdit: boolean;
    canUpdateStatus: boolean;
    canDelete: boolean;
    canApprove: boolean;
    canReopen: boolean;
}

export type FeatureRequestType = 'comment' | 'finding';
export type FeatureRequestStatus = 'new' | 'reviewed';

export interface FeatureRequest {
    id: number;
    user_id: number;
    user?: User;
    type: FeatureRequestType;
    message: string;
    page_url: string | null;
    screenshot_path: string | null;
    screenshot_url: string | null;
    status: FeatureRequestStatus;
    created_at: string;
}
