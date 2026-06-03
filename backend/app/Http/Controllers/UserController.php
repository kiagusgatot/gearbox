<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class UserController extends Controller
{
    public function index()
    {
        return response()->json(['data' => User::all()]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            "email" => "required|email|unique:users,email",
            "password" => "required|min:6",
            "name" => "required|string",
            "phone" => "nullable|string|unique:users,phone",
            "role" => "required|in:customer,admin,mechanic",
        ]);

        $validated["password"] = bcrypt($validated["password"]);
        
        $item = User::create($validated)->fresh();
        return response()->json($item, 201);
    }

    public function show($id)
    {
        $item = User::findOrFail($id);
        return response()->json(['data' => $item]);
    }

    public function update(Request $request, $id)
    {
        $item = User::findOrFail($id);
        
        $validated = $request->validate([
            "email" => "nullable|email|unique:users,email," . $id,
            "password" => "nullable|min:6",
            "name" => "nullable|string",
            "phone" => "nullable|string|unique:users,phone," . $id,
            "role" => "nullable|in:customer,admin,mechanic",
        ]);

        if (isset($validated["password"])) {
            $validated["password"] = bcrypt($validated["password"]);
        }

        $item->update($validated);
        return response()->json($item->fresh());
    }

    public function destroy($id)
    {
        $item = User::findOrFail($id);
        $item->delete();
        return response()->json(null, 204);
    }
}
