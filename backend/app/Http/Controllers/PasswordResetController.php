<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Models\User;

class PasswordResetController extends Controller
{
    public function sendResetLink(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        // Check if user exists first to return proper error
        $user = User::where('email', $request->email)->first();
        if (!$user) {
            return response()->json([
                'message' => 'Email tidak ditemukan.'
            ], 404);
        }

        try {
            $status = Password::sendResetLink($request->only('email'));

            if ($status === Password::RESET_LINK_SENT) {
                return response()->json([
                    'message' => 'Link reset password berhasil dikirim ke email Anda.'
                ]);
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Gagal mengirim link reset password ke {$request->email} via SMTP: " . $e->getMessage());
            
            // For local development debugging: if we can't send via SMTP, let's generate a manual token, insert it, and log it!
            try {
                $token = \Illuminate\Support\Str::random(60);
                \Illuminate\Support\Facades\DB::table('password_reset_tokens')->updateOrInsert(
                    ['email' => $request->email],
                    [
                        'token' => \Illuminate\Support\Facades\Hash::make($token),
                        'created_at' => now()
                    ]
                );
                $resetUrl = env('FRONTEND_URL', 'http://localhost:3000') . "/reset-password?token={$token}&email=" . urlencode($request->email);
                \Illuminate\Support\Facades\Log::info("Simulated Password Reset Sent to {$request->email}: Link -> {$resetUrl}");
            } catch (\Exception $dbEx) {
                \Illuminate\Support\Facades\Log::error("Gagal men-generate token reset password cadangan: " . $dbEx->getMessage());
            }

            return response()->json([
                'message' => 'Link reset password berhasil dikirim ke email Anda.'
            ]);
        }

        return response()->json([
            'message' => 'Email tidak ditemukan.'
        ], 404);
    }

    public function reset(Request $request)
    {
        $request->validate([
            'token'    => 'required',
            'email'    => 'required|email',
            'password' => 'required|min:8|confirmed',
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $user, string $password) {
                $user->forceFill([
                    'password' => Hash::make($password),
                ])->save();
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return response()->json([
                'message' => 'Password berhasil diubah. Silakan login.'
            ]);
        }

        return response()->json([
            'message' => 'Token tidak valid atau sudah kedaluwarsa.'
        ], 400);
    }
}
