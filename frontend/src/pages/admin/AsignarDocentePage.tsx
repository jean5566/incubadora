import React, { useState, useEffect, useRef } from 'react';
import { UserCheck, Search, AlertCircle, X, CheckCircle, RefreshCw } from 'lucide-react';
import {
  getProyectosAprobados,
  getMentoresActivos,
  getAsignaciones,
  crearAsignacion,
  eliminarAsignacion,
  type ProyectoAprobado,
  type UsuarioAdmin,
  type AsignacionDetalle,
} from '../../api';

// Modal de búsqueda de mentor
interface ModalProps {
  mentores: UsuarioAdmin[];
  onConfirmar: (mentor: UsuarioAdmin) => void;
  onCerrar: () => void;
  saving: boolean;
}

const ModalBuscarMentor: React.FC<ModalProps> = ({ mentores, onConfirmar, onCerrar, saving }) => {
  const [busqueda, setBusqueda] = useState('');
  const [seleccionado, setSeleccionado] = useState<UsuarioAdmin | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const filtrados = mentores.filter(m =>
    m.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    m.correo.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-medium text-[#1A365D]">Seleccionar mentor</h2>
          <button onClick={onCerrar} className="text-gray-400 hover:text-gray-600 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Buscador */}
        <div className="px-5 py-3 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Buscar mentor por nombre o correo…"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-50 focus:border-[#1A365D] transition-all"
            />
          </div>
        </div>

        {/* Lista */}
        <div className="max-h-64 overflow-y-auto divide-y divide-gray-50">
          {filtrados.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-8">No se encontraron mentores.</p>
          ) : (
            filtrados.map(m => (
              <button
                key={m.id_usuario}
                onClick={() => setSeleccionado(m)}
                className={`w-full flex items-center gap-3 px-5 py-3 text-left transition-colors cursor-pointer
                  ${seleccionado?.id_usuario === m.id_usuario
                    ? 'bg-blue-50'
                    : 'hover:bg-gray-50'}`}
              >
                <div className="w-8 h-8 rounded-full bg-[#1A365D] text-white flex items-center justify-center text-xs font-medium shrink-0">
                  {m.nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{m.nombre}</p>
                  <p className="text-xs text-gray-400 truncate">{m.correo}</p>
                </div>
                {seleccionado?.id_usuario === m.id_usuario && (
                  <CheckCircle className="w-4 h-4 text-blue-500 ml-auto shrink-0" />
                )}
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-100">
          <button
            onClick={onCerrar}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={() => seleccionado && onConfirmar(seleccionado)}
            disabled={!seleccionado || saving}
            className="px-4 py-2 bg-[#1A365D] text-white text-sm rounded-lg hover:bg-[#0F2442] transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-2"
          >
            {saving && <span className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />}
            Asignar
          </button>
        </div>
      </div>
    </div>
  );
};

// Página principal
export const AsignarDocentePage: React.FC = () => {
  const [proyectos, setProyectos]       = useState<ProyectoAprobado[]>([]);
  const [mentores, setMentores]         = useState<UsuarioAdmin[]>([]);
  const [asignaciones, setAsignaciones] = useState<AsignacionDetalle[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [modal, setModal]               = useState<number | null>(null); // id_proyecto con modal abierto
  const [saving, setSaving]             = useState(false);
  const [exito, setExito]               = useState<number | null>(null);

  const cargar = async () => {
    setLoading(true);
    setError('');

    let proyectosCargados: ProyectoAprobado[]    = [];
    let mentoresCargados: UsuarioAdmin[]          = [];
    let asignacionesCargadas: AsignacionDetalle[] = [];

    try { proyectosCargados   = await getProyectosAprobados(); }
    catch (e) { setError(e instanceof Error ? e.message : 'Error al cargar proyectos.'); }

    try { mentoresCargados = await getMentoresActivos(); }
    catch (e) { setError(e instanceof Error ? e.message : 'Error al cargar mentores.'); }

    try { asignacionesCargadas = await getAsignaciones(); }
    catch (e) { setError(e instanceof Error ? e.message : 'Error al cargar asignaciones.'); }

    setProyectos(proyectosCargados);
    setMentores(mentoresCargados);
    setAsignaciones(asignacionesCargadas);
    setLoading(false);
  };

  useEffect(() => { cargar(); }, []);

  const mentorDe = (id_proyecto: number): AsignacionDetalle | undefined =>
    asignaciones.find(a => a.id_proyecto === id_proyecto && a.usuario?.rol === 'mentor');

  const handleConfirmar = async (mentor: UsuarioAdmin) => {
    if (!modal) return;
    setSaving(true);
    try {
      const actual = mentorDe(modal);
      if (actual) await eliminarAsignacion(actual.id_asignacion);

      const res = await crearAsignacion({ id_proyecto: modal, id_usuario: mentor.id_usuario });
      setAsignaciones(prev => [
        ...prev.filter(a => !(a.id_proyecto === modal && a.usuario?.rol === 'mentor')),
        res.data,
      ]);
      setModal(null);
      setExito(modal);
      setTimeout(() => setExito(null), 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al asignar mentor.');
    } finally {
      setSaving(false);
    }
  };

  const handleQuitar = async (id_asignacion: number) => {
    try {
      await eliminarAsignacion(id_asignacion);
      setAsignaciones(prev => prev.filter(a => a.id_asignacion !== id_asignacion));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al quitar mentor.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-[#1A365D] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const conMentor    = proyectos.filter(p => mentorDe(p.id_proyecto)).length;
  const sinMentor    = proyectos.length - conMentor;

  return (
    <>
      {modal !== null && (
        <ModalBuscarMentor
          mentores={mentores}
          saving={saving}
          onConfirmar={handleConfirmar}
          onCerrar={() => setModal(null)}
        />
      )}

      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-medium text-[#1A365D]">Asignar Mentor</h1>
            <p className="text-sm text-gray-500 mt-1">Proyectos aprobados — asigna o reasigna un mentor tutor.</p>
          </div>
          <button
            onClick={cargar}
            className="flex items-center gap-2 px-4 py-2 text-sm font-normal text-[#1A365D] border border-blue-200 rounded-xl hover:bg-[#EBF8FF] transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" /> Actualizar
          </button>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-blue-50 border border-blue-100 rounded-xl px-5 py-4">
            <p className="text-2xl font-semibold text-blue-700">{proyectos.length}</p>
            <p className="text-xs text-blue-600 opacity-80 mt-0.5">Proyectos aprobados</p>
          </div>
          <div className="bg-green-50 border border-green-100 rounded-xl px-5 py-4">
            <p className="text-2xl font-semibold text-green-700">{conMentor}</p>
            <p className="text-xs text-green-600 opacity-80 mt-0.5">Con mentor asignado</p>
          </div>
          <div className="bg-yellow-50 border border-yellow-100 rounded-xl px-5 py-4">
            <p className="text-2xl font-semibold text-yellow-700">{sinMentor}</p>
            <p className="text-xs text-yellow-600 opacity-80 mt-0.5">Sin mentor</p>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            <AlertCircle className="w-4 h-4 shrink-0" />{error}
            <button onClick={() => setError('')} className="ml-auto cursor-pointer"><X className="w-4 h-4" /></button>
          </div>
        )}

        {proyectos.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-xl px-6 py-12 text-center">
            <UserCheck className="w-8 h-8 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-400 font-medium">No hay proyectos aprobados aún.</p>
            <p className="text-xs text-gray-400 mt-1">Aprueba proyectos en la sección "Aprobar Proyectos".</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-5 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proyecto</th>
                  <th className="px-5 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Emprendedor</th>
                  <th className="px-5 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mentor Asignado</th>
                  <th className="px-5 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Fecha Asignación</th>
                  <th className="px-5 py-3.5 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {proyectos.map(p => {
                  const mentorActual = mentorDe(p.id_proyecto);
                  return (
                    <tr key={p.id_proyecto} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-medium text-gray-800">{p.nombre_proyecto}</p>
                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{p.descripcion}</p>
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell">
                        <p className="text-gray-700 text-sm">{p.usuario?.nombre ?? '—'}</p>
                        <p className="text-xs text-gray-400">{p.usuario?.correo}</p>
                      </td>
                      <td className="px-5 py-4">
                        {mentorActual ? (
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-[#1A365D] text-white flex items-center justify-center text-xs font-medium shrink-0">
                              {mentorActual.usuario?.nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-gray-700 font-medium text-sm truncate">{mentorActual.usuario?.nombre}</p>
                              <p className="text-xs text-gray-400 truncate">{mentorActual.usuario?.correo}</p>
                            </div>
                            <button
                              onClick={() => handleQuitar(mentorActual.id_asignacion)}
                              className="ml-1 p-1 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                              title="Quitar mentor"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 bg-yellow-50 text-yellow-600 text-xs rounded-full border border-yellow-100">Sin asignar</span>
                        )}
                      </td>
                      <td className="px-5 py-4 hidden lg:table-cell">
                        {mentorActual?.fecha ? (
                          <div>
                            <p className="text-sm text-gray-700">
                              {new Date(mentorActual.fecha).toLocaleDateString('es-EC', { year: 'numeric', month: 'short', day: '2-digit' })}
                            </p>
                            <p className="text-xs text-gray-400">
                              {new Date(mentorActual.fecha).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        ) : (
                          <span className="text-gray-300 text-sm">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setModal(p.id_proyecto)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1A365D] text-white text-xs rounded-lg hover:bg-[#0F2442] transition-colors cursor-pointer"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            {mentorActual ? 'Cambiar' : 'Asignar'}
                          </button>
                          {exito === p.id_proyecto && (
                            <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};
