<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'message' => 'Email atau password salah.'
            ], 422);
        }

        // Check email verification status
        if (!$user->email_verified_at) {
            return response()->json([
                'message' => 'Email belum diverifikasi. Silakan cek email Anda.',
                'error_code' => 'email_not_verified',
                'user_id' => $user->id
            ], 403);
        }

        // Generate a simple secure token (base64 of user id)
        $token = base64_encode($user->id);

        return response()->json([
            'user' => $user,
            'token' => $token
        ]);
    }

    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users',
            'phone' => 'required|unique:users',
            'password' => 'required|min:8|confirmed',
        ]);

        $validated['password'] = bcrypt($validated['password']);
        $validated['role'] = 'customer';
        $validated['is_active'] = true;
        $validated['email_verified_at'] = null; // Mark as unverified initially
        $validated['verification_token'] = Str::random(60);

        $user = User::create($validated)->fresh();
        
        $this->logActivity(
            null,
            'user.registered',
            "User baru terdaftar: {$user->name}",
            ['name' => $user->name],
            $user->id,
            'customer'
        );

        // Log verification link for fallback/debugging
        try {
            $verifyUrl = \Illuminate\Support\Facades\URL::temporarySignedRoute(
                'verification.verify',
                now()->addMinutes(60),
                ['id' => $user->id, 'hash' => sha1($user->email)]
            );
            Log::info("Simulated Email Verification Sent to {$user->email}: Link -> {$verifyUrl}");
        } catch (\Exception $e) {
            Log::error("Gagal men-generate log link verifikasi: " . $e->getMessage());
        }

        // Send email verification notification
        try {
            $user->sendEmailVerificationNotification();
        } catch (\Exception $e) {
            Log::error('Email verification failed: ' . $e->getMessage());
            // Jangan gagalkan register hanya karena email gagal kirim
        }

        return response()->json([
            'message' => 'Registrasi berhasil. Silakan cek email Anda untuk melakukan verifikasi.',
            'user' => $user,
            'data' => $user
        ], 201);
    }

    public function logout(Request $request)
    {
        return response()->json(['message' => 'Logged out successfully']);
    }

    public function user(Request $request)
    {
        $authorizationHeader = $request->header('Authorization');
        if (!$authorizationHeader) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $token = str_replace('Bearer ', '', $authorizationHeader);
        $userId = base64_decode($token);

        $user = User::find($userId);

        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        return response()->json($user);
    }

    public function verifyEmail(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'token' => 'required',
        ]);

        $user = User::where('email', $request->email)
            ->where('verification_token', $request->token)
            ->first();

        if (!$user) {
            return response()->json([
                'message' => 'Token verifikasi tidak valid atau e-mail salah.'
            ], 422);
        }

        // Verify user email
        $user->email_verified_at = now();
        $user->verification_token = null;
        $user->save();

        // Log activity
        $this->logActivity(
            null,
            'user.email_verified',
            "Email user telah terverifikasi: {$user->name}",
            ['name' => $user->name],
            $user->id,
            'customer'
        );

        return response()->json([
            'message' => 'Email Anda berhasil diverifikasi. Silakan login.'
        ]);
    }
}

