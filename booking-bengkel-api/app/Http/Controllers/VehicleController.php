<?php

namespace App\Http\Controllers;

use App\Models\Vehicle;
use Illuminate\Http\Request;

class VehicleController extends Controller
{
    public function index()
    {
        return response()->json(Vehicle::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            "user_id" => "required|exists:users,id",
            "brand" => "required|string",
            "model" => "required|string",
            "plate" => "required|string|unique:vehicles,plate",
            "year" => "required|integer",
            "engine_type" => "required|in:manual,automatic",
            "color" => "nullable|string",
        ]);

        $item = Vehicle::create($validated)->fresh();
        return response()->json($item, 201);
    }

    public function show($id)
    {
        $item = Vehicle::findOrFail($id);
        return response()->json($item);
    }

    public function update(Request $request, $id)
    {
        $item = Vehicle::findOrFail($id);
        
        $validated = $request->validate([
            "user_id" => "nullable|exists:users,id",
            "brand" => "nullable|string",
            "model" => "nullable|string",
            "plate" => "nullable|string|unique:vehicles,plate," . $id,
            "year" => "nullable|integer",
            "engine_type" => "nullable|in:manual,automatic",
            "color" => "nullable|string",
        ]);

        $item->update($validated);
        return response()->json($item->fresh());
    }

    public function destroy($id)
    {
        $item = Vehicle::findOrFail($id);
        $item->delete();
        return response()->json(null, 204);
    }
}
