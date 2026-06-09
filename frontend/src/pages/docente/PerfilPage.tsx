import React, { useState, useEffect } from 'react';
import {
  User, Mail, Briefcase, Lock, Save, AlertCircle, CheckCircle2, X, Eye, EyeOff,
} from 'lucide-react';
import { getMentorPerfil, actualizarMentorPerfil, type MentorPerfil } from '../../api';

export const PerfilPage: React.FC = () => {
  const [perfil, setPerfil]       = useState<MentorPerfil | null>(null);
  const [loading, setLoading]     = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError]         = useState('');
  const [exito, setExito]         = useState('');
  const [showClave, setShowClave] = useState(false);
  const [showConfirmar, setShowConfirmar] = useState(false);

  const [nombre,      setNombre]      = useState('');
  const [correo,      setCorreo]      = useState('');
  const [especialidad, setEspecialidad] = useState('');
  const [clave,       setClave]       = useState('');
  const [confirmar,   setConfirmar]   = useState('');

  useEffect(() => {
    getMentorPerfil()
      .then(data => {
        setPerfil(data);
        setNombre(data.nombre);
        setCorreo(data.correo);
        setEspecialidad(data.especialidad ?? '');
      })
      .catch(e => setError(e instanceof Error ? e.message : 'Error al cargar perfil.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setExito('');

    if (clave && clave !== confirmar) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setGuardando(true);
    try {
      const res = await actualizarMentorPerfil({
        nombre,
        correo,
        especialidad: especialidad || undefined,
        clave: clave || undefined,
      });
      setPerfil(res);
      setClave('');
      setConfirmar('');
      setExito('Perfil actualizado correctamente.');
      setTimeout(() => setExito(''), 3500);

      const stored = localStorage.getItem('user');
      if (stored) {
        const u = JSON.parse(stored);
        localStorage.setItem('user', JSON.stringify({ ...u, nombre: res.nombre, correo: res.correo }));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al actualizar perfil.');
    } finally {
      setGuardando(false);
    }
  };

  const inp = 'w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 outline-none focus:ring-2 focus:ring-teal-50 focus:border-[#0f766e] transition-all';
  const lbl = 'block text-xs font-medium text-gray-600 mb-1.5';

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 border-2 border-[#0f766e] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const iniciales = nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Cabecera */}
      <div>
        <h1 className="text-xl font-medium text-[#0f766e]">Mi Perfil</h1>
        <p className="text-sm text-gray-500 mt-1">Actualiza tu información personal y datos de mentor.</p>
      </div>

      {/* Avatar + nombre actual */}
      <div className="bg-white border border-gray-100 rounded-xl px-6 py-5 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-[#0f766e] text-white flex items-center justify-center text-lg font-semibold shrink-0">
          {iniciales}
        </div>
        <div>
          <p className="text-base font-semibold text-gray-800">{perfil?.nombre}</p>
          <p className="text-sm text-gray-500">{perfil?.correo}</p>
          {perfil?.especialidad && (
            <p className="text-xs text-[#0f766e] font-medium mt-0.5">{perfil.especialidad}</p>
          )}
        </div>
      </div>

      {/* Alertas */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" />{error}
          <button onClick={() => setError('')} className="ml-auto cursor-pointer"><X className="w-4 h-4" /></button>
        </div>
      )}
      {exito && (
        <div className="flex items-center gap-2 text-sm text-teal-700 bg-teal-50 border border-teal-100 rounded-xl px-4 py-3">
          <CheckCircle2 className="w-4 h-4 shrink-0" />{exito}
        </div>
      )}

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Datos personales */}
        <div className="bg-white border border-gray-100 rounded-xl px-6 py-5 space-y-4">
          <p className="text-xs font-semibold text-[#0f766e] uppercase tracking-wide">Datos personales</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Nombre completo *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input required value={nombre} onChange={e => setNombre(e.target.value)}
                  placeholder="Tu nombre completo" className={inp} />
              </div>
            </div>
            <div>
              <label className={lbl}>Correo electrónico *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input required type="email" value={correo} onChange={e => setCorreo(e.target.value)}
                  placeholder="tu@correo.com" className={inp} />
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className={lbl}>Especialidad</label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input value={especialidad} onChange={e => setEspecialidad(e.target.value)}
                  placeholder="Ej: Desarrollo de software, Marketing digital…" className={inp} />
              </div>
            </div>
          </div>
        </div>

        {/* Seguridad */}
        <div className="bg-white border border-gray-100 rounded-xl px-6 py-5 space-y-4">
          <div>
            <p className="text-xs font-semibold text-[#0f766e] uppercase tracking-wide">Seguridad</p>
            <p className="text-xs text-gray-400 mt-0.5">Deja en blanco si no deseas cambiar tu contraseña.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Nueva contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showClave ? 'text' : 'password'}
                  value={clave} onChange={e => setClave(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  className="w-full pl-9 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 outline-none focus:ring-2 focus:ring-teal-50 focus:border-[#0f766e] transition-all"
                />
                <button type="button" onClick={() => setShowClave(!showClave)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
                  {showClave ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className={lbl}>Confirmar contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showConfirmar ? 'text' : 'password'}
                  value={confirmar} onChange={e => setConfirmar(e.target.value)}
                  placeholder="Repite la nueva contraseña"
                  className="w-full pl-9 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 outline-none focus:ring-2 focus:ring-teal-50 focus:border-[#0f766e] transition-all"
                />
                <button type="button" onClick={() => setShowConfirmar(!showConfirmar)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
                  {showConfirmar ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Guardar */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={guardando}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#0f766e] hover:bg-[#115e59] text-white text-sm font-medium rounded-xl transition-colors cursor-pointer disabled:opacity-60"
          >
            {guardando ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Guardando...</>
            ) : (
              <><Save className="w-4 h-4" /> Guardar cambios</>
            )}
          </button>
        </div>

      </form>
    </div>
  );
};
