<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Auth\Events\Verified;

class VerificationController extends Controller
{
    public function verify($id, $hash)
    {
        $user = User::findOrFail($id);

        if (!hash_equals(sha1($user->getEmailForVerification()), $hash)) {
            return response()->json(['message' => 'Link verifikasi tidak valid.'], 403);
        }

        if ($user->hasVerifiedEmail()) {
            // Redirect ke frontend success page
            return redirect(env('FRONTEND_URL', 'http://localhost:3000') . '/email-verified?already=true');
        }

        $user->markEmailAsVerified();
        event(new Verified($user));

        // Redirect ke frontend success page
        return redirect(env('FRONTEND_URL', 'http://localhost:3000') . '/email-verified');
    }

    public function resend(Request $request)
    {
        // For unauthenticated resend request (like from /verify-email where the user isn't logged in),
        // we can support sending with an email parameter or require authentication.
        // The frontend spec says: /verify-email has a resend button, and we passed email in query.
        // Let's support both: authenticated user or by email query/body parameter!
        $user = null;
        if ($request->user()) {
            $user = $request->user();
        } elseif ($request->has('email')) {
            $user = User::where('email', $request->input('email'))->first();
        }

        if (!$user) {
            return response()->json(['message' => 'User tidak ditemukan.'], 404);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email sudah terverifikasi.'], 400);
        }

        // Log verification link for fallback/debugging
        try {
            $verifyUrl = \Illuminate\Support\Facades\URL::temporarySignedRoute(
                'verification.verify',
                now()->addMinutes(60),
                ['id' => $user->id, 'hash' => sha1($user->email)]
            );
            \Illuminate\Support\Facades\Log::info("Simulated Email Verification Sent to {$user->email}: Link -> {$verifyUrl}");
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Gagal men-generate log link verifikasi: " . $e->getMessage());
        }

        try {
            $user->sendEmailVerificationNotification();
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Gagal mengirim email verifikasi ke {$user->email} via SMTP: " . $e->getMessage());
        }

        return response()->json(['message' => 'Link verifikasi berhasil dikirim ulang.']);
    }
}
