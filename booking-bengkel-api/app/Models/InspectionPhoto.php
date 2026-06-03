<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class InspectionPhoto extends Model
{
    use HasUuids;

    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'id', 'inspection_id', 'photo_url', 'photo_type', 'description'
    ];

    public function inspection()
    {
        return $this->belongsTo(Inspection::class);
    }
}