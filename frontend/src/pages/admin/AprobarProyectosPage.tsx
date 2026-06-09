import React, { useEffect, useState } from 'react';
import { ClipboardCheck, Search, RefreshCw, Eye, X, User, Calendar, FileText, CheckCircle, Cpu, AlertCircle, Lightbulb } from 'lucide-react';
import { getTodosProyectos, cambiarEstadoProyecto, type ProyectoConUsuario, type Proyecto } from '../../api';

const ESTADO_COLOR: Record<string, string> = {
  pendiente:  'bg-yellow-100 text-yellow-700',
  activo:     'bg-green-100 text-green-700',
  finalizado: 'bg-blue-100 text-blue-700',
  rechazado:  'bg-red-100 text-red-600',
};

const ESTADO_LABEL: Record<string, string> = {
  pendiente:  'Pendiente',
  activo:     'Aprobado',
  finalizado: 'Finalizado',
  rechazado:  'Rechazado',
};

const ESTADOS: Proyecto['estado'][] = ['pendiente', 'activo', 'finalizado', 'rechazado'];
const ESTADOS_MODAL: Proyecto['estado'][] = ['pendiente', 'activo', 'rechazado'];

// ── Modal detalle ─────────────────────────────────────────────────────────────

interface DetalleModalProps {
  proyecto: ProyectoConUsuario;
  onClose: () => void;
  onEstadoChange: (id: number, estado: Proyecto['estado']) => Promise<void>;
}

const DetalleModal: React.FC<DetalleModalProps> = ({ proyecto, onClose, onEstadoChange }) => {
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');
  const [estado, setEstado] = useState<Proyecto['estado']>(proyecto.estado);

  const handleGuardar = async () => {
    if (estado === proyecto.estado) { onClose(); return; }
    setSaving(true);
    setError('');
    try {
      await onEstadoChange(proyecto.id_proyecto, estado);
      onClose();
    } catch {
      setError('Error al actualizar el estado.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-[#1A365D]" />
            <h2 className="text-base font-medium text-[#1A365D]">Detalle del Proyecto</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5 flex-1 overflow-y-auto">

          {/* Nombre */}
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
              <FileText className="w-3.5 h-3.5" /> Proyecto
            </div>
            <p className="text-base font-medium text-gray-800">{proyecto.nombre_proyecto}</p>
          </div>

          {/* Descripción */}
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
              <FileText className="w-3.5 h-3.5" /> Descripción
            </div>
            <p className="text-sm text-gray-600 font-medium leading-relaxed bg-gray-50 rounded-lg p-3 border border-gray-100">
              {proyecto.descripcion}
            </p>
          </div>

          {/* Sector tecnológico */}
          {proyecto.sector_tecnologico && (
            <div>
              <div className="flex items-center gap-2 text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
                <Cpu className="w-3.5 h-3.5" /> Sector Tecnológico
              </div>
              <p className="text-sm text-gray-600 font-medium bg-gray-50 rounded-lg p-3 border border-gray-100">
                {proyecto.sector_tecnologico}
              </p>
            </div>
          )}

          {/* Problema que resuelve */}
          {proyecto.problema_resuelve && (
            <div>
              <div className="flex items-center gap-2 text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
                <AlertCircle className="w-3.5 h-3.5" /> Problema que Resuelve
              </div>
              <p className="text-sm text-gray-600 font-medium leading-relaxed bg-gray-50 rounded-lg p-3 border border-gray-100">
                {proyecto.problema_resuelve}
              </p>
            </div>
          )}

          {/* Propuesta de valor */}
          {proyecto.propuesta_valor && (
            <div>
              <div className="flex items-center gap-2 text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
                <Lightbulb className="w-3.5 h-3.5" /> Propuesta de Valor
              </div>
              <p className="text-sm text-gray-600 font-medium leading-relaxed bg-gray-50 rounded-lg p-3 border border-gray-100">
                {proyecto.propuesta_valor}
              </p>
            </div>
          )}

          {/* Emprendedor + Fecha */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
                <User className="w-3.5 h-3.5" /> Emprendedor
              </div>
              <p className="text-sm font-normal text-gray-800">{proyecto.usuario?.nombre ?? '—'}</p>
              <p className="text-xs text-gray-400 font-medium">{proyecto.usuario?.correo ?? ''}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
                <Calendar className="w-3.5 h-3.5" /> Fecha de registro
              </div>
              <p className="text-sm font-normal text-gray-800">
                {new Date(proyecto.fecha_registro.replace(' ', 'T')).toLocaleDateString('es-EC', { day: '2-digit', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Estado actual */}
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
              <CheckCircle className="w-3.5 h-3.5" /> Estado actual
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${ESTADO_COLOR[proyecto.estado]}`}>
              {ESTADO_LABEL[proyecto.estado]}
            </span>
          </div>

          {/* Cambiar estado */}
          {proyecto.estado !== 'finalizado' && (
            <div>
              <label className="block text-xs font-medium text-[#1A365D] uppercase tracking-wider mb-2">
                Cambiar estado
              </label>
              <div className="grid grid-cols-2 gap-2">
                {ESTADOS_MODAL.map(e => (
                  <button
                    key={e}
                    onClick={() => setEstado(e)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border-2 text-sm font-medium transition-all cursor-pointer
                      ${estado === e
                        ? 'border-[#1A365D] bg-[#EBF8FF] text-[#1A365D]'
                        : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-300'}`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${ESTADO_COLOR[e].split(' ')[0]}`} />
                    {ESTADO_LABEL[e]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && (
            <p className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm font-normal text-red-600">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
          <button
            onClick={handleGuardar}
            disabled={saving}
            className="px-8 py-2.5 bg-[#1A365D] hover:bg-[#0F2442] text-white text-sm font-medium rounded-lg transition-colors cursor-pointer disabled:opacity-60"
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Guardando...
              </span>
            ) : 'Guardar cambios'}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-normal text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
        </div>

      </div>
    </div>
  );
};

// ── Página principal ──────────────────────────────────────────────────────────

export const AprobarProyectosPage: React.FC = () => {
  const [proyectos, setProyectos]     = useState<ProyectoConUsuario[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [search, setSearch]           = useState('');
  const [filtro, setFiltro]           = useState<'todos' | Proyecto['estado']>('todos');
  const [detalle, setDetalle]         = useState<ProyectoConUsuario | null>(null);

  const load = () => {
    setLoading(true);
    setError('');
    getTodosProyectos()
      .then(setProyectos)
      .catch(() => setError('No se pudieron cargar los proyectos.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleEstadoChange = async (id: number, estado: Proyecto['estado']) => {
    const { data } = await cambiarEstadoProyecto(id, estado);
    setProyectos(prev => prev.map(p => p.id_proyecto === id ? { ...p, estado: data.estado } : p));
  };

  const filtered = proyectos.filter(p => {
    const q = search.toLowerCase();
    const matchSearch =
      p.nombre_proyecto.toLowerCase().includes(q) ||
      (p.usuario?.nombre ?? '').toLowerCase().includes(q) ||
      (p.usuario?.correo ?? '').toLowerCase().includes(q);
    const matchFiltro = filtro === 'todos' || p.estado === filtro;
    return matchSearch && matchFiltro;
  });

  const pendientes  = proyectos.filter(p => p.estado === 'pendiente').length;
  const activos     = proyectos.filter(p => p.estado === 'activo').length;
  const finalizados = proyectos.filter(p => p.estado === 'finalizado').length;
  const rechazados  = proyectos.filter(p => p.estado === 'rechazado').length;

  return (
    <>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-medium text-[#1A365D]">Aprobar Proyectos</h1>
            <p className="text-sm text-gray-500 mt-0.5">{proyectos.length} proyectos registrados en el sistema.</p>
          </div>
          <button
            onClick={load}
            className="flex items-center gap-2 px-4 py-2 text-sm font-normal text-[#1A365D] border border-blue-200 rounded-xl hover:bg-[#EBF8FF] transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" /> Actualizar
          </button>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Pendientes',  value: pendientes,  color: 'bg-yellow-50 border-yellow-100', text: 'text-yellow-700' },
            { label: 'Aprobados',   value: activos,     color: 'bg-green-50 border-green-100',   text: 'text-green-700'  },
            { label: 'Finalizados', value: finalizados, color: 'bg-blue-50 border-blue-100',     text: 'text-blue-700'   },
            { label: 'Rechazados',  value: rechazados,  color: 'bg-red-50 border-red-100',       text: 'text-red-600'    },
          ].map(({ label, value, color, text }) => (
            <div key={label} className={`border rounded-xl px-5 py-4 ${color}`}>
              <p className={`text-2xl font-semibold ${text}`}>{value}</p>
              <p className={`text-xs mt-0.5 ${text} opacity-80`}>{label}</p>
            </div>
          ))}
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por proyecto o estudiante..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-800 outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1A365D] transition-all"
            />
          </div>
          <select
            value={filtro}
            onChange={e => setFiltro(e.target.value as typeof filtro)}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-800 outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1A365D] transition-all cursor-pointer"
          >
            <option value="todos">Todos los estados</option>
            {ESTADOS.map(e => <option key={e} value={e}>{ESTADO_LABEL[e]}</option>)}
          </select>
        </div>

        {error && (
          <p className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm font-normal text-red-600">{error}</p>
        )}

        {/* Tabla */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-gray-400">
              <div className="w-6 h-6 border-2 border-blue-200 border-t-[#3182CE] rounded-full animate-spin mr-3" />
              Cargando proyectos...
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <ClipboardCheck className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm font-medium">No hay proyectos que mostrar</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3.5 font-medium text-gray-500 uppercase tracking-wider text-xs">#</th>
                  <th className="text-left px-5 py-3.5 font-medium text-gray-500 uppercase tracking-wider text-xs">Proyecto</th>
                  <th className="text-left px-5 py-3.5 font-medium text-gray-500 uppercase tracking-wider text-xs hidden md:table-cell">Estudiante</th>
                  <th className="text-left px-5 py-3.5 font-medium text-gray-500 uppercase tracking-wider text-xs hidden lg:table-cell">Fecha</th>
                  <th className="text-left px-5 py-3.5 font-medium text-gray-500 uppercase tracking-wider text-xs">Estado</th>
                  <th className="text-right px-5 py-3.5 font-medium text-gray-500 uppercase tracking-wider text-xs">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(p => (
                  <tr key={p.id_proyecto} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-4 text-gray-400 font-medium">{p.id_proyecto}</td>
                    <td className="px-5 py-4">
                      <p className="font-normal text-gray-800 line-clamp-1">{p.nombre_proyecto}</p>
                      <p className="text-xs text-gray-400 font-medium mt-0.5 line-clamp-1">{p.descripcion}</p>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <p className="font-normal text-gray-700 text-xs">{p.usuario?.nombre ?? '—'}</p>
                      <p className="text-xs text-gray-400">{p.usuario?.correo ?? ''}</p>
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-400 font-medium hidden lg:table-cell">
                      {new Date(p.fecha_registro.replace(' ', 'T')).toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${ESTADO_COLOR[p.estado]}`}>
                        {ESTADO_LABEL[p.estado]}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => setDetalle(p)}
                        title="Ver detalles"
                        className="p-2 bg-[#EBF8FF] hover:bg-blue-100 text-[#1A365D] rounded-lg transition-colors cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>

      {/* Modal detalle */}
      {detalle && (
        <DetalleModal
          proyecto={proyectos.find(p => p.id_proyecto === detalle.id_proyecto) ?? detalle}
          onClose={() => setDetalle(null)}
          onEstadoChange={handleEstadoChange}
        />
      )}
    </>
  );
};
