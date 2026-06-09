<?php

namespace App\Http\Controllers;

use App\Models\Notificacion;
use Illuminate\Http\Request;

class NotificacionController extends Controller
{
    /**
     * Lista las notificaciones del usuario autenticado (máx. 50, más recientes primero).
     */
    public function index(Request $request)
    {
        $notifs = Notificacion::where('id_usuario', $request->user()->id_usuario)
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get();

        return response()->json($notifs);
    }

    /**
     * Marca una notificación como leída.
     */
    public function marcarLeida(Request $request, Notificacion $notificacion)
    {
        abort_unless($notificacion->id_usuario === $request->user()->id_usuario, 403);

        $notificacion->leida = true;
        $notificacion->save();

        return response()->json(['message' => 'Marcada como leída.']);
    }

    /**
     * Marca todas las notificaciones del usuario como leídas.
     */
    public function marcarTodas(Request $request)
    {
        Notificacion::where('id_usuario', $request->user()->id_usuario)
            ->where('leida', false)
            ->update(['leida' => true]);

        return response()->json(['message' => 'Todas marcadas como leídas.']);
    }

    /**
     * Elimina todas las notificaciones leídas del usuario.
     */
    public function eliminarLeidas(Request $request)
    {
        Notificacion::where('id_usuario', $request->user()->id_usuario)
            ->where('leida', true)
            ->delete();

        return response()->json(['message' => 'Notificaciones leídas eliminadas.']);
    }
}
