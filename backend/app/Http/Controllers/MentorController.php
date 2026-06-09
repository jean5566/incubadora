<?php

namespace App\Http\Controllers;

use App\Models\Mentor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class MentorController extends Controller
{
    /**
     * Devuelve el perfil del mentor autenticado.
     */
    public function perfil(Request $request)
    {
        abort_unless($request->user()->rol === 'mentor', 403);

        $usuario = $request->user();
        $mentor  = Mentor::firstOrCreate(['id_usuario' => $usuario->id_usuario]);

        return response()->json([
            'id_usuario'  => $usuario->id_usuario,
            'nombre'      => $usuario->nombre,
            'correo'      => $usuario->correo,
            'especialidad' => $mentor->especialidad,
        ]);
    }

    /**
     * Actualiza el perfil del mentor autenticado.
     */
    public function actualizarPerfil(Request $request)
    {
        abort_unless($request->user()->rol === 'mentor', 403);

        $usuario = $request->user();

        $validated = $request->validate([
            'nombre'      => 'required|string|max:150',
            'correo'      => 'required|email|max:150|unique:usuarios,correo,' . $usuario->id_usuario . ',id_usuario',
            'especialidad' => 'nullable|string|max:255',
            'clave'       => 'nullable|string|min:8',
        ], [
            'correo.unique' => 'Este correo ya está en uso.',
            'clave.min'     => 'La contraseña debe tener al menos 8 caracteres.',
        ]);

        $usuario->nombre = $validated['nombre'];
        $usuario->correo = $validated['correo'];
        if (!empty($validated['clave'])) {
            $usuario->clave = Hash::make($validated['clave']);
        }
        $usuario->save();

        $mentor = Mentor::firstOrCreate(['id_usuario' => $usuario->id_usuario]);
        $mentor->especialidad = $validated['especialidad'] ?? null;
        $mentor->save();

        return response()->json([
            'message'     => 'Perfil actualizado correctamente.',
            'id_usuario'  => $usuario->id_usuario,
            'nombre'      => $usuario->nombre,
            'correo'      => $usuario->correo,
            'especialidad' => $mentor->especialidad,
        ]);
    }
}
