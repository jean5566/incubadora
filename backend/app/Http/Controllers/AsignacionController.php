<?php

namespace App\Http\Controllers;

use App\Models\Asignacion;
use App\Models\Notificacion;
use App\Models\Proyecto;
use App\Models\User;
use Illuminate\Http\Request;

class AsignacionController extends Controller
{
    /**
     * Lista todas las asignaciones activas (solo admin).
     * Opcionalmente filtra por ?id_proyecto=X
     */
    public function index(Request $request)
    {
        abort_unless($request->user()->rol === 'administrador', 403);

        $query = Asignacion::with([
                'usuario:id_usuario,nombre,correo,rol',
                'proyecto:id_proyecto,nombre_proyecto',
            ])
            ->where('activo', 'si');

        if ($request->filled('id_proyecto')) {
            $query->where('id_proyecto', $request->integer('id_proyecto'));
        }

        return response()->json($query->get());
    }

    /**
     * Crea una nueva asignación (solo admin).
     * El usuario debe ser mentor o emprendedor.
     */
    public function store(Request $request)
    {
        abort_unless($request->user()->rol === 'administrador', 403);

        $validated = $request->validate([
            'id_proyecto' => 'required|exists:proyectos,id_proyecto',
            'id_usuario'  => 'required|exists:usuarios,id_usuario',
        ]);

        $usuario = User::findOrFail($validated['id_usuario']);
        abort_unless(
            in_array($usuario->rol, ['mentor', 'emprendedor']),
            422,
            'Solo se pueden asignar usuarios con rol mentor o emprendedor.'
        );

        $proyecto = Proyecto::findOrFail($validated['id_proyecto']);
        abort_unless(
            $proyecto->estado === 'activo',
            422,
            'Solo se pueden asignar usuarios a proyectos activos.'
        );

        // Evitar duplicados activos
        $existe = Asignacion::where('id_proyecto', $validated['id_proyecto'])
            ->where('id_usuario', $validated['id_usuario'])
            ->where('activo', 'si')
            ->exists();

        abort_if($existe, 422, 'Este usuario ya está asignado a ese proyecto.');

        $asignacion = Asignacion::create([
            'id_proyecto' => $validated['id_proyecto'],
            'id_usuario'  => $validated['id_usuario'],
            'fecha'       => now(),
            'activo'      => 'si',
        ]);

        $asignacion->load('usuario:id_usuario,nombre,correo,rol');

        if ($usuario->rol === 'mentor') {
            // Sincronizar id_docente en el proyecto
            $proyecto->id_docente = $usuario->id_usuario;
            $proyecto->save();

            // Notificar al mentor
            Notificacion::create([
                'id_usuario' => $usuario->id_usuario,
                'tipo'       => 'asignacion_proyecto',
                'mensaje'    => "Se te ha asignado el proyecto \"{$proyecto->nombre_proyecto}\".",
                'url'        => '/mentor/seguimiento',
            ]);

            // Notificar al emprendedor
            Notificacion::create([
                'id_usuario' => $proyecto->id_usuario,
                'tipo'       => 'mentor_asignado',
                'mensaje'    => "Se te ha asignado un mentor para el proyecto \"{$proyecto->nombre_proyecto}\".",
                'url'        => '/emprendedor/proyectos',
            ]);
        }

        return response()->json([
            'message' => 'Asignación creada correctamente.',
            'data'    => $asignacion,
        ], 201);
    }

    /**
     * Elimina una asignación (solo admin).
     */
    public function destroy(Request $request, Asignacion $asignacion)
    {
        abort_unless($request->user()->rol === 'administrador', 403);

        $asignacion->load('usuario:id_usuario,rol');

        // Si se elimina la asignación del mentor, limpiar id_docente del proyecto
        if ($asignacion->usuario?->rol === 'mentor') {
            Proyecto::where('id_proyecto', $asignacion->id_proyecto)
                ->where('id_docente', $asignacion->id_usuario)
                ->update(['id_docente' => null]);
        }

        $asignacion->delete();

        return response()->json(['message' => 'Asignación eliminada.']);
    }
}
