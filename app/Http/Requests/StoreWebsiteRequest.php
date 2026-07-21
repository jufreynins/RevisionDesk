<?php

namespace App\Http\Requests;

use App\Models\Website;
use Illuminate\Foundation\Http\FormRequest;

class StoreWebsiteRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('create', Website::class);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'url' => ['required', 'url', 'max:255'],
            'client_name' => ['required', 'string', 'max:255'],
            'website_type' => ['nullable', 'string', 'max:100'],
            'platform' => ['required', 'in:wordpress,shopify,webflow,wix,squarespace,laravel,react,static_html,other'],
            'hosting_provider' => ['nullable', 'string', 'max:255'],
            'project_manager_id' => ['nullable', 'exists:users,id'],
            'status' => ['required', 'in:active,on_hold,maintenance,completed,archived'],
            'notes' => ['nullable', 'string'],
            'team_member_ids' => ['nullable', 'array'],
            'team_member_ids.*' => ['exists:users,id'],
        ];
    }
}
