<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Booking extends Model
{
    use HasUuids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id', 'user_id', 'vehicle_id', 'service_id', 'mechanic_id',
        'scheduled_date', 'scheduled_time', 'status', 'notes'
    ];

    protected $casts = [
        'scheduled_date' => 'date',
    ];

    // Relationships
    public function customer()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function service()
    {
        return $this->belongsTo(Service::class);
    }

    public function mechanic()
    {
        return $this->belongsTo(User::class, 'mechanic_id');
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function inspection()
    {
        return $this->hasOne(Inspection::class);
    }

    public function review()
    {
        return $this->hasOne(Review::class);
    }

    public function earnings()
    {
        return $this->hasOne(MechanicEarning::class);
    }

    public function estimationItems()
    {
        return $this->hasMany(EstimationItem::class);
    }

    public function serviceChecklistItems()
    {
        return $this->hasMany(ServiceChecklistItem::class)->orderBy('display_order', 'asc');
    }

    // Scopes
    public function scopeByCustomer($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeByMechanic($query, $mechanicId)
    {
        return $query->where('mechanic_id', $mechanicId);
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeCancelled($query)
    {
        return $query->where('status', 'cancelled');
    }

    public function scopeUpcoming($query)
    {
        return $query->where('scheduled_date', '>=', now()->toDateString());
    }

    // Methods
    public function isPending()
    {
        return $this->status === 'pending';
    }

    public function isCompleted()
    {
        return $this->status === 'completed';
    }

    public function isCancelled()
    {
        return $this->status === 'cancelled';
    }

    public function totalPaid()
    {
        return $this->payments()
            ->where('status', 'success')
            ->sum('amount');
    }

    public function remainingAmount()
    {
        $service = $this->service;
        $estimatedCost = $this->inspection?->estimated_cost ?? $service->base_price;
        return $estimatedCost - $this->totalPaid();
    }
}