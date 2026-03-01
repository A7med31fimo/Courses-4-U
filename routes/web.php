<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
| All frontend routes are handled by the React SPA (index.html in public/).
| Laravel intercepts API routes (routes/api.php) and storage links only.
| React Router handles all client-side navigation.
|--------------------------------------------------------------------------
*/

// Catch-all: serve the React SPA for any non-API route
Route::get('/{any}', function () {
    return file_get_contents(public_path('index.html'));
})->where('any', '^(?!api|storage|sanctum).*$');
