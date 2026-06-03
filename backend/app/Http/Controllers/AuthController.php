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
                'message' => 'Email Anda belum diverifikasi. Silakan cek email Anda.'
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
            'email' => 'required|email|unique:users,email',
            'phone' => 'required|string|unique:users,phone',
            'password' => 'required|min:6',
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

        // Send simulated verification email by writing to log
        $verificationUrl = "http://localhost:5173/verify-email?token={$user->verification_token}&email=" . urlencode($user->email);
        Log::info("Simulated Email Verification Sent to {$user->email}: Link -> {$verificationUrl}");

        return response()->json([
            'message' => 'Registrasi berhasil. Silakan cek email Anda untuk melakukan verifikasi.',
            'user' => $user
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

    public function forgotPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
        ], [
            'email.exists' => 'Email tidak terdaftar dalam sistem.'
        ]);

        $token = Str::random(60);

        // Insert or update token in password_reset_tokens
        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $request->email],
            [
                'token' => Hash::make($token),
                'created_at' => now()
            ]
        );

        // Send simulated password reset link by writing to log
        $resetUrl = "http://localhost:5173/reset-password?token={$token}&email=" . urlencode($request->email);
        Log::info("Simulated Password Reset Sent to {$request->email}: Link -> {$resetUrl}");

        return response()->json([
            'message' => 'Link reset password telah dikirim ke email Anda.'
        ]);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'token' => 'required',
            'password' => 'required|min:6|confirmed',
        ], [
            'password.confirmed' => 'Konfirmasi password tidak cocok.'
        ]);

        $resetRecord = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        if (!$resetRecord || !Hash::check($request->token, $resetRecord->token)) {
            return response()->json([
                'message' => 'Token reset password tidak valid atau kedaluwarsa.'
            ], 422);
        }

        // Update user's password
        $user = User::where('email', $request->email)->first();
        $user->password = bcrypt($request->password);
        $user->save();

        // Delete token
        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        return response()->json([
            'message' => 'Password Anda berhasil diubah. Silakan login kembali.'
        ]);
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

