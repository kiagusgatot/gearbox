<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class ResetPasswordNotification extends Notification
{
    public $token;
    
    public function __construct($token) { $this->token = $token; }

    public function via($notifiable) { return ['mail']; }

    public function toMail($notifiable)
    {
        $resetUrl = env('FRONTEND_URL', 'http://localhost:3000') 
            . '/reset-password?token=' . $this->token 
            . '&email=' . urlencode($notifiable->email);

        return (new MailMessage)
            ->subject('Reset Password — GEARBOX')
            ->view('emails.reset-password', [
                'user' => $notifiable,
                'resetUrl' => $resetUrl,
            ]);
    }
}
