<?php
// app/Http/Controllers/UploadController.php
//
// This controller does TWO things:
//   1. POST /api/uploads/sign     → generates a Cloudinary signed upload signature
//                                    so the browser uploads DIRECTLY to Cloudinary
//                                    (your server never touches the video file)
//   2. DELETE /api/uploads/{publicId} → deletes a video from Cloudinary
//
// Why sign on the server?
//   Your CLOUDINARY_API_SECRET must stay server-side. The browser gets a
//   short-lived signature and uploads directly — no file passes through Laravel.
//   This means no upload timeouts, no server memory issues, no disk space needed.

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UploadController extends Controller
{
    /**
     * POST /api/uploads/sign
     *
     * Generates a Cloudinary signed upload signature.
     * The frontend uses this to upload directly to Cloudinary's API.
     *
     * Request body: { folder?: string }
     * Response:     { signature, timestamp, api_key, cloud_name, folder, upload_preset? }
     */
    public function sign(Request $request): JsonResponse
    {
        // Only instructors and admins can upload
        $user = $request->user();
        if (!in_array($user->role, ['instructor', 'admin'])) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $cloudName = config('services.cloudinary.cloud_name');
        $apiKey    = config('services.cloudinary.api_key');
        $apiSecret = config('services.cloudinary.api_secret');

        if (!$cloudName || !$apiKey || !$apiSecret) {
            return response()->json([
                'message' => 'Cloudinary is not configured. Check your .env file.',
            ], 500);
        }

        $timestamp = time();
        $folder    = $request->input('folder', 'learn-you/lessons');

        // Parameters to sign — MUST match what the frontend sends to Cloudinary
        // Order matters: alphabetical by key
        $paramsToSign = [
            'folder'    => $folder,
            'timestamp' => $timestamp,
        ];

        // Build the string to sign: key=value pairs sorted alphabetically, joined with &
        // ✅ FIX: wrap with urldecode() so slashes stay as "/" not "%2F"
        // http_build_query encodes "/" → "%2F", but Cloudinary signs against raw values
        ksort($paramsToSign);
        $stringToSign = urldecode(http_build_query($paramsToSign)) . $apiSecret;
        $signature    = sha1($stringToSign);

        return response()->json([
            'signature'  => $signature,
            'timestamp'  => $timestamp,
            'api_key'    => $apiKey,
            'cloud_name' => $cloudName,
            'folder'     => $folder,
        ]);
    }

    /**
     * DELETE /api/uploads/{publicId}
     *
     * Deletes a video from Cloudinary by its public_id.
     * Called when an instructor replaces or removes a video.
     *
     * Route param: publicId (URL-encoded, e.g. "learn-you/lessons/abc123")
     */
    public function destroy(Request $request, string $publicId): JsonResponse
    {
        $user = $request->user();
        if (!in_array($user->role, ['instructor', 'admin'])) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $cloudName = config('services.cloudinary.cloud_name');
        $apiKey    = config('services.cloudinary.api_key');
        $apiSecret = config('services.cloudinary.api_secret');

        // Decode the public_id (slashes are encoded in the URL)
        $decodedPublicId = urldecode($publicId);

        $timestamp = time();
        // Same fix: urldecode() keeps slashes raw for Cloudinary's signature algorithm
        $stringToSign = urldecode(http_build_query([
            'public_id' => $decodedPublicId,
            'timestamp' => $timestamp,
        ])) . $apiSecret;
        $signature = sha1($stringToSign);

        // Call Cloudinary destroy API
        $response = \Illuminate\Support\Facades\Http::asForm()->post(
            "https://api.cloudinary.com/v1_1/{$cloudName}/video/destroy",
            [
                'public_id' => $decodedPublicId,
                'api_key'   => $apiKey,
                'timestamp' => $timestamp,
                'signature' => $signature,
            ]
        );

        if ($response->failed()) {
            return response()->json(['message' => 'Failed to delete from Cloudinary.'], 500);
        }

        return response()->json(['message' => 'Video deleted from Cloudinary.']);
    }
}
