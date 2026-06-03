<?php

namespace App\Http\Controllers;

use App\Models\Service;
use App\Models\Review;
use App\Models\Booking;
use Illuminate\Http\Request;
use Carbon\Carbon;

class ServiceController extends Controller
{
    public function index()
    {
        $services = Service::all()->map(function ($s) {
            $ratingInfo = Review::where('service_id', $s->id)
                ->selectRaw('AVG(rating) as avg_rating, COUNT(*) as count')
                ->first();
                
            return [
                'id' => $s->id,
                'name' => $s->name,
                'description' => $s->description,
                'category' => $s->category,
                'labor_price' => (float)$s->labor_price,
                'parts_price' => (float)$s->parts_price,
                'base_price' => (float)($s->labor_price + $s->parts_price),
                'estimated_duration' => (int)$s->estimated_duration,
                'max_booking_per_day' => (int)$s->max_booking_per_day,
                'rating' => $ratingInfo ? round((float)$ratingInfo->avg_rating, 1) : 0.0,
                'review_count' => $ratingInfo ? (int)$ratingInfo->count : 0,
                'terms_conditions' => $s->terms_conditions,
                'is_active' => (bool)$s->is_active,
                'image_url' => $s->image_url
            ];
        });

        return response()->json(['data' => $services]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            "name" => "required|string",
            "description" => "nullable|string",
            "labor_price" => "nullable|numeric",
            "parts_price" => "nullable|numeric",
            "max_booking_per_day" => "nullable|integer",
            "terms_conditions" => "nullable|string",
            "estimated_duration" => "required|integer",
            "category" => "required|in:routine,maintenance,repair,parts,other",
            "is_active" => "nullable|boolean",
            "image_url" => "nullable|string|max:500",
        ]);

        $labor = $request->input('labor_price', 0);
        $parts = $request->input('parts_price', 0);
        $validated['base_price'] = $labor + $parts;

        $item = Service::create($validated)->fresh();
        
        $this->logActivity(
            null,
            'service.created',
            "Layanan baru ditambahkan: {$item->name}",
            ['service' => $item->name]
        );

        return response()->json($item, 201);
    }

    public function show($id)
    {
        $s = Service::findOrFail($id);
        
        $ratingInfo = Review::where('service_id', $s->id)
            ->selectRaw('AVG(rating) as avg_rating, COUNT(*) as count')
            ->first();
            
        $recentReviews = Review::where('service_id', $s->id)
            ->with('customer')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($r) {
                return [
                    'id' => $r->id,
                    'user_id' => $r->user_id,
                    'user_name' => $r->customer->name ?? 'Anonymous',
                    'rating' => (int)$r->rating,
                    'comment' => $r->comment,
                    'created_at' => $r->created_at->toIso8601String()
                ];
            });

        return response()->json([
            'data' => [
                'id' => $s->id,
                'name' => $s->name,
                'description' => $s->description,
                'category' => $s->category,
                'labor_price' => (float)$s->labor_price,
                'parts_price' => (float)$s->parts_price,
                'base_price' => (float)($s->labor_price + $s->parts_price),
                'estimated_duration' => (int)$s->estimated_duration,
                'max_booking_per_day' => (int)$s->max_booking_per_day,
                'rating' => $ratingInfo ? round((float)$ratingInfo->avg_rating, 1) : 0.0,
                'review_count' => $ratingInfo ? (int)$ratingInfo->count : 0,
                'terms_conditions' => $s->terms_conditions,
                'is_active' => (bool)$s->is_active,
                'image_url' => $s->image_url,
                'reviews' => $recentReviews
            ]
        ]);
    }

    public function update(Request $request, $id)
    {
        $item = Service::findOrFail($id);
        
        $validated = $request->validate([
            "name" => "nullable|string",
            "description" => "nullable|string",
            "labor_price" => "nullable|numeric",
            "parts_price" => "nullable|numeric",
            "max_booking_per_day" => "nullable|integer",
            "terms_conditions" => "nullable|string",
            "estimated_duration" => "nullable|integer",
            "category" => "nullable|in:routine,maintenance,repair,parts,other",
            "is_active" => "nullable|boolean",
            "image_url" => "nullable|string|max:500",
        ]);

        $item->update($validated);

        // Sync base_price if either labor or parts price is updated
        if ($request->has('labor_price') || $request->has('parts_price')) {
            $item->update([
                'base_price' => $item->labor_price + $item->parts_price
            ]);
        }

        return response()->json($item->fresh());
    }

    public function destroy($id)
    {
        $item = Service::findOrFail($id);
        $name = $item->name;
        $item->delete();

        $this->logActivity(
            null,
            'service.deleted',
            "Layanan dihapus: {$name}",
            ['service' => $name]
        );

        return response()->json(null, 204);
    }

    /**
     * GET /api/services/{id}/availability
     */
    public function availability(Request $request, $id)
    {
        $service = Service::findOrFail($id);
        
        $minDate = Carbon::tomorrow();
        $maxDate = Carbon::tomorrow()->addDays(6);

        $startDateStr = $request->query('start_date');
        $endDateStr = $request->query('end_date');

        $startDate = $startDateStr ? Carbon::parse($startDateStr) : $minDate->copy();
        $endDate = $endDateStr ? Carbon::parse($endDateStr) : $startDate->copy()->addDays(6);

        $availability = [];
        $currentDate = $startDate->copy();

        while ($currentDate->lte($endDate)) {
            $dateStr = $currentDate->toDateString();
            
            $bookedCount = Booking::where('service_id', $id)
                ->where('scheduled_date', $dateStr)
                ->whereIn('status', ['pending', 'confirmed', 'ready', 'in_progress', 'waiting_payment'])
                ->count();
                
            $availableCount = max(0, $service->max_booking_per_day - $bookedCount);
            
            if ($currentDate->lt($minDate) || $currentDate->gt($maxDate)) {
                $status = 'unavailable';
            } else {
                $status = $availableCount > 0 ? 'available' : 'full';
            }
            
            $availability[] = [
                'date' => $dateStr,
                'booked' => $bookedCount,
                'available' => $availableCount,
                'status' => $status
            ];
            
            $currentDate->addDay();
        }

        return response()->json([
            'service_id' => $service->id,
            'service_name' => $service->name,
            'max_per_day' => (int)$service->max_booking_per_day,
            'availability' => $availability,
            'bookable_date_range' => [
                'min' => $minDate->toDateString(),
                'max' => $maxDate->toDateString()
            ]
        ]);
    }

    /**
     * GET /api/services/{id}/reviews
     */
    public function reviews(Request $request, $id)
    {
        $service = Service::findOrFail($id);
        
        $page = (int)$request->query('page', 1);
        $limit = (int)$request->query('limit', 10);
        $sort = $request->query('sort', '-created_at');

        $query = Review::where('service_id', $id)->with('customer');

        if ($sort === '-created_at') {
            $query->orderBy('created_at', 'desc');
        } else {
            $query->orderBy('created_at', 'asc');
        }

        $paginator = $query->paginate($limit, ['*'], 'page', $page);

        $data = collect($paginator->items())->map(function ($r) {
            return [
                'id' => $r->id,
                'service_id' => $r->service_id,
                'booking_id' => $r->booking_id,
                'user_id' => $r->user_id,
                'user_name' => $r->customer->name ?? 'Anonymous',
                'rating' => (int)$r->rating,
                'comment' => $r->comment,
                'created_at' => $r->created_at->toIso8601String()
            ];
        });

        return response()->json([
            'data' => $data,
            'pagination' => [
                'total' => $paginator->total(),
                'page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'last_page' => $paginator->lastPage()
            ]
        ]);
    }
}
