<?php

namespace App\Http\Controllers;

use App\Models\Vehicle;
use App\Models\Booking;
use Illuminate\Http\Request;

class VehicleController extends Controller
{
    public function index()
    {
        $authUser = $this->getAuthenticatedUser();
        if ($authUser) {
            if ($authUser->isAdmin()) {
                $vehicles = Vehicle::all();
            } else {
                $vehicles = Vehicle::where('user_id', $authUser->id)->get();
            }
        } else {
            $vehicles = Vehicle::all();
        }
        return response()->json(['data' => $vehicles]);
    }

    public function store(Request $request)
    {
        $authUser = $this->getAuthenticatedUser();
        if ($authUser && !$authUser->isAdmin()) {
            $request->merge(['user_id' => $authUser->id]);
        }

        $validated = $request->validate([
            "user_id" => "required|exists:users,id",
            "brand" => "required|string|max:100",
            "model" => "required|string|max:100",
            "plate" => "required|string|max:20|unique:vehicles,plate",
            "year" => "required|integer|min:1990|max:" . date('Y'),
            "engine_type" => "nullable|in:manual,automatic",
            "color" => "nullable|string|max:50",
            "transmission" => "nullable|in:manual,automatic",
            "fuel_type" => "nullable|in:bensin,diesel,electric,hybrid",
        ]);

        if (empty($validated['transmission']) && !empty($validated['engine_type'])) {
            $validated['transmission'] = $validated['engine_type'];
        }
        if (empty($validated['engine_type']) && !empty($validated['transmission'])) {
            $validated['engine_type'] = $validated['transmission'];
        }

        $item = Vehicle::create($validated)->fresh();
        return response()->json(['data' => $item], 201);
    }

    public function show($id)
    {
        $item = Vehicle::findOrFail($id);
        
        $authUser = $this->getAuthenticatedUser();
        if ($authUser && !$authUser->isAdmin() && $item->user_id !== $authUser->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return response()->json(['data' => $item]);
    }

    public function update(Request $request, $id)
    {
        $item = Vehicle::findOrFail($id);
        
        $authUser = $this->getAuthenticatedUser();
        if (!$authUser) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }
        if ($item->user_id !== $authUser->id && !$authUser->isAdmin()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        
        $validated = $request->validate([
            "brand" => "required|string|max:100",
            "model" => "required|string|max:100",
            "year" => "nullable|integer|min:1990|max:" . date('Y'),
            "color" => "nullable|string|max:50",
            "plate" => "required|string|max:20|unique:vehicles,plate," . $id,
            "transmission" => "nullable|in:manual,automatic",
            "fuel_type" => "nullable|in:bensin,diesel,electric,hybrid",
        ]);

        if (empty($validated['transmission']) && !empty($request->engine_type)) {
            $validated['transmission'] = $request->engine_type;
        }
        // Always sync engine_type
        if (!empty($validated['transmission'])) {
            $validated['engine_type'] = $validated['transmission'];
        }

        $item->update($validated);
        return response()->json(['data' => $item->fresh()]);
    }

    public function destroy($id)
    {
        $item = Vehicle::findOrFail($id);

        $authUser = $this->getAuthenticatedUser();
        if (!$authUser) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }
        if ($item->user_id !== $authUser->id && !$authUser->isAdmin()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        // Check active bookings (status is NOT completed and NOT cancelled)
        $activeBookings = Booking::where('vehicle_id', $id)
            ->whereNotIn('status', ['completed', 'cancelled'])
            ->exists();

        if ($activeBookings) {
            return response()->json([
                'error' => 'Tidak bisa menghapus. Kendaraan ini memiliki booking aktif.',
                'message' => 'Tidak bisa menghapus. Kendaraan ini memiliki booking aktif.'
            ], 422);
        }

        $item->delete();
        return response()->json(['message' => 'Kendaraan berhasil dihapus']);
    }
}
