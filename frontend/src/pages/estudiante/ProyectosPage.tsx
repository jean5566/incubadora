import React, { useEffect, useState } from 'react';
import { FolderKanban, Plus, X, ClipboardList, Calendar, Tag, Lightbulb, Target, FileText, User } from 'lucide-react';
import { getMisProyectos, crearProyecto, type Proyecto } from '../../api';

const ESTADO_COLOR: Record<string, string> = {
  pendiente:   'bg-yellow-100 text-yellow-700',
  activo:      'bg-green-100 text-green-700',
  finalizado:  'bg-blue-100 text-blue-700',
  rechazado:   'bg-red-100 text-red-600',
};

const ESTADO_LABEL: Record<string, string> = {
  pendiente:  'Pendiente',
  activo:     'Activo',
  finalizado: 'Finalizado',
  rechazado:  'Rechazado',
};

export const ProyectosPage: React.FC = () => {
  const [proyectos, setProyectos]     = useState<Proyecto[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [showModal, setShowModal]     = useState(false);
  const [detalle, setDetalle]         = useState<Proyecto | null>(null);

  // form
  const [nombre, setNombre]                   = useState('');
  const [descripcion, setDescripcion]         = useState('');
  const [sector, setSector]                   = useState('');
  const [problema, setProblema]               = useState('');
  const [propuesta, setPropuesta]             = useState('');
  const [saving, setSaving]                   = useState(false);
  const [formError, setFormError]             = useState('');

  const load = () => {
    setLoading(true);
    setError('');
    getMisProyectos()
      .then(setProyectos)
      .catch(() => setError('No se pudieron cargar los proyectos.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      const { data } = await crearProyecto({
        nombre_proyecto:    nombre,
        descripcion,
        sector_tecnologico: sector     || undefined,
        problema_resuelve:  problema   || undefined,
        propuesta_valor:    propuesta  || undefined,
      });
      setProyectos(prev => [data, ...prev]);
      setNombre('');
      setDescripcion('');
      setSector('');
      setProblema('');
      setPropuesta('');
      setShowModal(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Error al crear el proyecto.');
    } finally {
      setSaving(false);
    }
  };

  const inputCls = 'w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-800 outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1A365D] transition-all';
  const labelCls = 'block text-xs font-medium text-[#1A365D] uppercase tracking-wide mb-1';

  return (
    <>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-medium text-[#1A365D]">Mis Proyectos</h1>
            <p className="text-sm text-gray-500 font-medium mt-0.5">
              {proyectos.length} proyecto{proyectos.length !== 1 ? 's' : ''} registrado{proyectos.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#1A365D] hover:bg-[#0F2442] text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Nuevo proyecto
          </button>
        </div>

        {/* Error */}
        {error && (
          <p className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm font-normal text-red-600">{error}</p>
        )}

        {/* Lista */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400">
            <div className="w-6 h-6 border-2 border-blue-200 border-t-[#1A365D] rounded-full animate-spin mr-3" />
            Cargando proyectos...
          </div>
        ) : proyectos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-lg border border-gray-100 text-gray-400">
            <FolderKanban className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm font-normal text-gray-500">Aún no tienes proyectos registrados</p>
            <p className="text-xs font-medium text-gray-400 mt-1">Crea tu primer proyecto con el botón de arriba</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {proyectos.map(p => (
              <div
                key={p.id_proyecto}
                onClick={() => setDetalle(p)}
                className="bg-white rounded-lg border border-gray-100 p-5 cursor-pointer hover:shadow-md hover:border-[#1A365D]/20 transition-all"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <FolderKanban className="w-4 h-4 text-[#1A365D] mt-0.5 shrink-0" />
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${ESTADO_COLOR[p.estado]}`}>
                    {ESTADO_LABEL[p.estado]}
                  </span>
                </div>

                <h3 className="text-sm font-medium text-gray-800 mb-1 line-clamp-1">{p.nombre_proyecto}</h3>
                <p className="text-xs text-gray-500 font-medium line-clamp-2 mb-3">{p.descripcion}</p>

                <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                  <Calendar className="w-3.5 h-3.5" />
                  {p.fecha_registro
                    ? new Date(p.fecha_registro.replace(' ', 'T')).toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' })
                    : '—'}
                </div>
                {p.docente && (
                  <div className="flex items-center gap-1.5 text-xs text-teal-600 font-medium mt-1.5">
                    <User className="w-3.5 h-3.5" />
                    Mentor: {p.docente.nombre}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Modal detalle proyecto */}
      {detalle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-lg w-full max-w-xl max-h-[90vh] flex flex-col">

            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <FolderKanban className="w-5 h-5 text-[#1A365D]" />
                <h2 className="text-base font-medium text-[#1A365D] line-clamp-1">{detalle.nombre_proyecto}</h2>
              </div>
              <button onClick={() => setDetalle(null)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-5 overflow-y-auto flex-1">

              {/* Estado y fecha */}
              <div className="flex items-center gap-3">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${ESTADO_COLOR[detalle.estado]}`}>
                  {ESTADO_LABEL[detalle.estado]}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Calendar className="w-3.5 h-3.5" />
                  {detalle.fecha_registro
                    ? new Date(detalle.fecha_registro.replace(' ', 'T')).toLocaleDateString('es-EC', { day: '2-digit', month: 'long', year: 'numeric' })
                    : '—'}
                </span>
              </div>

              {/* Descripción */}
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#1A365D]" />
                  <p className="text-xs font-medium text-[#1A365D] uppercase tracking-wide">Descripción</p>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{detalle.descripcion || '—'}</p>
              </div>

              {/* Sector */}
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Tag className="w-3.5 h-3.5 text-[#1A365D]" />
                  <p className="text-xs font-medium text-[#1A365D] uppercase tracking-wide">Sector Tecnológico</p>
                </div>
                <p className="text-sm text-gray-700">{detalle.sector_tecnologico || <span className="text-gray-400 italic">No especificado</span>}</p>
              </div>

              {/* Problema */}
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-[#1A365D]" />
                  <p className="text-xs font-medium text-[#1A365D] uppercase tracking-wide">Problema que Resuelve</p>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{detalle.problema_resuelve || <span className="text-gray-400 italic">No especificado</span>}</p>
              </div>

              {/* Propuesta de valor */}
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Target className="w-3.5 h-3.5 text-[#1A365D]" />
                  <p className="text-xs font-medium text-[#1A365D] uppercase tracking-wide">Propuesta de Valor</p>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{detalle.propuesta_valor || <span className="text-gray-400 italic">No especificada</span>}</p>
              </div>

              {/* Mentor asignado */}
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <User className="w-3.5 h-3.5 text-[#1A365D]" />
                  <p className="text-xs font-medium text-[#1A365D] uppercase tracking-wide">Mentor Asignado</p>
                </div>
                {detalle.docente
                  ? (
                    <div className="flex items-center gap-2 px-3 py-2 bg-teal-50 border border-teal-100 rounded-lg">
                      <div className="w-7 h-7 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-medium shrink-0">
                        {detalle.docente.nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-teal-800">{detalle.docente.nombre}</p>
                        <p className="text-xs text-teal-600">{detalle.docente.correo}</p>
                      </div>
                    </div>
                  )
                  : <p className="text-sm text-gray-400 italic">Aún no se ha asignado un mentor.</p>
                }
              </div>

            </div>

            <div className="px-6 py-4 border-t border-gray-100 shrink-0">
              <button
                onClick={() => setDetalle(null)}
                className="w-full py-2.5 text-sm font-normal text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Modal nuevo proyecto */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col">

            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-[#1A365D]" />
                <h2 className="text-base font-medium text-[#1A365D]">Registrar Proyecto</h2>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <form id="form-proyecto" onSubmit={handleSubmit} className="px-6 py-5 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className={labelCls}>Nombre del proyecto</label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={e => setNombre(e.target.value)}
                  className={inputCls}
                  placeholder="Ej: App de gestión académica"
                />
              </div>
              <div>
                <label className={labelCls}>Descripción</label>
                <textarea
                  required
                  value={descripcion}
                  onChange={e => setDescripcion(e.target.value)}
                  rows={3}
                  className={`${inputCls} resize-none`}
                  placeholder="Describe brevemente tu proyecto y su objetivo..."
                />
              </div>
              <div>
                <label className={labelCls}>Sector Tecnológico</label>
                <input
                  type="text"
                  value={sector}
                  onChange={e => setSector(e.target.value)}
                  className={inputCls}
                  placeholder="Ej: Fintech, Edtech, Salud digital..."
                />
              </div>
              <div>
                <label className={labelCls}>Problema que Resuelve</label>
                <textarea
                  value={problema}
                  onChange={e => setProblema(e.target.value)}
                  rows={3}
                  className={`${inputCls} resize-none`}
                  placeholder="¿Qué problema o necesidad atiende tu proyecto?"
                />
              </div>
              <div>
                <label className={labelCls}>Propuesta de Valor</label>
                <textarea
                  value={propuesta}
                  onChange={e => setPropuesta(e.target.value)}
                  rows={3}
                  className={`${inputCls} resize-none`}
                  placeholder="¿Por qué tu solución es única o diferente?"
                />
              </div>

              {formError && (
                <p className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm font-normal text-red-600">{formError}</p>
              )}
            </form>

            <div className="px-6 py-4 border-t border-gray-100 flex gap-3 shrink-0">
              <button
                type="submit"
                form="form-proyecto"
                disabled={saving}
                className="flex-1 py-2.5 bg-[#1A365D] hover:bg-[#0F2442] text-white text-sm font-medium rounded-lg transition-colors cursor-pointer disabled:opacity-60"
              >
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Registrando...
                  </span>
                ) : 'Registrar proyecto'}
              </button>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2.5 text-sm font-normal text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
