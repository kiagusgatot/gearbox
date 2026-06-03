<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Vehicle extends Model
{
    use HasUuids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id', 'user_id', 'brand', 'model', 'plate', 'year',
        'engine_type', 'color', 'vin', 'odometer', 'notes',
        'transmission', 'fuel_type'
    ];

    public function owner()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    public function scopeByOwner($query, $userId)
    {
        return $query->where('user_id', $userId);
    }
}