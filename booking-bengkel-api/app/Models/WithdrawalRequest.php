<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class WithdrawalRequest extends Model
{
    use HasUuids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id', 'mechanic_id', 'amount', 'bank_account', 'account_holder',
        'account_number', 'bank_name', 'status', 'rejection_reason'
    ];

    protected $casts = [
        'amount' => 'float',
    ];

    public function mechanic()
    {
        return $this->belongsTo(User::class, 'mechanic_id');
    }

    public function scopeByMechanic($query, $mechanicId)
    {
        return $query->where('mechanic_id', $mechanicId);
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function approve()
    {
        $this->update(['status' => 'approved']);
    }

    public function reject($reason)
    {
        $this->update([
            'status' => 'rejected',
            'rejection_reason' => $reason
        ]);
    }

    public function process()
    {
        $this->update([
            'status' => 'processed',
            'processed_at' => now()
        ]);
    }
}