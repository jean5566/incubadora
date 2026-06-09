<?php

namespace App\Http\Controllers;

use App\Models\Entrega;
use App\Models\Project;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;

class ProjectController extends Controller
{
    /**
     * Get dashboard metrics and list of projects filtered by role.
     */
    public function dashboard(Request $request)
    {
        $user = $request->user();
        $projects = collect();
        $metrics = [];

        if ($user->rol === 'emprendedor') {
            $projects = $user->projects()->with(['progressLogs', 'mentors'])->get();
            $metrics = [
                'total_projects' => $projects->count(),
                'active_projects' => $projects->where('etapa', '!=', 'Escalamiento')->count(),
            ];
        } elseif ($user->rol === 'mentor') {
            $projects = $user->mentoredProjects()->with(['entrepreneur', 'progressLogs'])->get();
            $metrics = [
                'assigned_projects' => $projects->count(),
            ];
        } elseif ($user->rol === 'admin') {
            $projects = Project::with(['entrepreneur', 'mentors'])->get();
            $metrics = [
                'total_projects_system' => $projects->count(),
                'projects_by_stage' => $projects->groupBy('etapa')->map->count(),
            ];
        }

        return response()->json([
            'metrics' => $metrics,
            'projects' => $projects
        ]);
    }

    /**
     * Store a newly created project (Entrepreneur registration).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'descripcion' => 'required|string',
            'sector_tecnologico' => 'required|string',
            'propuesta_valor' => 'required|string',
        ]);

        $project = $request->user()->projects()->create([
            'nombre'             => $validated['nombre'],
            'descripcion'        => $validated['descripcion'],
            'sector_tecnologico' => $validated['sector_tecnologico'],
            'propuesta_valor'    => $validated['propuesta_valor'],
        ]);

        // Initial progress log
        $project->progressLogs()->create([
            'usuario_id' => $request->user()->id,
            'accion' => 'Proyecto Creado',
            'detalles' => 'Proyecto registrado en etapa Ideación.',
        ]);

        return response()->json([
            'message' => 'Proyecto creado exitosamente',
            'data' => $project,
        ], 201);
    }

    /**
     * Evaluate a project (Mentor action).
     */
    public function evaluate(Request $request, Project $project)
    {
        $user = $request->user();

        // Ensure user is assigned mentor or admin
        if ($user->rol !== 'admin' && !$project->mentors()->where('mentor_id', $user->id)->exists()) {
            return response()->json(['message' => 'Acción no autorizada'], 403);
        }

        $validated = $request->validate([
            'evaluation_notes' => 'required|string',
            'advance_stage' => 'required|boolean',
        ]);

        // Log evaluation
        $project->progressLogs()->create([
            'usuario_id' => $user->id,
            'accion' => 'Evaluación Enviada',
            'detalles' => $validated['evaluation_notes'],
        ]);

        if ($validated['advance_stage']) {
            $project->advanceStage($user);
        }

        return response()->json([
            'message' => 'Evaluación enviada exitosamente',
            'data' => $project->fresh(['progressLogs']),
        ]);
    }

    /**
     * Enviar entrega al mentor (Emprendedor).
     */
    public function submit(Request $request, Project $project)
    {
        if ($request->user()->id !== $project->usuario_id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $validated = $request->validate([
            'descripcion' => 'required|string|max:2000',
            'archivo'     => 'nullable|file|max:15360', // 15 MB
        ], [
            'descripcion.required' => 'La descripción es obligatoria.',
            'archivo.max'          => 'El archivo no puede superar 15 MB.',
        ]);

        $archivoNombre = null;
        $archivoPath   = null;

        if ($request->hasFile('archivo')) {
            $file          = $request->file('archivo');
            $archivoNombre = $file->getClientOriginalName();
            $archivoPath   = $file->store("entregas/{$project->id}", 'public');
        }

        $entrega = Entrega::create([
            'proyecto_id'   => $project->id,
            'usuario_id'    => $request->user()->id,
            'descripcion'   => $validated['descripcion'],
            'archivo_nombre' => $archivoNombre,
            'archivo_path'  => $archivoPath,
        ]);

        $project->progressLogs()->create([
            'usuario_id' => $request->user()->id,
            'accion'     => 'Entrega Enviada',
            'detalles'   => $validated['descripcion'],
        ]);

        return response()->json([
            'message' => 'Entrega enviada exitosamente',
            'data'    => array_merge($entrega->toArray(), [
                'archivo_url' => $archivoPath ? Storage::url($archivoPath) : null,
            ]),
        ], 201);
    }

    /**
     * Listar entregas de un proyecto.
     */
    public function submissions(Request $request, Project $project)
    {
        $user = $request->user();

        if (
            $user->id !== $project->usuario_id &&
            !$project->mentors()->where('mentor_id', $user->id)->exists() &&
            $user->rol !== 'admin'
        ) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $entregas = $project->entregas()
            ->with('usuario:id,nombre')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($e) => array_merge($e->toArray(), [
                'archivo_url' => $e->archivo_path ? Storage::url($e->archivo_path) : null,
            ]));

        return response()->json($entregas);
    }

    /**
     * Assign a mentor to a project (Admin only).
     */
    public function assignMentor(Request $request, Project $project)
    {
        Gate::authorize('assignMentor', $project);

        $validated = $request->validate([
            'mentor_id' => 'required|exists:usuarios,id',
        ]);

        $mentor = User::findOrFail($validated['mentor_id']);

        if ($mentor->rol !== 'mentor') {
            return response()->json(['message' => 'El usuario no es un mentor'], 400);
        }

        $project->mentors()->syncWithoutDetaching([$mentor->id]);

        $project->progressLogs()->create([
            'usuario_id' => $request->user()->id,
            'accion' => 'Mentor Asignado',
            'detalles' => "Mentor {$mentor->nombre} asignado al proyecto.",
        ]);

        return response()->json([
            'message' => 'Mentor asignado exitosamente',
        ]);
    }
}
