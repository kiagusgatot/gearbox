<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Review extends Model
{
    use HasUuids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id', 'booking_id', 'user_id', 'mechanic_id', 'rating',
        'title', 'comment', 'photos', 'is_verified_purchase', 'service_id'
    ];

    protected $casts = [
        'photos' => 'json',
        'is_verified_purchase' => 'boolean',
        'rating' => 'integer',
    ];

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    public function service()
    {
        return $this->belongsTo(Service::class);
    }

    public function customer()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function mechanic()
    {
        return $this->belongsTo(User::class, 'mechanic_id');
    }

    public function scopeByMechanic($query, $mechanicId)
    {
        return $query->where('mechanic_id', $mechanicId);
    }

    public function scopeHighRated($query)
    {
        return $query->where('rating', '>=', 4);
    }
}