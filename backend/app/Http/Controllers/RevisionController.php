<?php

namespace App\Http\Controllers;

use App\Models\Documento;
use App\Models\Notificacion;
use App\Models\Revision;
use App\Models\Seguimiento;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class RevisionController extends Controller
{
    /**
     * Lista las revisiones de un seguimiento con sus documentos.
     */
    public function index(Request $request, Seguimiento $seguimiento)
    {
        $user = $request->user();
        $esMentor       = $user->rol === 'mentor' && $seguimiento->id_mentor === $user->id_usuario;
        $esEmprendedor  = $user->rol === 'emprendedor' && $seguimiento->proyecto->id_usuario === $user->id_usuario;
        abort_unless($esMentor || $esEmprendedor, 403);

        $revisiones = Revision::where('id_seguimiento', $seguimiento->id_seguimiento)
            ->with(['documentos' => fn($q) => $q->select('id_documento','id_revision','nombre','archivo','fecha','id_usuario')])
            ->orderBy('fecha_envio')
            ->orderBy('id_revision')
            ->get()
            ->map(fn($r) => array_merge($r->toArray(), [
                'documentos' => $r->documentos->map(fn($d) => array_merge($d->toArray(), [
                    'archivo_url' => Storage::url($d->archivo),
                ]))->values(),
            ]));

        return response()->json($revisiones);
    }

    /**
     * Crea una nueva revisión con documentos (emprendedor).
     */
    public function store(Request $request, Seguimiento $seguimiento)
    {
        abort_unless($request->user()->rol === 'emprendedor', 403);
        abort_unless($seguimiento->proyecto->id_usuario === $request->user()->id_usuario, 403);
        abort_unless(is_null($seguimiento->fecha_fin), 422, 'Esta etapa ya fue cerrada.');

        $request->validate([
            'archivos'   => 'required|array|min:1',
            'archivos.*' => 'file|max:15360',
            'nombres'    => 'required|array|min:1',
            'nombres.*'  => 'required|string|max:200',
        ]);

        $revision = Revision::create([
            'id_seguimiento' => $seguimiento->id_seguimiento,
            'fecha_envio'    => now()->toDateString(),
            'observaciones'  => null,
        ]);

        $archivosSubidos = [];
        foreach ($request->file('archivos') as $i => $file) {
            $nombre = $request->input("nombres.$i", $file->getClientOriginalName());
            $path   = $file->store("revisiones/seguimiento-{$seguimiento->id_seguimiento}", 'public');

            $doc = Documento::create([
                'id_proyecto'  => $seguimiento->id_proyecto,
                'id_revision'  => $revision->id_revision,
                'id_usuario'   => $request->user()->id_usuario,
                'nombre'       => $nombre,
                'archivo'      => $path,
                'fecha'        => now()->toDateString(),
            ]);

            $archivosSubidos[] = array_merge($doc->toArray(), [
                'archivo_url' => Storage::url($path),
            ]);
        }

        // Notificar al mentor que el emprendedor envió una entrega
        Notificacion::create([
            'id_usuario' => $seguimiento->id_mentor,
            'tipo'       => 'tarea_enviada',
            'mensaje'    => "El emprendedor envió una entrega en el proyecto \"{$seguimiento->proyecto->nombre_proyecto}\".",
            'url'        => '/mentor/seguimiento',
        ]);

        return response()->json([
            'message' => 'Entrega enviada exitosamente.',
            'data'    => array_merge($revision->toArray(), ['documentos' => $archivosSubidos]),
        ], 201);
    }

    /**
     * El mentor guarda sus observaciones en una revisión.
     */
    public function guardarObservaciones(Request $request, Revision $revision)
    {
        abort_unless($request->user()->rol === 'mentor', 403);
        abort_unless($revision->seguimiento->id_mentor === $request->user()->id_usuario, 403);

        abort_if($revision->revisado, 422, 'Esta entrega ya fue revisada y no puede modificarse.');

        $validated = $request->validate(['observaciones' => 'nullable|string']);
        $revision->update(['observaciones' => $validated['observaciones'], 'revisado' => true]);

        // Notificar al emprendedor que su entrega fue revisada
        Notificacion::create([
            'id_usuario' => $revision->seguimiento->proyecto->id_usuario,
            'tipo'       => 'tarea_revisada',
            'mensaje'    => "Tu entrega del proyecto \"{$revision->seguimiento->proyecto->nombre_proyecto}\" ha sido revisada por tu mentor.",
            'url'        => '/emprendedor/mentorias',
        ]);

        return response()->json(['message' => 'Observaciones guardadas.', 'data' => $revision]);
    }
}
