<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class ActivityLogController extends Controller
{
    public function index(Request $request)
    {
        $actor = $this->getAuthenticatedUser();
        if (!$actor || $actor->role !== 'admin') {
            return response()->json(['message' => 'Forbidden. Only admin can access this resource.'], 403);
        }

        $query = \App\Models\ActivityLog::with('actor');

        if ($request->filled('booking_id')) {
            $query->where('booking_id', $request->booking_id);
        }

        if ($request->filled('actor_role')) {
            $query->where('actor_role', $request->actor_role);
        }

        if ($request->filled('action')) {
            $query->where('action', $request->action);
        }

        $limit = $request->input('limit', 20);
        $paginator = $query->orderBy('created_at', 'desc')->paginate($limit);

        $mappedData = collect($paginator->items())->map(function ($log) {
            $actorData = null;
            if ($log->actor) {
                $actorData = [
                    'id' => $log->actor->id,
                    'name' => $log->actor->name,
                    'role' => $log->actor->role,
                ];
            } else if ($log->actor_role === 'system') {
                $actorData = [
                    'id' => null,
                    'name' => 'System',
                    'role' => 'system',
                ];
            }

            return [
                'id' => $log->id,
                'booking_id' => $log->booking_id,
                'actor' => $actorData,
                'action' => $log->action,
                'description' => $log->description,
                'metadata' => $log->metadata,
                'created_at' => $log->created_at ? $log->created_at->toIso8601String() : null,
            ];
        });

        return response()->json([
            'data' => $mappedData,
            'pagination' => [
                'total' => $paginator->total(),
                'page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'last_page' => $paginator->lastPage(),
            ]
        ]);
    }

    public function bookingLogs($bookingId, Request $request)
    {
        $actor = $this->getAuthenticatedUser();
        if (!$actor || $actor->role !== 'admin') {
            return response()->json(['message' => 'Forbidden. Only admin can access this resource.'], 403);
        }

        $query = \App\Models\ActivityLog::with('actor')->where('booking_id', $bookingId);

        $limit = $request->input('limit', 20);
        $paginator = $query->orderBy('created_at', 'desc')->paginate($limit);

        $mappedData = collect($paginator->items())->map(function ($log) {
            $actorData = null;
            if ($log->actor) {
                $actorData = [
                    'id' => $log->actor->id,
                    'name' => $log->actor->name,
                    'role' => $log->actor->role,
                ];
            } else if ($log->actor_role === 'system') {
                $actorData = [
                    'id' => null,
                    'name' => 'System',
                    'role' => 'system',
                ];
            }

            return [
                'id' => $log->id,
                'booking_id' => $log->booking_id,
                'actor' => $actorData,
                'action' => $log->action,
                'description' => $log->description,
                'metadata' => $log->metadata,
                'created_at' => $log->created_at ? $log->created_at->toIso8601String() : null,
            ];
        });

        return response()->json([
            'data' => $mappedData,
            'pagination' => [
                'total' => $paginator->total(),
                'page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'last_page' => $paginator->lastPage(),
            ]
        ]);
    }
}
