<?php

namespace App\Http\Controllers;

use App\Models\Emprendedor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class EmprendedorController extends Controller
{
    public function perfil(Request $request)
    {
        abort_unless($request->user()->rol === 'emprendedor', 403);

        $usuario     = $request->user();
        $emprendedor = Emprendedor::firstOrCreate(['id_usuario' => $usuario->id_usuario]);

        return response()->json([
            'id_usuario'  => $usuario->id_usuario,
            'nombre'      => $usuario->nombre,
            'correo'      => $usuario->correo,
            'telefono'    => $emprendedor->telefono,
            'carrera'     => $emprendedor->carrera,
            'semestre'    => $emprendedor->semestre,
            'bio'         => $emprendedor->bio,
        ]);
    }

    public function actualizarPerfil(Request $request)
    {
        abort_unless($request->user()->rol === 'emprendedor', 403);

        $usuario = $request->user();

        $validated = $request->validate([
            'nombre'      => 'required|string|max:150',
            'correo'      => 'required|email|max:150|unique:usuarios,correo,' . $usuario->id_usuario . ',id_usuario',
            'telefono'    => 'nullable|string|max:20',
            'carrera'     => 'nullable|string|max:150',
            'semestre'    => 'nullable|string|max:50',
            'bio'         => 'nullable|string',
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

        $emprendedor = Emprendedor::firstOrCreate(['id_usuario' => $usuario->id_usuario]);
        $emprendedor->telefono = $validated['telefono'] ?? null;
        $emprendedor->carrera  = $validated['carrera']  ?? null;
        $emprendedor->semestre = $validated['semestre'] ?? null;
        $emprendedor->bio      = $validated['bio']      ?? null;
        $emprendedor->save();

        return response()->json([
            'message'     => 'Perfil actualizado correctamente.',
            'id_usuario'  => $usuario->id_usuario,
            'nombre'      => $usuario->nombre,
            'correo'      => $usuario->correo,
            'telefono' => $emprendedor->telefono,
            'carrera'  => $emprendedor->carrera,
            'semestre' => $emprendedor->semestre,
            'bio'      => $emprendedor->bio,
        ]);
    }
}
