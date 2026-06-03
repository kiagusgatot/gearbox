<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class MechanicEarning extends Model
{
    use HasUuids;

    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'id', 'mechanic_id', 'booking_id', 'amount',
        'percentage', 'status', 'withdrawn_at'
    ];

    protected $casts = [
        'amount' => 'float',
        'percentage' => 'float',
    ];

    public function mechanic()
    {
        return $this->belongsTo(User::class, 'mechanic_id');
    }

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    public function scopeByMechanic($query, $mechanicId)
    {
        return $query->where('mechanic_id', $mechanicId);
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopePaid($query)
    {
        return $query->where('status', 'paid');
    }

    public function isPending()
    {
        return $this->status === 'pending';
    }
}