<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Payment extends Model
{
    use HasUuids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id', 'booking_id', 'amount', 'method', 'payment_type',
        'status', 'transaction_id', 'gateway', 'gateway_response', 'notes'
    ];

    protected $casts = [
        'amount' => 'float',
        'gateway_response' => 'json',
    ];

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    public function scopeByBooking($query, $bookingId)
    {
        return $query->where('booking_id', $bookingId);
    }

    public function scopeSuccessful($query)
    {
        return $query->where('status', 'success');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function isSuccessful()
    {
        return $this->status === 'success';
    }

    public function isPending()
    {
        return $this->status === 'pending';
    }
}