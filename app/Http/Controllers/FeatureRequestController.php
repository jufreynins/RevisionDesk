<?php

namespace App\Http\Controllers;

use App\Models\FeatureRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FeatureRequestController extends Controller
{
    public function index(Request $request): Response
    {
        abort_unless($request->user()->isSuperAdmin(), 403);

        return Inertia::render('FeatureRequests/Index', [
            'requests' => FeatureRequest::with('user:id,name')->latest()->paginate(20),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'type' => ['required', 'in:comment,finding'],
            'message' => ['required', 'string', 'max:5000'],
            'page_url' => ['nullable', 'string', 'max:255'],
            'screenshot' => ['nullable', 'image', 'max:5120'],
        ]);

        if ($request->hasFile('screenshot')) {
            $data['screenshot_path'] = $request->file('screenshot')->store('feature-requests', 'public');
        }
        unset($data['screenshot']);

        $request->user()->featureRequests()->create($data);

        return back()->with('success', 'Thanks — your feedback was submitted.');
    }

    public function updateStatus(Request $request, FeatureRequest $featureRequest): RedirectResponse
    {
        abort_unless($request->user()->isSuperAdmin(), 403);

        $data = $request->validate([
            'status' => ['required', 'in:new,reviewed'],
        ]);

        $featureRequest->update($data);

        return back()->with('success', 'Updated.');
    }
}
