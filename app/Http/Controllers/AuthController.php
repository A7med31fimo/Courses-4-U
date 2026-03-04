<?php
// app/Http/Controllers/AuthController.php
// EMAIL VERIFICATION: commented out until mail service is purchased

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
// use Illuminate\Auth\Events\Registered;  // DISABLED: email verification
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * POST /api/register
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => $request->password,
            'role'     => $request->role ?? 'student',
        ]);

        // DISABLED: email verification — uncomment when mail service is ready
        // event(new Registered($user));

        // Auto-mark email as verified so users can access everything immediately
        $user->markEmailAsVerified();

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'user'           => new UserResource($user),
            'token'          => $token,
            'email_verified' => true,
            'message'        => 'Account created successfully.',
        ], 201);
    }

    /**
     * POST /api/login
     */
    public function login(LoginRequest $request): JsonResponse
    {
        if (!Auth::attempt($request->only('email', 'password'))) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        /** @var User $user */
        $user  = Auth::user();
        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'user'           => new UserResource($user),
            'token'          => $token,
            'email_verified' => true, // always true while verification is disabled
        ]);
    }

    /**
     * POST /api/logout
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out.']);
    }

    /**
     * GET /api/me
     */
    public function me(Request $request): JsonResponse
    {
        return response()->json(new UserResource($request->user()));
    }

    // ── DISABLED: email verification endpoints ─────────────────────
    // Uncomment these when you purchase a mail service

    /*
    public function resendVerification(Request $request): JsonResponse
    {
        if ($request->user()->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email already verified.'], 400);
        }
        $request->user()->sendEmailVerificationNotification();
        return response()->json(['message' => 'Verification email sent.']);
    }

    public function verify(Request $request, int $id, string $hash): JsonResponse
    {
        $user = User::findOrFail($id);
        if (!hash_equals(sha1($user->getEmailForVerification()), $hash)) {
            return response()->json(['message' => 'Invalid verification link.'], 403);
        }
        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email already verified.']);
        }
        $user->markEmailAsVerified();
        return response()->json(['message' => 'Email verified successfully.']);
    }
    */
}
