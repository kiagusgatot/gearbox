<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    public function index()
    {
        return response()->json(Booking::with(['user', 'customer', 'vehicle', 'service', 'mechanic'])->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            "user_id" => "required|exists:users,id",
            "vehicle_id" => "required|exists:vehicles,id",
            "service_id" => "required|exists:services,id",
            "scheduled_date" => "required|date",
            "scheduled_time" => "required",
            "notes" => "nullable|string",
            "status" => "nullable|in:pending,confirmed,ready,in_progress,completed,cancelled,waiting_payment",
        ]);

        $item = Booking::create($validated);

        $user = \App\Models\User::find($item->user_id);
        $service = \App\Models\Service::find($item->service_id);
        $vehicle = \App\Models\Vehicle::find($item->vehicle_id);

        $this->logActivity(
            $item->id,
            'booking.created',
            "Booking baru dari " . ($user->name ?? 'Customer') . " — " . ($service->name ?? 'Layanan'),
            [
                'service_name' => $service->name ?? '',
                'vehicle_plate' => $vehicle->plate ?? '',
                'scheduled_date' => $item->scheduled_date ? $item->scheduled_date->toDateString() : ''
            ]
        );

        return response()->json($item->load(['user', 'customer', 'vehicle', 'service', 'mechanic']), 201);
    }

    public function show($id)
    {
        $item = Booking::with(['user', 'customer', 'vehicle', 'service', 'mechanic'])->findOrFail($id);
        return response()->json($item);
    }

    public function update(Request $request, $id)
    {
        $item = Booking::findOrFail($id);
        $oldStatus = $item->status;
        $oldMechanicId = $item->mechanic_id;
        
        $validated = $request->validate([
            "scheduled_date" => "nullable|date",
            "scheduled_time" => "nullable",
            "status" => "nullable|in:pending,confirmed,ready,in_progress,completed,cancelled,waiting_payment",
            "notes" => "nullable|string",
            "mechanic_id" => "nullable|exists:users,id",
        ]);

        $item->update($validated);

        // Fetch refreshed associations
        $service = \App\Models\Service::find($item->service_id);
        
        // 1. Mechanic assignment check
        if ($request->has('mechanic_id') && $validated['mechanic_id'] && $validated['mechanic_id'] !== $oldMechanicId) {
            $mechanic = \App\Models\User::find($validated['mechanic_id']);
            $this->logActivity(
                $item->id,
                'booking.assigned',
                "Admin assign " . ($mechanic->name ?? 'Mekanik') . " ke booking " . ($service->name ?? 'Layanan'),
                [
                    'mechanic_name' => $mechanic->name ?? '',
                    'service_name' => $service->name ?? ''
                ]
            );
        }

        // 2. Status transitions check
        if ($request->has('status') && $validated['status'] && $validated['status'] !== $oldStatus) {
            $newStatus = $validated['status'];
            $mechanic = \App\Models\User::find($item->mechanic_id);
            
            if ($oldStatus === 'confirmed' && $newStatus === 'ready') {
                // Mechanic accepted
                $this->logActivity(
                    $item->id,
                    'booking.accepted',
                    "Mekanik " . ($mechanic->name ?? 'Mekanik') . " menerima job " . ($service->name ?? 'Layanan'),
                    [
                        'mechanic_name' => $mechanic->name ?? '',
                        'service_name' => $service->name ?? ''
                    ]
                );
            } elseif ($oldStatus === 'confirmed' && $newStatus === 'cancelled') {
                // Mechanic rejected
                $this->logActivity(
                    $item->id,
                    'booking.rejected',
                    "Mekanik " . ($mechanic->name ?? 'Mekanik') . " menolak job " . ($service->name ?? 'Layanan'),
                    [
                        'mechanic_name' => $mechanic->name ?? '',
                        'service_name' => $service->name ?? ''
                    ]
                );
            } elseif ($newStatus === 'cancelled') {
                // General cancellation
                $actor = $this->getAuthenticatedUser();
                $actorRoleName = $actor ? $actor->role : 'system';
                $this->logActivity(
                    $item->id,
                    'booking.cancelled',
                    "Booking " . ($service->name ?? 'Layanan') . " dibatalkan oleh " . $actorRoleName,
                    [
                        'service_name' => $service->name ?? '',
                        'actor' => $actor ? $actor->name : 'System'
                    ]
                );
            }
        }

        return response()->json($item->load(['user', 'customer', 'vehicle', 'service', 'mechanic']));
    }

    public function destroy($id)
    {
        $item = Booking::findOrFail($id);
        $item->delete();
        return response()->json(null, 204);
    }

    public function invoice($id)
    {
        $booking = Booking::with(['user', 'customer', 'vehicle', 'service', 'mechanic', 'inspection', 'payments'])->findOrFail($id);
        
        $service = $booking->service;
        $basePrice = $service ? $service->base_price : 0;
        $inspectionCost = $booking->inspection ? $booking->inspection->estimated_cost : 0;
        $totalCost = $inspectionCost > 0 ? $inspectionCost : $basePrice;
        
        $totalPaid = $booking->payments()->where('status', 'success')->sum('amount');
        $remaining = $totalCost - $totalPaid;
        
        $paymentStatus = 'unpaid';
        if ($totalPaid >= $totalCost) {
            $paymentStatus = 'paid';
        } elseif ($totalPaid > 0) {
            $paymentStatus = 'partially_paid';
        }

        return response()->json([
            'booking_id' => $booking->id,
            'service_name' => $service ? $service->name : null,
            'base_price' => (float) $basePrice,
            'inspection_cost' => (float) $inspectionCost,
            'total_cost' => (float) $totalCost,
            'total_paid' => (float) $totalPaid,
            'remaining_balance' => (float) max(0, $remaining),
            'payment_status' => $paymentStatus,
            'payments' => $booking->payments,
        ]);
    }

    public function documentation($id)
    {
        $booking = Booking::with(['inspection.photos'])->findOrFail($id);
        
        $inspection = $booking->inspection;
        
        return response()->json([
            'booking_id' => $booking->id,
            'completed_at' => $booking->completed_at,
            'findings' => $inspection ? $inspection->findings : null,
            'photos' => $inspection ? $inspection->photos : [],
        ]);
    }

    public function details($id)
    {
        $booking = Booking::with(['user', 'customer', 'vehicle', 'service', 'mechanic', 'inspection.photos', 'payments'])->findOrFail($id);
        
        $service = $booking->service;
        $basePrice = $service ? $service->base_price : 0;
        $inspectionCost = $booking->inspection ? $booking->inspection->estimated_cost : 0;
        $totalCost = $inspectionCost > 0 ? $inspectionCost : $basePrice;
        
        $totalPaid = $booking->payments()->where('status', 'success')->sum('amount');
        $remaining = $totalCost - $totalPaid;
        
        $paymentStatus = 'unpaid';
        if ($totalPaid >= $totalCost) {
            $paymentStatus = 'paid';
        } elseif ($totalPaid > 0) {
            $paymentStatus = 'partially_paid';
        }

        return response()->json([
            'booking' => $booking,
            'invoice' => [
                'base_price' => (float) $basePrice,
                'inspection_cost' => (float) $inspectionCost,
                'total_cost' => (float) $totalCost,
                'total_paid' => (float) $totalPaid,
                'remaining_balance' => (float) max(0, $remaining),
                'payment_status' => $paymentStatus,
            ],
            'documentation' => [
                'findings' => $booking->inspection ? $booking->inspection->findings : null,
                'photos' => $booking->inspection ? $booking->inspection->photos : [],
                'completed_at' => $booking->completed_at,
            ]
        ]);
    }

    public function sendEstimation(Request $request, $id)
    {
        $booking = Booking::with('inspection')->findOrFail($id);

        if ($booking->status !== 'inspection_done') {
            return response()->json(['message' => 'Status booking harus inspection_done untuk mengirim estimasi.'], 422);
        }

        $validated = $request->validate([
            'admin_notes' => 'nullable|string'
        ]);

        $inspection = $booking->inspection;
        if (!$inspection) {
            return response()->json(['message' => 'Inspeksi tidak ditemukan untuk booking ini.'], 404);
        }

        $inspection->update([
            'admin_notes' => $validated['admin_notes'] ?? null,
            'approval_status' => 'sent',
            'sent_at' => now()
        ]);

        $booking->update(['status' => 'estimation_sent']);

        $customer = \App\Models\User::find($booking->user_id);
        $amount = (float)($inspection->estimated_cost ?? 0);
        $this->logActivity(
            $booking->id,
            'booking.estimation_sent',
            "Estimasi dikirim ke " . ($customer->name ?? 'Customer') . " — Rp " . number_format($amount, 0, ',', '.'),
            [
                'customer_name' => $customer->name ?? '',
                'amount' => $amount
            ]
        );

        return response()->json([
            'data' => [
                'id' => $booking->id,
                'status' => $booking->status,
                'inspection' => [
                    'approval_status' => $inspection->approval_status,
                    'sent_at' => $inspection->sent_at ? $inspection->sent_at->toIso8601String() : null,
                    'admin_notes' => $inspection->admin_notes
                ]
            ],
            'message' => 'Estimasi berhasil dikirim ke customer'
        ]);
    }

    public function startService(Request $request, $id)
    {
        $booking = Booking::with('inspection')->findOrFail($id);

        $skipEstimation = $request->input('skip_estimation', false);

        if ($skipEstimation) {
            if ($booking->status !== 'inspection_done') {
                return response()->json(['message' => 'Status booking harus inspection_done untuk skip estimasi.'], 422);
            }
            
            $inspection = $booking->inspection;
            if ($inspection) {
                $inspection->update([
                    'approval_status' => 'approved',
                    'approved_at' => now(),
                    'admin_notes' => $request->input('admin_notes', $inspection->admin_notes)
                ]);
            }
        } else {
            if ($booking->status !== 'customer_approved') {
                return response()->json(['message' => 'Status booking harus customer_approved untuk memulai service.'], 422);
            }
        }

        $booking->update(['status' => 'service_started']);

        $mechanic = \App\Models\User::find($booking->mechanic_id);
        $this->logActivity(
            $booking->id,
            'booking.service_started',
            "Perintah mulai service dikirim ke " . ($mechanic->name ?? 'Mekanik'),
            [
                'mechanic_name' => $mechanic->name ?? ''
            ]
        );

        return response()->json([
            'data' => [
                'id' => $booking->id,
                'status' => $booking->status
            ],
            'message' => 'Perintah mulai service berhasil dikirim ke mekanik'
        ]);
    }

    public function getEstimation($id)
    {
        $booking = Booking::with(['inspection.estimationItems', 'service'])->findOrFail($id);

        $service = $booking->service;
        $inspection = $booking->inspection;

        if (!$inspection) {
            return response()->json(['message' => 'Estimasi belum siap atau inspeksi belum dilakukan.'], 404);
        }

        $serviceBasePrice = $service ? (float)$service->base_price : 0.0;
        $items = $inspection->estimationItems;
        $additionalItemsPrice = (float)$items->sum('total_price');
        $totalCost = $serviceBasePrice + $additionalItemsPrice;
        
        $serviceDuration = $service ? (int)$service->estimated_duration : 0;
        $additionalDuration = (int)$items->sum('duration_minutes');
        $totalDuration = $serviceDuration + $additionalDuration;

        return response()->json([
            'data' => [
                'booking_id' => $booking->id,
                'service_name' => $service ? $service->name : null,
                'service_base_price' => $serviceBasePrice,
                'inspection' => [
                    'findings' => $inspection->findings,
                    'mechanic_notes' => $inspection->mechanic_notes,
                    'admin_notes' => $inspection->admin_notes,
                    'estimated_cost' => (float)$inspection->estimated_cost,
                    'estimated_duration' => (int)$inspection->estimated_duration,
                    'sent_at' => $inspection->sent_at ? $inspection->sent_at->toIso8601String() : null
                ],
                'items' => $items->map(function ($item) {
                    return [
                        'name' => $item->name,
                        'qty' => (int)$item->qty,
                        'unit_price' => (float)$item->unit_price,
                        'total_price' => (float)$item->total_price,
                        'duration_minutes' => (int)$item->duration_minutes
                    ];
                })->all(),
                'summary' => [
                    'service_price' => $serviceBasePrice,
                    'additional_items_price' => $additionalItemsPrice,
                    'total_cost' => $totalCost,
                    'total_duration' => $totalDuration
                ]
            ]
        ]);
    }

    public function approveEstimation(Request $request, $id)
    {
        $booking = Booking::with('inspection')->findOrFail($id);

        if ($booking->status !== 'estimation_sent') {
            return response()->json(['message' => 'Status booking harus estimation_sent untuk memberikan persetujuan.'], 422);
        }

        $validated = $request->validate([
            'action' => 'required|in:approve,reject'
        ]);

        $inspection = $booking->inspection;
        if (!$inspection) {
            return response()->json(['message' => 'Inspeksi tidak ditemukan.'], 404);
        }

        if ($validated['action'] === 'approve') {
            $inspection->update([
                'approval_status' => 'approved',
                'approved_at' => now(),
                'approved_by' => auth()->id() ?? $booking->user_id
            ]);

            $booking->update(['status' => 'customer_approved']);

            $customer = \App\Models\User::find($booking->user_id);
            $this->logActivity(
                $booking->id,
                'booking.estimation_approved',
                "Customer " . ($customer->name ?? 'Customer') . " menyetujui estimasi",
                [
                    'customer_name' => $customer->name ?? ''
                ]
            );

            return response()->json([
                'data' => [
                    'id' => $booking->id,
                    'status' => $booking->status
                ],
                'message' => 'Estimasi disetujui. Menunggu admin memulai service.'
            ]);
        } else {
            $inspection->update([
                'approval_status' => 'rejected'
            ]);

            $booking->update(['status' => 'cancelled']);

            $customer = \App\Models\User::find($booking->user_id);
            $this->logActivity(
                $booking->id,
                'booking.estimation_rejected',
                "Customer " . ($customer->name ?? 'Customer') . " menolak estimasi",
                [
                    'customer_name' => $customer->name ?? ''
                ]
            );

            return response()->json([
                'data' => [
                    'id' => $booking->id,
                    'status' => $booking->status
                ],
                'message' => 'Estimasi ditolak. Booking dibatalkan.'
            ]);
        }
    }

    public function confirmStart($id)
    {
        $booking = Booking::with(['service', 'inspection.estimationItems'])->findOrFail($id);

        if ($booking->status !== 'service_started') {
            return response()->json(['message' => 'Status booking harus service_started untuk memulai pekerjaan.'], 422);
        }

        $booking->update(['status' => 'in_progress']);

        $mechanic = \App\Models\User::find($booking->mechanic_id);
        $service = \App\Models\Service::find($booking->service_id);
        $this->logActivity(
            $booking->id,
            'booking.service_confirmed',
            "Mekanik " . ($mechanic->name ?? 'Mekanik') . " mulai mengerjakan " . ($service->name ?? 'Layanan'),
            [
                'mechanic_name' => $mechanic->name ?? '',
                'service_name' => $service->name ?? ''
            ]
        );

        $booking->serviceChecklistItems()->delete();

        $serviceName = $booking->service ? $booking->service->name : '';
        $checklistNames = [];

        if (stripos($serviceName, 'Oli') !== false) {
            $checklistNames = [
                'Drain oli lama',
                'Ganti filter oli',
                'Isi oli baru',
                'Cek level oli',
                'Test engine'
            ];
        } elseif (stripos($serviceName, 'Tune') !== false) {
            $checklistNames = [
                'Cek busi',
                'Cek filter udara',
                'Cek filter bensin',
                'Setting karburator/injeksi',
                'Test drive'
            ];
        } elseif (stripos($serviceName, 'Umum') !== false) {
            $checklistNames = [
                'Cek oli mesin',
                'Cek air radiator',
                'Cek minyak rem',
                'Cek tekanan ban',
                'Cek kelistrikan',
                'Cek AC',
                'Test drive'
            ];
        } elseif (stripos($serviceName, 'Listrik') !== false || stripos($serviceName, 'Kelistrikan') !== false) {
            $checklistNames = [
                'Cek aki/baterai',
                'Cek alternator',
                'Cek kabel-kabel',
                'Cek lampu',
                'Cek klakson',
                'Test kelistrikan'
            ];
        } else {
            $checklistNames = [
                'Pemeriksaan umum',
                'Perbaikan keluhan',
                'Test drive'
            ];
        }

        $displayOrder = 1;
        $createdChecklists = [];

        foreach ($checklistNames as $name) {
            $createdChecklists[] = $booking->serviceChecklistItems()->create([
                'mechanic_id' => $booking->mechanic_id ?? auth()->id(),
                'item_name' => $name,
                'is_completed' => false,
                'display_order' => $displayOrder++
            ]);
        }

        $inspection = $booking->inspection;
        if ($inspection && $inspection->approval_status === 'approved') {
            $items = $inspection->estimationItems;
            foreach ($items as $item) {
                $createdChecklists[] = $booking->serviceChecklistItems()->create([
                    'mechanic_id' => $booking->mechanic_id ?? auth()->id(),
                    'item_name' => $item->name . ' (tambahan)',
                    'is_completed' => false,
                    'display_order' => $displayOrder++
                ]);
            }
        }

        return response()->json([
            'data' => [
                'id' => $booking->id,
                'status' => $booking->status,
                'checklist' => collect($createdChecklists)->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'item_name' => $item->item_name,
                        'is_completed' => (bool)$item->is_completed
                    ];
                })->all()
            ],
            'message' => 'Service dimulai. Selesaikan semua checklist.'
        ]);
    }

    public function getChecklist($id)
    {
        $booking = Booking::with('serviceChecklistItems')->findOrFail($id);
        $items = $booking->serviceChecklistItems;
        
        $total = $items->count();
        $completed = $items->where('is_completed', true)->count();
        
        return response()->json([
            'data' => $items->map(function ($item) {
                return [
                    'id' => $item->id,
                    'item_name' => $item->item_name,
                    'is_completed' => (bool)$item->is_completed,
                    'completed_at' => $item->completed_at ? $item->completed_at->toIso8601String() : null
                ];
            })->all(),
            'total_items' => $total,
            'completed_items' => $completed,
            'all_completed' => $total > 0 && $total === $completed
        ]);
    }

    public function toggleChecklistItem(Request $request, $bookingId, $itemId)
    {
        $booking = Booking::findOrFail($bookingId);
        $item = \App\Models\ServiceChecklistItem::where('booking_id', $bookingId)->findOrFail($itemId);

        $validated = $request->validate([
            'is_completed' => 'required|boolean'
        ]);

        $item->update([
            'is_completed' => $validated['is_completed'],
            'completed_at' => $validated['is_completed'] ? now() : null
        ]);

        return response()->json([
            'data' => [
                'id' => $item->id,
                'item_name' => $item->item_name,
                'is_completed' => (bool)$item->is_completed,
                'completed_at' => $item->completed_at ? $item->completed_at->toIso8601String() : null
            ]
        ]);
    }

    public function completeService($id)
    {
        $booking = Booking::with(['serviceChecklistItems', 'service'])->findOrFail($id);

        if ($booking->status !== 'in_progress') {
            return response()->json(['message' => 'Status booking harus in_progress untuk diselesaikan.'], 422);
        }

        $items = $booking->serviceChecklistItems;
        $total = $items->count();
        $completed = $items->where('is_completed', true)->count();

        if ($total > 0 && $total !== $completed) {
            $remaining = $items->where('is_completed', false)->map(function ($item) {
                return [
                    'id' => $item->id,
                    'item_name' => $item->item_name
                ];
            })->values()->all();

            return response()->json([
                'error' => 'Tidak bisa menandai selesai. Masih ada ' . ($total - $completed) . ' item checklist yang belum selesai.',
                'remaining_items' => $remaining
            ], 422);
        }

        $booking->update(['status' => 'waiting_payment']);

        $service = \App\Models\Service::find($booking->service_id);
        $customer = \App\Models\User::find($booking->user_id);
        $this->logActivity(
            $booking->id,
            'booking.service_completed',
            "Service selesai — " . ($service->name ?? 'Layanan') . " (" . ($customer->name ?? 'Customer') . ")",
            [
                'service_name' => $service->name ?? '',
                'customer_name' => $customer->name ?? ''
            ]
        );

        return response()->json([
            'data' => [
                'id' => $booking->id,
                'status' => $booking->status
            ],
            'message' => 'Service selesai. Menunggu pembayaran di kasir.'
        ]);
    }
}
