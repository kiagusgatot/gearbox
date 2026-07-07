<?php

namespace App\Http\Controllers;

use App\Models\Review;
use App\Models\Booking;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function index()
    {
        $reviews = Review::with(['customer', 'booking.service', 'mechanic'])->get()->map(function ($r) {
            return [
                'id' => $r->id,
                'booking_id' => $r->booking_id,
                'service_id' => $r->booking->service_id ?? null,
                'user_id' => $r->user_id,
                'user_name' => $r->customer->name ?? 'Anonymous',
                'rating' => (int)$r->rating,
                'comment' => $r->comment,
                'created_at' => $r->created_at->toIso8601String()
            ];
        });
        return response()->json(['data' => $reviews]);
    }

    public function store(Request $request)
    {
        $bookingId = $request->input('booking_id');
        
        if (!$bookingId) {
            return response()->json(['message' => 'booking_id is required.'], 422);
        }

        $booking = Booking::find($bookingId);

        if (!$booking) {
            return response()->json(['message' => 'Booking tidak ditemukan.'], 422);
        }

        // Validate booking status is completed
        if ($booking->status !== 'completed') {
            return response()->json(['message' => 'Review hanya dapat dibuat jika status booking sudah Selesai (completed).'], 422);
        }

        // 1 booking = max 1 review
        $exists = Review::where('booking_id', $bookingId)->exists();
        if ($exists) {
            return response()->json(['message' => 'Booking ini sudah diberikan review.'], 422);
        }

        // Merge properties from booking to request for absolute consistency
        $request->merge([
            'user_id' => $booking->user_id,
            'mechanic_id' => $booking->mechanic_id
        ]);

        $validated = $request->validate([
            "booking_id" => "required|exists:bookings,id",
            "user_id" => "required|exists:users,id",
            "mechanic_id" => "nullable|exists:users,id",
            "rating" => "required|integer|min:1|max:5",
            "comment" => "nullable|string|min:10|max:500",
        ]);

        $item = Review::create($validated)->fresh();
        
        $customer = \App\Models\User::find($item->user_id);
        $this->logActivity(
            $item->booking_id,
            'review.created',
            "Review baru dari " . ($customer->name ?? 'Customer') . " — {$item->rating} bintang",
            [
                'customer_name' => $customer->name ?? 'Customer',
                'rating' => (int)$item->rating
            ]
        );

        return response()->json([
            'data' => [
                'id' => $item->id,
                'booking_id' => $item->booking_id,
                'service_id' => $item->booking->service_id ?? null,
                'user_id' => $item->user_id,
                'rating' => (int)$item->rating,
                'comment' => $item->comment,
                'created_at' => $item->created_at->toIso8601String()
            ]
        ], 201);
    }

    public function show($id)
    {
        $r = Review::with('booking')->findOrFail($id);
        return response()->json([
            'data' => [
                'id' => $r->id,
                'booking_id' => $r->booking_id,
                'service_id' => $r->booking->service_id ?? null,
                'user_id' => $r->user_id,
                'user_name' => $r->customer->name ?? 'Anonymous',
                'rating' => (int)$r->rating,
                'comment' => $r->comment,
                'created_at' => $r->created_at->toIso8601String()
            ]
        ]);
    }

    public function update(Request $request, $id)
    {
        $item = Review::with('booking')->findOrFail($id);
        
        $validated = $request->validate([
            "rating" => "nullable|integer|min:1|max:5",
            "comment" => "nullable|string|min:10|max:500",
        ]);

        $item->update($validated);
        return response()->json([
            'data' => [
                'id' => $item->id,
                'booking_id' => $item->booking_id,
                'service_id' => $item->booking->service_id ?? null,
                'user_id' => $item->user_id,
                'rating' => (int)$item->rating,
                'comment' => $item->comment,
                'created_at' => $item->created_at->toIso8601String()
            ]
        ]);
    }

    public function destroy($id)
    {
        $item = Review::findOrFail($id);
        $item->delete();
        return response()->json(null, 204);
    }
}
