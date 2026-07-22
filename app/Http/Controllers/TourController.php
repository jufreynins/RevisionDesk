<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class TourController extends Controller
{
    /**
     * Mark the product tour as completed (or skipped) for the current user.
     */
    public function complete(Request $request)
    {
        $request->user()->update(['has_completed_tour' => true]);

        return back();
    }
}
