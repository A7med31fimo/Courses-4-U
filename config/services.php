<?php
// config/services.php
// ADD the cloudinary block to your existing services.php
// (keep all the other entries like mailgun, postmark, ses, etc.)

return [

    // ... your existing services ...

    /*
    |--------------------------------------------------------------------------
    | Cloudinary
    |--------------------------------------------------------------------------
    | Free tier: 25 GB storage + 25 GB/month bandwidth
    | Sign up at https://cloudinary.com (no credit card required)
    | Get credentials from: https://console.cloudinary.com → Dashboard
    */
    'cloudinary' => [
        'cloud_name' => env('CLOUDINARY_CLOUD_NAME', ''),
        'api_key'    => env('CLOUDINARY_API_KEY', ''),
        'api_secret' => env('CLOUDINARY_API_SECRET', ''),
    ],

];
