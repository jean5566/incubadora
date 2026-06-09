<?php

namespace App\Http\Controllers;

use App\Models\Asesoria;
use App\Models\Notificacion;
use App\Models\Seguimiento;
use Illuminate\Http\Request;

class AsesoriaController extends Controller
{
    /**
     * Lista las asesorías de un seguimiento.
     * Accesible por el mentor dueño y el emprendedor del proyecto.
     */
    public function index(Request $request, Seguimiento $seguimiento)
    {
        $user = $request->user();
        $esMentor      = $user->rol === 'mentor' && $seguimiento->id_mentor === $user->id_usuario;
        $esEmprendedor = $user->rol === 'emprendedor' && $seguimiento->proyecto->id_usuario === $user->id_usuario;
        abort_unless($esMentor || $esEmprendedor, 403);

        $asesorias = Asesoria::where('id_seguimiento', $seguimiento->id_seguimiento)
            ->orderBy('fecha')
            ->orderBy('hora_inicio')
            ->get();

        return response()->json($asesorias);
    }

    /**
     * Crea una nueva asesoría (solo mentor).
     */
    public function store(Request $request, Seguimiento $seguimiento)
    {
        abort_unless($request->user()->rol === 'mentor', 403);
        abort_unless($seguimiento->id_mentor === $request->user()->id_usuario, 403);

        $validated = $request->validate([
            'titulo'      => 'required|string|max:200',
            'descripcion' => 'nullable|string',
            'fecha'       => 'required|date',
            'hora_inicio' => 'required|date_format:H:i',
            'hora_fin'    => 'nullable|date_format:H:i|after:hora_inicio',
            'modalidad'   => 'required|in:virtual,presencial',
            'enlace'      => 'nullable|string|max:500',
            'lugar'       => 'nullable|string|max:300',
        ]);

        $asesoria = Asesoria::create(array_merge(
            $validated,
            [
                'id_seguimiento' => $seguimiento->id_seguimiento,
                'estado'         => 'programada',
            ]
        ));

        $asesoria->refresh();

        Notificacion::create([
            'id_usuario' => $seguimiento->proyecto->id_usuario,
            'tipo'       => 'nueva_asesoria',
            'mensaje'    => "Nueva asesoría programada: \"{$asesoria->titulo}\" el {$asesoria->fecha}.",
            'url'        => '/emprendedor/reuniones',
        ]);

        return response()->json(['message' => 'Asesoría programada.', 'data' => $asesoria], 201);
    }

    /**
     * Actualiza estado y/o notas de una asesoría (solo mentor dueño).
     */
    public function update(Request $request, Asesoria $asesoria)
    {
        abort_unless($request->user()->rol === 'mentor', 403);
        abort_unless($asesoria->seguimiento->id_mentor === $request->user()->id_usuario, 403);

        $validated = $request->validate([
            'titulo'      => 'sometimes|string|max:200',
            'descripcion' => 'nullable|string',
            'fecha'       => 'sometimes|date',
            'hora_inicio' => 'sometimes|date_format:H:i',
            'hora_fin'    => 'nullable|date_format:H:i',
            'modalidad'   => 'sometimes|in:virtual,presencial',
            'enlace'      => 'nullable|string|max:500',
            'lugar'       => 'nullable|string|max:300',
            'estado'      => 'sometimes|in:programada,realizada,cancelada',
            'notas'       => 'nullable|string',
        ]);

        $asesoria->update($validated);

        return response()->json(['message' => 'Asesoría actualizada.', 'data' => $asesoria]);
    }

    /**
     * Elimina una asesoría (solo mentor dueño, solo si está programada).
     */
    public function destroy(Request $request, Asesoria $asesoria)
    {
        abort_unless($request->user()->rol === 'mentor', 403);
        abort_unless($asesoria->seguimiento->id_mentor === $request->user()->id_usuario, 403);
        abort_unless($asesoria->estado === 'programada', 422, 'Solo se pueden eliminar asesorías programadas.');

        $asesoria->delete();

        return response()->json(['message' => 'Asesoría eliminada.']);
    }
}
