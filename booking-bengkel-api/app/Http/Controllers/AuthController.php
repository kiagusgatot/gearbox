<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

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

        $user = User::create($validated)->fresh();
        
        $this->logActivity(
            null,
            'user.registered',
            "User baru terdaftar: {$user->name}",
            ['name' => $user->name],
            $user->id,
            'customer'
        );

        $token = base64_encode($user->id);

        return response()->json([
            'user' => $user,
            'token' => $token
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
}
