<?php

namespace App\Http\Controllers;

use App\Models\Etapa;
use App\Models\Notificacion;
use App\Models\Proyecto;
use App\Models\Seguimiento;
use Illuminate\Http\Request;

class SeguimientoController extends Controller
{
    /**
     * Inicia la mentoría de un proyecto creando el seguimiento en la primera etapa.
     */
    public function iniciar(Request $request)
    {
        abort_unless($request->user()->rol === 'mentor', 403);

        $validated = $request->validate([
            'id_proyecto' => 'required|exists:proyectos,id_proyecto',
        ]);

        // Evitar duplicado: si ya existe un seguimiento activo (sin fecha_fin) para este proyecto y mentor
        $activo = Seguimiento::where('id_proyecto', $validated['id_proyecto'])
            ->where('id_mentor', $request->user()->id_usuario)
            ->whereNull('fecha_fin')
            ->exists();

        abort_if($activo, 422, 'Ya existe una mentoría activa para este proyecto.');

        $primeraEtapa = Etapa::orderBy('orden_etapa')->first();

        abort_unless($primeraEtapa, 500, 'No hay etapas configuradas.');

        $seguimiento = Seguimiento::create([
            'id_proyecto'  => $validated['id_proyecto'],
            'id_etapa'     => $primeraEtapa->id_etapa,
            'id_mentor'    => $request->user()->id_usuario,
            'fecha_inicio' => now()->toDateString(),
            'fecha_fin'    => null,
        ]);

        $seguimiento->load('etapa');

        $proyecto = Proyecto::find($validated['id_proyecto']);
        Notificacion::create([
            'id_usuario' => $proyecto->id_usuario,
            'tipo'       => 'mentoria_iniciada',
            'mensaje'    => "Tu mentor ha iniciado la mentoría del proyecto \"{$proyecto->nombre_proyecto}\".",
            'url'        => '/emprendedor/mentorias',
        ]);

        return response()->json([
            'message' => 'Mentoría iniciada en la etapa: ' . $primeraEtapa->nombre_etapa,
            'data'    => $seguimiento,
        ], 201);
    }

    /**
     * Avanza al siguiente etapa cerrando la actual y abriendo la siguiente.
     */
    public function avanzar(Request $request)
    {
        abort_unless($request->user()->rol === 'mentor', 403);

        $validated = $request->validate([
            'id_seguimiento' => 'required|exists:seguimientos,id_seguimiento',
        ]);

        $seguimiento = Seguimiento::with('etapa')->findOrFail($validated['id_seguimiento']);

        abort_unless(
            $seguimiento->id_mentor === $request->user()->id_usuario,
            403,
            'No tienes permiso para avanzar esta mentoría.'
        );

        abort_if($seguimiento->fecha_fin !== null, 422, 'Esta etapa ya fue cerrada.');

        // Cerrar etapa actual
        $seguimiento->update([
            'fecha_fin' => now()->toDateString(),
        ]);

        // Buscar siguiente etapa
        $siguienteEtapa = Etapa::where('orden_etapa', '>', $seguimiento->etapa->orden_etapa)
            ->orderBy('orden_etapa')
            ->first();

        $idEmprendedor = $seguimiento->proyecto->id_usuario;
        $nombreProyecto = $seguimiento->proyecto->nombre_proyecto;

        if (!$siguienteEtapa) {
            // Marcar el proyecto como finalizado
            $seguimiento->proyecto()->update(['estado' => 'finalizado']);

            // Notificar al emprendedor
            Notificacion::create([
                'id_usuario' => $idEmprendedor,
                'tipo'       => 'etapa_finalizada',
                'mensaje'    => "Tu mentor ha completado todas las etapas del proyecto \"{$nombreProyecto}\". ¡Felicitaciones!",
                'url'        => '/emprendedor/mentorias',
            ]);

            // Notificar a todos los admins
            $admins = \App\Models\User::where('rol', 'administrador')->pluck('id_usuario');
            foreach ($admins as $adminId) {
                Notificacion::create([
                    'id_usuario' => $adminId,
                    'tipo'       => 'proyecto_finalizado',
                    'mensaje'    => "El proyecto \"{$nombreProyecto}\" ha sido finalizado exitosamente.",
                    'url'        => '/admin/proyectos',
                ]);
            }

            return response()->json([
                'message'  => 'Mentoría completada. El proyecto ha pasado por todas las etapas.',
                'completo' => true,
            ]);
        }

        $nuevo = Seguimiento::create([
            'id_proyecto'  => $seguimiento->id_proyecto,
            'id_etapa'     => $siguienteEtapa->id_etapa,
            'id_mentor'    => $request->user()->id_usuario,
            'fecha_inicio' => now()->toDateString(),
            'fecha_fin'    => null,
        ]);

        $nuevo->load('etapa');

        Notificacion::create([
            'id_usuario' => $idEmprendedor,
            'tipo'       => 'etapa_finalizada',
            'mensaje'    => "Tu mentor finalizó la etapa \"{$seguimiento->etapa->nombre_etapa}\" del proyecto \"{$nombreProyecto}\". Ahora estás en: {$siguienteEtapa->nombre_etapa}.",
            'url'        => '/emprendedor/mentorias',
        ]);

        return response()->json([
            'message'  => 'Avanzado a la etapa: ' . $siguienteEtapa->nombre_etapa,
            'completo' => false,
            'data'     => $nuevo,
        ]);
    }

    /**
     * Devuelve los proyectos del emprendedor que tienen mentoría activa.
     */
    public function misMentorias(Request $request)
    {
        abort_unless($request->user()->rol === 'emprendedor', 403);

        $proyectos = Proyecto::where('id_usuario', $request->user()->id_usuario)
            ->where('estado', '!=', 'rechazado')
            ->whereHas('seguimientos', fn($q) => $q->whereNull('fecha_fin'))
            ->with([
                'docente:id_usuario,nombre,correo',
                'seguimientos' => fn($q) => $q->whereNull('fecha_fin')->with('etapa'),
            ])
            ->get();

        return response()->json($proyectos);
    }

    /**
     * Lista los seguimientos de un proyecto.
     */
    public function porProyecto(Request $request, int $id_proyecto)
    {
        abort_unless($request->user()->rol === 'mentor', 403);

        $seguimientos = Seguimiento::with('etapa')
            ->where('id_proyecto', $id_proyecto)
            ->where('id_mentor', $request->user()->id_usuario)
            ->orderBy('id_seguimiento')
            ->get();

        return response()->json($seguimientos);
    }
}
