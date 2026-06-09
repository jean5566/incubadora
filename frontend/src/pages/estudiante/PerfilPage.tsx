import React, { useState, useEffect } from 'react';
import {
  User, Mail, Phone, BookOpen, GraduationCap,
  FileText, Lock, Save, AlertCircle, CheckCircle2, X, Eye, EyeOff,
} from 'lucide-react';
import { getPerfilEmprendedor, actualizarPerfilEmprendedor, type PerfilEmprendedor } from '../../api';

export const PerfilEmprendedorPage: React.FC = () => {
  const [perfil, setPerfil]       = useState<PerfilEmprendedor | null>(null);
  const [loading, setLoading]     = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError]         = useState('');
  const [exito, setExito]         = useState('');
  const [showClave, setShowClave] = useState(false);

  // form
  const [nombre,      setNombre]      = useState('');
  const [correo,      setCorreo]      = useState('');
  const [telefono,    setTelefono]    = useState('');
  const [carrera,  setCarrera]  = useState('');
  const [semestre, setSemestre] = useState('');
  const [bio,      setBio]      = useState('');
  const [clave,       setClave]       = useState('');

  useEffect(() => {
    getPerfilEmprendedor()
      .then(p => {
        setPerfil(p);
        setNombre(p.nombre);
        setCorreo(p.correo);
        setTelefono(p.telefono ?? '');
        setCarrera(p.carrera ?? '');
        setSemestre(p.semestre ?? '');
        setBio(p.bio ?? '');
      })
      .catch(e => setError(e instanceof Error ? e.message : 'Error al cargar el perfil.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setExito('');
    setGuardando(true);
    try {
      const updated = await actualizarPerfilEmprendedor({
        nombre,
        correo,
        telefono:    telefono    || null,
        carrera:  carrera  || null,
        semestre: semestre || null,
        bio:      bio      || null,
        ...(clave ? { clave } : {}),
      });
      setPerfil(updated);
      setClave('');
      setExito('Perfil actualizado correctamente.');
      setTimeout(() => setExito(''), 3500);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al guardar el perfil.');
    } finally {
      setGuardando(false);
    }
  };

  const inp = 'w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1A365D] transition-all';
  const lbl = 'block text-xs font-medium text-gray-600 mb-1.5';

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 border-2 border-[#1A365D] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const iniciales = nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Cabecera */}
      <div>
        <h1 className="text-xl font-medium text-[#1A365D]">Mi Perfil</h1>
        <p className="text-sm text-gray-500 mt-1">Mantén tu información actualizada para que tu mentor te conozca mejor.</p>
      </div>

      {/* Avatar + nombre actual */}
      <div className="bg-white border border-gray-100 rounded-xl px-6 py-5 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-[#1A365D] text-white flex items-center justify-center text-lg font-semibold shrink-0">
          {iniciales}
        </div>
        <div>
          <p className="text-base font-semibold text-gray-800">{perfil?.nombre}</p>
          <p className="text-sm text-gray-500">{perfil?.correo}</p>
          {perfil?.carrera && (
            <p className="text-xs text-[#1A365D] font-medium mt-0.5">{perfil.carrera}{perfil.semestre ? ` · ${perfil.semestre}` : ''}</p>
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
          <p className="text-xs font-semibold text-[#1A365D] uppercase tracking-wide">Datos personales</p>

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
            <div>
              <label className={lbl}>Teléfono</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input value={telefono} onChange={e => setTelefono(e.target.value)}
                  placeholder="+593 99 000 0000" className={inp} />
              </div>
            </div>
          </div>

          <div>
            <label className={lbl}>Sobre mí</label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3}
                placeholder="Cuéntale a tu mentor quién eres, tu experiencia y tus metas como emprendedor..."
                className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 outline-none resize-none focus:ring-2 focus:ring-blue-100 focus:border-[#1A365D] transition-all" />
            </div>
          </div>
        </div>

        {/* Datos académicos */}
        <div className="bg-white border border-gray-100 rounded-xl px-6 py-5 space-y-4">
          <p className="text-xs font-semibold text-[#1A365D] uppercase tracking-wide">Información académica</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Carrera</label>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input value={carrera} onChange={e => setCarrera(e.target.value)}
                  placeholder="Ej: Ingeniería en Sistemas" className={inp} />
              </div>
            </div>
            <div>
              <label className={lbl}>Semestre / Año</label>
              <div className="relative">
                <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input value={semestre} onChange={e => setSemestre(e.target.value)}
                  placeholder="Ej: 6to semestre" className={inp} />
              </div>
            </div>
          </div>
        </div>

        {/* Cambiar contraseña */}
        <div className="bg-white border border-gray-100 rounded-xl px-6 py-5 space-y-4">
          <div>
            <p className="text-xs font-semibold text-[#1A365D] uppercase tracking-wide">Seguridad</p>
            <p className="text-xs text-gray-400 mt-0.5">Deja en blanco si no deseas cambiar tu contraseña.</p>
          </div>
          <div>
            <label className={lbl}>Nueva contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={showClave ? 'text' : 'password'}
                value={clave} onChange={e => setClave(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                className="w-full pl-9 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1A365D] transition-all"
              />
              <button type="button" onClick={() => setShowClave(!showClave)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
                {showClave ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Guardar */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={guardando}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#1A365D] hover:bg-[#0F2442] text-white text-sm font-medium rounded-xl transition-colors cursor-pointer disabled:opacity-60"
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
