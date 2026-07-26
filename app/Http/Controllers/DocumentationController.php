<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DocumentationController extends Controller
{
    public function index(Request $request): Response
    {
        abort_unless($request->user()->isAdministrator(), 403);

        return Inertia::render('Documentation/Index');
    }
}
