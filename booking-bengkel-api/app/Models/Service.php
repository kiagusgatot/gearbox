<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Service extends Model
{
    use HasUuids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id', 'name', 'description', 'base_price', 'estimated_duration',
        'category', 'is_active', 'display_order',
        'labor_price', 'parts_price', 'max_booking_per_day', 'terms_conditions',
        'image_url'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'base_price' => 'float',
        'labor_price' => 'float',
        'parts_price' => 'float',
        'max_booking_per_day' => 'integer',
        'estimated_duration' => 'integer',
    ];

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('display_order');
    }
}