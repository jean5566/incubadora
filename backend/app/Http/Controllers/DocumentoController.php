<?php

namespace App\Http\Controllers;

use App\Models\Documento;
use App\Models\Proyecto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DocumentoController extends Controller
{
    /**
     * Lista los documentos de un proyecto.
     */
    public function index(Request $request, Proyecto $proyecto)
    {
        $user    = $request->user();
        $esDueno = $proyecto->id_usuario === $user->id_usuario;
        $esMentor = $user->rol === 'mentor';
        abort_unless($esDueno || $esMentor, 403);

        $documentos = Documento::where('id_proyecto', $proyecto->id_proyecto)
            ->with('usuario:id_usuario,nombre')
            ->orderBy('fecha', 'desc')
            ->orderBy('id_documento', 'desc')
            ->get()
            ->map(fn($d) => array_merge($d->toArray(), [
                'archivo_url' => Storage::url($d->archivo),
            ]));

        return response()->json($documentos);
    }

    /**
     * Sube un documento al proyecto (solo el emprendedor dueño).
     */
    public function store(Request $request, Proyecto $proyecto)
    {
        abort_unless($request->user()->rol === 'emprendedor', 403);
        abort_unless($proyecto->id_usuario === $request->user()->id_usuario, 403, 'No eres el dueño de este proyecto.');

        $validated = $request->validate([
            'nombre'  => 'required|string|max:200',
            'archivo' => 'required|file|max:15360',
        ], [
            'nombre.required'  => 'El nombre del documento es obligatorio.',
            'archivo.required' => 'Debes adjuntar un archivo.',
            'archivo.max'      => 'El archivo no puede superar 15 MB.',
        ]);

        $file        = $request->file('archivo');
        $archivoPath = $file->store("documentos/proyecto-{$proyecto->id_proyecto}", 'public');

        $documento = Documento::create([
            'id_proyecto' => $proyecto->id_proyecto,
            'id_usuario'  => $request->user()->id_usuario,
            'nombre'      => $validated['nombre'],
            'archivo'     => $archivoPath,
            'fecha'       => now()->toDateString(),
        ]);

        return response()->json([
            'message' => 'Documento subido exitosamente.',
            'data'    => array_merge($documento->toArray(), [
                'archivo_url' => Storage::url($archivoPath),
            ]),
        ], 201);
    }

    /**
     * Descarga un documento con el nombre original del archivo.
     */
    public function download(Request $request, Documento $documento)
    {
        $user     = $request->user();
        $proyecto = $documento->proyecto;
        $esDueno  = $proyecto->id_usuario === $user->id_usuario;
        $esMentor = $user->rol === 'mentor';
        $esAdmin  = $user->rol === 'administrador';
        abort_unless($esDueno || $esMentor || $esAdmin, 403);

        abort_unless(Storage::disk('public')->exists($documento->archivo), 404, 'Archivo no encontrado.');

        $extension = pathinfo($documento->archivo, PATHINFO_EXTENSION);
        $nombreDescarga = $documento->nombre;

        if ($extension && !str_ends_with(strtolower($nombreDescarga), '.' . strtolower($extension))) {
            $nombreDescarga .= '.' . $extension;
        }

        return Storage::disk('public')->download($documento->archivo, $nombreDescarga);
    }

    /**
     * Elimina un documento (solo el dueño).
     */
    public function destroy(Request $request, Documento $documento)
    {
        abort_unless($documento->id_usuario === $request->user()->id_usuario, 403);

        Storage::disk('public')->delete($documento->archivo);
        $documento->delete();

        return response()->json(['message' => 'Documento eliminado.']);
    }
}
