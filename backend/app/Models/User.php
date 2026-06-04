<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Contracts\Auth\MustVerifyEmail;

class User extends Authenticatable implements MustVerifyEmail
{
    use Notifiable, SoftDeletes, HasUuids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id', 'email', 'password', 'phone', 'name', 'role',
        'avatar_url', 'is_active', 'email_verified_at', 'verification_token'
    ];

    protected $hidden = ['password'];

    protected $casts = [
        'is_active' => 'boolean',
        'email_verified_at' => 'datetime',
    ];

    public function sendEmailVerificationNotification()
    {
        $this->notify(new \App\Notifications\VerifyEmailNotification);
    }

    public function sendPasswordResetNotification($token)
    {
        $this->notify(new \App\Notifications\ResetPasswordNotification($token));
    }

    // Relationships
    public function vehicles()
    {
        return $this->hasMany(Vehicle::class);
    }

    public function bookingsAsCustomer()
    {
        return $this->hasMany(Booking::class, 'user_id');
    }

    public function bookingsAsMechanic()
    {
        return $this->hasMany(Booking::class, 'mechanic_id');
    }

    public function inspections()
    {
        return $this->hasMany(Inspection::class, 'mechanic_id');
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    public function schedules()
    {
        return $this->hasMany(MechanicSchedule::class, 'mechanic_id');
    }

    public function earnings()
    {
        return $this->hasMany(MechanicEarning::class, 'mechanic_id');
    }

    public function withdrawals()
    {
        return $this->hasMany(WithdrawalRequest::class, 'mechanic_id');
    }

    public function reviewsGiven()
    {
        return $this->hasMany(Review::class, 'user_id');
    }

    public function reviewsReceived()
    {
        return $this->hasMany(Review::class, 'mechanic_id');
    }

    // Scopes
    public function scopeCustomers($query)
    {
        return $query->where('role', 'customer');
    }

    public function scopeMechanics($query)
    {
        return $query->where('role', 'mechanic');
    }

    public function scopeAdmins($query)
    {
        return $query->where('role', 'admin');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    // Methods
    public function isMechanic()
    {
        return $this->role === 'mechanic';
    }

    public function isAdmin()
    {
        return $this->role === 'admin';
    }

    public function isCustomer()
    {
        return $this->role === 'customer';
    }
}