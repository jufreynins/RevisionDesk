<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreWebsiteCredentialRequest;
use App\Models\Website;
use App\Models\WebsiteCredential;
use Illuminate\Http\Request;

class WebsiteCredentialController extends Controller
{
    public function store(StoreWebsiteCredentialRequest $request, Website $website)
    {
        $website->credentials()->create([
            ...$request->validated(),
            'created_by_id' => $request->user()->id,
        ]);

        return back()->with('success', 'Credential added.');
    }

    public function update(StoreWebsiteCredentialRequest $request, Website $website, WebsiteCredential $credential)
    {
        $this->authorize('update', $credential);

        abort_unless($credential->website_id === $website->id, 404);

        $credential->update($request->validated());

        return back()->with('success', 'Credential updated.');
    }

    public function destroy(Request $request, Website $website, WebsiteCredential $credential)
    {
        $this->authorize('delete', $credential);

        abort_unless($credential->website_id === $website->id, 404);

        $credential->delete();

        return back()->with('success', 'Credential removed.');
    }

    /**
     * Reveal the decrypted secret values. Returns JSON (not an Inertia response)
     * so the credential never lands in Inertia's page history/state.
     */
    public function reveal(Request $request, Website $website, WebsiteCredential $credential)
    {
        $this->authorize('view', $credential);

        abort_unless($credential->website_id === $website->id, 404);

        $credential->views()->create([
            'user_id' => $request->user()->id,
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'username' => $credential->username,
            'password' => $credential->password,
        ]);
    }
}
