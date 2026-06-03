<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Inspection extends Model
{
    use HasUuids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id', 'booking_id', 'mechanic_id', 'findings', 'estimated_cost',
        'estimated_duration', 'actual_cost', 'actual_duration', 'status',
        'mechanic_notes', 'admin_notes', 'approval_status', 'sent_at', 'approved_at', 'approved_by'
    ];

    protected $casts = [
        'estimated_cost' => 'float',
        'actual_cost' => 'float',
        'sent_at' => 'datetime',
        'approved_at' => 'datetime',
    ];

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    public function mechanic()
    {
        return $this->belongsTo(User::class, 'mechanic_id');
    }

    public function photos()
    {
        return $this->hasMany(InspectionPhoto::class);
    }

    public function estimationItems()
    {
        return $this->hasMany(EstimationItem::class);
    }

    public function scopePendingApproval($query)
    {
        return $query->where('status', 'pending_approval');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function isPendingApproval()
    {
        return $this->status === 'pending_approval';
    }

    public function isApproved()
    {
        return $this->status === 'approved';
    }

    public function isRejected()
    {
        return $this->status === 'rejected';
    }
}