<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class EstimationItem extends Model
{
    use HasUuids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id', 'inspection_id', 'booking_id', 'name', 'qty',
        'unit_price', 'total_price', 'duration_minutes', 'photo_url', 'notes'
    ];

    protected $casts = [
        'qty' => 'integer',
        'unit_price' => 'float',
        'total_price' => 'float',
        'duration_minutes' => 'integer',
    ];

    public function inspection()
    {
        return $this->belongsTo(Inspection::class);
    }

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }
}
