<?php

namespace App\Http\Controllers;

use App\Models\Inspection;
use Illuminate\Http\Request;

class InspectionController extends Controller
{
    public function index()
    {
        return response()->json(Inspection::all());
    }

    public function store(Request $request)
    {
        $bookingId = $request->input('booking_id');
        $booking = \App\Models\Booking::find($bookingId);

        if (!$booking) {
            return response()->json(['message' => 'Booking tidak ditemukan.'], 404);
        }

        if ($booking->status !== 'ready') {
            return response()->json(['message' => 'Status booking harus ready untuk dilakukan inspeksi.'], 422);
        }

        $validated = $request->validate([
            "booking_id" => "required|exists:bookings,id",
            "mechanic_id" => "required|exists:users,id",
            "findings" => "required|string|min:10",
            "estimated_cost" => "required|numeric|min:0",
            "estimated_duration" => "required|integer|min:1",
            "mechanic_notes" => "nullable|string",
            "items" => "nullable|array",
            "items.*.name" => "required|string",
            "items.*.qty" => "required|integer|min:1",
            "items.*.unit_price" => "required|numeric|min:0",
            "items.*.duration_minutes" => "required|integer|min:0",
            "items.*.notes" => "nullable|string"
        ]);

        if ($booking->mechanic_id !== $validated['mechanic_id']) {
            return response()->json(['message' => 'Mekanik ini tidak ditugaskan untuk booking ini.'], 422);
        }

        $inspection = \App\Models\Inspection::updateOrCreate(
            ['booking_id' => $validated['booking_id']],
            [
                'mechanic_id' => $validated['mechanic_id'],
                'findings' => $validated['findings'],
                'estimated_cost' => $validated['estimated_cost'],
                'estimated_duration' => $validated['estimated_duration'],
                'mechanic_notes' => $validated['mechanic_notes'] ?? null,
                'status' => 'pending_approval',
                'approval_status' => 'pending'
            ]
        );

        $inspection->estimationItems()->delete();

        $items = [];
        if (!empty($validated['items'])) {
            foreach ($validated['items'] as $item) {
                $createdItem = $inspection->estimationItems()->create([
                    'booking_id' => $booking->id,
                    'name' => $item['name'],
                    'qty' => $item['qty'],
                    'unit_price' => $item['unit_price'],
                    'total_price' => $item['qty'] * $item['unit_price'],
                    'duration_minutes' => $item['duration_minutes'],
                    'notes' => $item['notes'] ?? null
                ]);
                $items[] = $createdItem;
            }
        }

        $booking->update(['status' => 'inspection_done']);

        $service = \App\Models\Service::find($booking->service_id);
        $customer = \App\Models\User::find($booking->user_id);
        $this->logActivity(
            $booking->id,
            'booking.inspection_done',
            "Inspeksi selesai — " . ($service->name ?? '') . " (" . ($customer->name ?? '') . ")",
            [
                'service_name' => $service->name ?? '',
                'customer_name' => $customer->name ?? ''
            ]
        );

        return response()->json([
            'data' => [
                'id' => $inspection->id,
                'booking_id' => $inspection->booking_id,
                'findings' => $inspection->findings,
                'estimated_cost' => (float)$inspection->estimated_cost,
                'estimated_duration' => (int)$inspection->estimated_duration,
                'mechanic_notes' => $inspection->mechanic_notes,
                'approval_status' => $inspection->approval_status,
                'items' => collect($items)->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'name' => $item->name,
                        'qty' => (int)$item->qty,
                        'unit_price' => (float)$item->unit_price,
                        'total_price' => (float)$item->total_price,
                        'duration_minutes' => (int)$item->duration_minutes,
                        'notes' => $item->notes
                    ];
                })->all()
            ]
        ], 201);
    }

    public function show($id)
    {
        $item = Inspection::findOrFail($id);
        return response()->json($item);
    }

    public function update(Request $request, $id)
    {
        $item = Inspection::findOrFail($id);
        
        $validated = $request->validate([
            "status" => "nullable|in:pending,completed",
        ]);

        $item->update($validated);
        return response()->json($item->fresh());
    }

    public function destroy($id)
    {
        $item = Inspection::findOrFail($id);
        $item->delete();
        return response()->json(null, 204);
    }
}
