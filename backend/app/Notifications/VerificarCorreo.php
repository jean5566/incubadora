<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\URL;

class VerificarCorreo extends VerifyEmail
{
    protected function verificationUrl($notifiable): string
    {
        return URL::temporarySignedRoute(
            'verification.verify',
            Carbon::now()->addMinutes(Config::get('auth.verification.expire', 60)),
            [
                'id'   => $notifiable->getKey(),
                'hash' => sha1($notifiable->getEmailForVerification()),
            ]
        );
    }

    public function toMail($notifiable): MailMessage
    {
        $url = $this->verificationUrl($notifiable);

        return (new MailMessage)
            ->subject('Verifica tu Correo Institucional — UniIncubadora')
            ->greeting('¡Hola!')
            ->line('Haz clic en el botón de abajo para verificar tu correo institucional y activar tu cuenta en la plataforma de incubación.')
            ->action('Verificar Correo', $url)
            ->line('Este enlace expirará en 60 minutos.')
            ->line('Si no creaste esta cuenta, puedes ignorar este mensaje.');
    }
}
