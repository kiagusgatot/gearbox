<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class ActivityLog extends Model
{
    use HasUuids;

    protected $keyType = 'string';
    public $incrementing = false;
    
    // Disable default timestamps since we only have created_at
    public $timestamps = false;

    protected $fillable = [
        'id', 'booking_id', 'user_id', 'actor_id',
        'actor_role', 'action', 'description', 'metadata'
    ];

    protected $casts = [
        'metadata' => 'json',
        'created_at' => 'datetime',
    ];

    // Auto-set created_at on creation
    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            if (!$model->created_at) {
                $model->created_at = $model->freshTimestamp();
            }
        });
    }

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    public function actor()
    {
        return $this->belongsTo(User::class, 'actor_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
