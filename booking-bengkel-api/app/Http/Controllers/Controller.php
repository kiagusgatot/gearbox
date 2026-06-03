<?php

namespace App\Http\Controllers;

abstract class Controller
{
    protected function getAuthenticatedUser()
    {
        $authHeader = request()->header('Authorization');
        if (!$authHeader) {
            return null;
        }
        $token = str_replace('Bearer ', '', $authHeader);
        $userId = base64_decode($token);
        return \App\Models\User::find($userId);
    }

    protected function logActivity($bookingId, $action, $description, $metadata = [], $customActorId = null, $customActorRole = null)
    {
        $actor = $this->getAuthenticatedUser();
        $actorId = $customActorId ?: ($actor ? $actor->id : null);
        $actorRole = $customActorRole ?: ($actor ? $actor->role : 'system');

        $userId = null;
        if ($bookingId) {
            $booking = \App\Models\Booking::find($bookingId);
            if ($booking) {
                $userId = $booking->user_id;
            }
        }

        return \App\Models\ActivityLog::create([
            'booking_id'  => $bookingId,
            'user_id'     => $userId,
            'actor_id'    => $actorId,
            'actor_role'  => $actorRole,
            'action'      => $action,
            'description' => $description,
            'metadata'    => $metadata,
        ]);
    }
}
