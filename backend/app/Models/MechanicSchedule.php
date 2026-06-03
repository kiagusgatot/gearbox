<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class MechanicSchedule extends Model
{
    use HasUuids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id', 'mechanic_id', 'date', 'is_available',
        'max_bookings', 'current_bookings', 'notes'
    ];

    protected $casts = [
        'date' => 'date',
        'is_available' => 'boolean',
    ];

    public function mechanic()
    {
        return $this->belongsTo(User::class, 'mechanic_id');
    }

    public function scopeByMechanic($query, $mechanicId)
    {
        return $query->where('mechanic_id', $mechanicId);
    }

    public function scopeAvailable($query)
    {
        return $query->where('is_available', true);
    }

    public function scopeWithSlots($query)
    {
        return $query->whereRaw('current_bookings < max_bookings');
    }

    public function hasAvailableSlots()
    {
        return $this->current_bookings < $this->max_bookings;
    }

    public function availableSlots()
    {
        return $this->max_bookings - $this->current_bookings;
    }
}