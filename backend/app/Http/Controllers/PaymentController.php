<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function index()
    {
        return response()->json(['data' => Payment::with('booking')->get()]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            "booking_id" => "required|exists:bookings,id",
            "amount" => "required|numeric",
            "method" => "required|in:cash,bank_transfer,credit_card,debit_card,e_wallet",
            "payment_type" => "required|in:dp,full,remainder",
            "status" => "nullable|in:pending,success,failed,refunded",
        ]);

        $item = Payment::create($validated)->fresh();
        return response()->json($item, 201);
    }

    public function show($id)
    {
        $item = Payment::findOrFail($id);
        return response()->json(['data' => $item]);
    }

    public function update(Request $request, $id)
    {
        $item = Payment::findOrFail($id);
        
        $validated = $request->validate([
            "status" => "nullable|in:pending,success,failed",
        ]);

        $item->update($validated);

        if ($item->status === 'success') {
            $booking = \App\Models\Booking::find($item->booking_id);
            if ($booking) {
                $booking->update([
                    'status' => 'completed',
                    'completed_at' => now(),
                ]);

                // Create Notification for the customer
                \App\Models\Notification::create([
                    'user_id' => $booking->user_id,
                    'type' => 'payment_success',
                    'title' => 'Pembayaran Berhasil',
                    'message' => 'Pembayaran Anda sebesar Rp ' . number_format($item->amount, 0, ',', '.') . ' untuk booking ' . $booking->booking_code . ' telah berhasil diterima. Terima kasih!',
                    'is_read' => false,
                    'action_url' => '/bookings/' . $booking->id,
                    'related_id' => $booking->id,
                ]);

                $service = \App\Models\Service::find($booking->service_id);
                
                // 1. Log payment confirmation
                $this->logActivity(
                    $booking->id,
                    'booking.payment_confirmed',
                    "Pembayaran Rp " . number_format($item->amount, 0, ',', '.') . " dikonfirmasi — " . ucwords($item->method),
                    [
                        'amount' => (float)$item->amount,
                        'method' => $item->method
                    ]
                );

                // 2. Log booking completed by system
                $this->logActivity(
                    $booking->id,
                    'booking.completed',
                    "Booking " . ($service->name ?? '') . " selesai & lunas",
                    [
                        'service_name' => $service->name ?? ''
                    ],
                    null,
                    'system'
                );
            }
        }

        return response()->json($item->fresh());
    }

    public function destroy($id)
    {
        $item = Payment::findOrFail($id);
        $item->delete();
        return response()->json(null, 204);
    }
}
