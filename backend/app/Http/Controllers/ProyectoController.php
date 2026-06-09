<?php

namespace App\Http\Controllers;

use App\Models\Entrega;
use App\Models\Notificacion;
use App\Models\Proyecto;
use App\Models\Seguimiento;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProyectoController extends Controller
{
    /**
     * Lista los proyectos del estudiante autenticado.
     */
    public function index(Request $request)
    {
        abort_unless($request->user()->rol === 'emprendedor', 403, 'Solo emprendedores pueden acceder a sus proyectos.');

        $proyectos = Proyecto::where('id_usuario', $request->user()->id_usuario)
            ->with([
                'docente:id_usuario,nombre,correo',
                'asignaciones' => fn($q) => $q->where('activo', 'si')
                    ->with('usuario:id_usuario,nombre,correo,rol'),
            ])
            ->orderBy('fecha_registro', 'desc')
            ->get();

        $resultado = $proyectos->map(function ($p) {
            $data = $p->toArray();

            // Resolver mentor: primero id_docente, luego asignaciones
            if (!$p->docente) {
                $mentor = collect($p->asignaciones)
                    ->first(fn($a) => $a->usuario?->rol === 'mentor');
                $data['docente'] = $mentor ? $mentor->usuario->only(['id_usuario', 'nombre', 'correo']) : null;
            }

            unset($data['asignaciones']);
            return $data;
        });

        return response()->json($resultado);
    }

    /**
     * Lista todos los proyectos con el nombre del estudiante (solo admin).
     */
    public function todos(Request $request)
    {
        abort_unless($request->user()->rol === 'administrador', 403);

        $proyectos = Proyecto::with('usuario:id_usuario,nombre,correo')
            ->orderBy('fecha_registro', 'desc')
            ->get();

        return response()->json($proyectos);
    }

    /**
     * Cambia el estado de un proyecto (solo admin).
     */
    public function cambiarEstado(Request $request, Proyecto $proyecto)
    {
        abort_unless($request->user()->rol === 'administrador', 403);

        $validated = $request->validate([
            'estado' => 'required|in:pendiente,activo,finalizado,rechazado',
        ]);

        $proyecto->estado = $validated['estado'];
        $proyecto->save();

        // Si el proyecto es rechazado, cerrar todos los seguimientos activos
        if ($validated['estado'] === 'rechazado') {
            Seguimiento::where('id_proyecto', $proyecto->id_proyecto)
                ->whereNull('fecha_fin')
                ->update(['fecha_fin' => now()->toDateString()]);
        }

        $mensajes = [
            'activo'     => "Tu proyecto \"{$proyecto->nombre_proyecto}\" ha sido aprobado.",
            'rechazado'  => "Tu proyecto \"{$proyecto->nombre_proyecto}\" ha sido rechazado.",
            'finalizado' => "Tu proyecto \"{$proyecto->nombre_proyecto}\" ha sido marcado como finalizado.",
            'pendiente'  => "Tu proyecto \"{$proyecto->nombre_proyecto}\" está pendiente de revisión.",
        ];

        Notificacion::create([
            'id_usuario' => $proyecto->id_usuario,
            'tipo'       => 'estado_proyecto',
            'mensaje'    => $mensajes[$validated['estado']],
            'url'        => '/emprendedor/proyectos',
        ]);

        return response()->json([
            'message' => 'Estado actualizado.',
            'data'    => $proyecto,
        ]);
    }

    /**
     * Lista proyectos aprobados (estado=activo) con docente asignado (solo admin).
     */
    public function aprobados(Request $request)
    {
        abort_unless($request->user()->rol === 'administrador', 403);

        $proyectos = Proyecto::with([
                'usuario:id_usuario,nombre,correo',
                'docente:id_usuario,nombre,correo',
            ])
            ->where('estado', 'activo')
            ->orderBy('fecha_registro', 'desc')
            ->get();

        return response()->json($proyectos);
    }

    /**
     * Asigna o desasigna un docente a un proyecto aprobado (solo admin).
     */
    public function asignarDocente(Request $request, Proyecto $proyecto)
    {
        abort_unless($request->user()->rol === 'administrador', 403);
        abort_unless($proyecto->estado === 'activo', 422, 'Solo se puede asignar docente a proyectos aprobados.');

        $validated = $request->validate([
            'id_docente' => 'nullable|exists:usuarios,id_usuario',
        ]);

        if (!empty($validated['id_docente'])) {
            $docente = User::find($validated['id_docente']);
            abort_unless($docente && $docente->rol === 'mentor', 422, 'El usuario seleccionado no es mentor.');
        }

        $proyecto->id_docente = $validated['id_docente'] ?? null;
        $proyecto->save();

        $proyecto->load('docente:id_usuario,nombre,correo');

        if (!empty($validated['id_docente'])) {
            Notificacion::create([
                'id_usuario' => $validated['id_docente'],
                'tipo'       => 'asignacion_proyecto',
                'mensaje'    => "Se te ha asignado el proyecto \"{$proyecto->nombre_proyecto}\".",
                'url'        => '/mentor/seguimiento',
            ]);
        }

        return response()->json([
            'message' => 'Docente asignado correctamente.',
            'data'    => $proyecto,
        ]);
    }

    /**
     * Lista los proyectos asignados al mentor autenticado (via asignaciones).
     */
    public function misAsignados(Request $request)
    {
        abort_unless($request->user()->rol === 'mentor', 403);

        $proyectos = Proyecto::whereHas('asignaciones', function ($q) use ($request) {
            $q->where('id_usuario', $request->user()->id_usuario)
              ->where('activo', 'si');
        })
        ->where('estado', '!=', 'rechazado')
        ->with('usuario:id_usuario,nombre,correo')
        ->orderBy('fecha_registro', 'desc')
        ->get();

        return response()->json($proyectos);
    }

    /**
     * Crea un nuevo proyecto (solo estudiantes).
     */
    public function store(Request $request)
    {
        abort_unless($request->user()->rol === 'emprendedor', 403, 'Solo emprendedores pueden registrar proyectos.');

        $validated = $request->validate([
            'nombre_proyecto'    => 'required|string|max:200',
            'descripcion'        => 'required|string|max:2000',
            'sector_tecnologico' => 'nullable|string|max:200',
            'problema_resuelve'  => 'nullable|string|max:2000',
            'propuesta_valor'    => 'nullable|string|max:2000',
        ], [
            'nombre_proyecto.required' => 'El nombre del proyecto es obligatorio.',
            'descripcion.required'     => 'La descripción es obligatoria.',
        ]);

        $proyecto = Proyecto::create([
            'id_usuario'         => $request->user()->id_usuario,
            'nombre_proyecto'    => $validated['nombre_proyecto'],
            'descripcion'        => $validated['descripcion'],
            'sector_tecnologico' => $validated['sector_tecnologico'] ?? null,
            'problema_resuelve'  => $validated['problema_resuelve']  ?? null,
            'propuesta_valor'    => $validated['propuesta_valor']     ?? null,
            'estado'             => 'pendiente',
        ]);

        $proyecto->refresh();

        $admins = User::where('rol', 'administrador')->pluck('id_usuario');
        foreach ($admins as $adminId) {
            Notificacion::create([
                'id_usuario' => $adminId,
                'tipo'       => 'nuevo_proyecto',
                'mensaje'    => "Nuevo proyecto registrado: \"{$proyecto->nombre_proyecto}\".",
                'url'        => '/admin/proyectos',
            ]);
        }

        return response()->json([
            'message' => 'Proyecto registrado exitosamente.',
            'data'    => $proyecto,
        ], 201);
    }

    /**
     * Lista las entregas de un proyecto (emprendedor dueño o mentor asignado).
     */
    public function indexEntregas(Request $request, Proyecto $proyecto)
    {
        $user = $request->user();
        $esDueno  = $proyecto->id_usuario === $user->id_usuario;
        $esMentor = $user->rol === 'mentor';
        abort_unless($esDueno || $esMentor, 403);

        $entregas = Entrega::where('proyecto_id', $proyecto->id_proyecto)
            ->with('usuario:id_usuario,nombre')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($e) => array_merge($e->toArray(), [
                'archivo_url' => $e->archivo_path ? Storage::url($e->archivo_path) : null,
            ]));

        return response()->json($entregas);
    }

    /**
     * Sube una entrega al mentor (solo el emprendedor dueño del proyecto).
     */
    public function storeEntrega(Request $request, Proyecto $proyecto)
    {
        abort_unless($request->user()->rol === 'emprendedor', 403);
        abort_unless($proyecto->id_usuario === $request->user()->id_usuario, 403, 'No eres el dueño de este proyecto.');

        $validated = $request->validate([
            'descripcion' => 'required|string|max:2000',
            'archivo'     => 'nullable|file|max:15360',
        ], [
            'descripcion.required' => 'La descripción es obligatoria.',
            'archivo.max'          => 'El archivo no puede superar 15 MB.',
        ]);

        $archivoNombre = null;
        $archivoPath   = null;

        if ($request->hasFile('archivo')) {
            $file          = $request->file('archivo');
            $archivoNombre = $file->getClientOriginalName();
            $archivoPath   = $file->store("entregas/proyecto-{$proyecto->id_proyecto}", 'public');
        }

        $entrega = Entrega::create([
            'proyecto_id'    => $proyecto->id_proyecto,
            'usuario_id'     => $request->user()->id_usuario,
            'descripcion'    => $validated['descripcion'],
            'archivo_nombre' => $archivoNombre,
            'archivo_path'   => $archivoPath,
        ]);

        return response()->json([
            'message' => 'Entrega enviada exitosamente.',
            'data'    => array_merge($entrega->toArray(), [
                'archivo_url' => $archivoPath ? Storage::url($archivoPath) : null,
            ]),
        ], 201);
    }
}
