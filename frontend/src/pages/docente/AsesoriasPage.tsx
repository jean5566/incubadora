import React, { useState, useEffect } from 'react';
import {
  CalendarDays, Plus, X, AlertCircle, ChevronDown, ChevronUp,
  Video, MapPin, Clock, CheckCircle2, XCircle, Pencil, Trash2,
  Link, FileText, User, Save,
} from 'lucide-react';
import {
  getMisProyectosAsignados, getSeguimientosProyecto, getAsesorias,
  crearAsesoria, actualizarAsesoria, eliminarAsesoria,
  type ProyectoConUsuario, type Seguimiento, type Asesoria,
} from '../../api';

const ESTADO_CFG = {
  programada: { label: 'Programada', cls: 'bg-amber-50 text-amber-700 border-amber-200',  icon: Clock },
  realizada:  { label: 'Realizada',  cls: 'bg-teal-50 text-teal-700 border-teal-200',     icon: CheckCircle2 },
  cancelada:  { label: 'Cancelada',  cls: 'bg-red-50 text-red-600 border-red-200',        icon: XCircle },
};

type ProyectoRow = ProyectoConUsuario & { seguimiento: Seguimiento | null };

export const AsesoriasPage: React.FC = () => {
  const [filas, setFilas]     = useState<ProyectoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [abierto, setAbierto] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const proyectos = await getMisProyectosAsignados();
        const rows = await Promise.all(proyectos.map(async p => {
          const segs   = await getSeguimientosProyecto(p.id_proyecto);
          const activo = segs.find(s => !s.fecha_fin) ?? segs[segs.length - 1] ?? null;
          return { ...p, seguimiento: activo };
        }));
        setFilas(rows);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error al cargar proyectos.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 border-2 border-[#0f766e] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-medium text-[#0f766e]">Asesorías</h1>
        <p className="text-sm text-gray-500 mt-1">Programa y gestiona las reuniones con cada emprendedor.</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" />{error}
          <button onClick={() => setError('')} className="ml-auto cursor-pointer"><X className="w-4 h-4" /></button>
        </div>
      )}

      {filas.length === 0 && !error ? (
        <div className="bg-white border border-gray-100 rounded-xl px-6 py-16 text-center">
          <CalendarDays className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-400">No tienes proyectos asignados aún.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filas.map(fila => (
            <ProyectoAsesorias
              key={fila.id_proyecto}
              fila={fila}
              expandido={abierto === fila.id_proyecto}
              onToggle={() => setAbierto(abierto === fila.id_proyecto ? null : fila.id_proyecto)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/* ── Tarjeta por proyecto ─────────────────────────────────────── */
const ProyectoAsesorias: React.FC<{
  fila: ProyectoRow;
  expandido: boolean;
  onToggle: () => void;
}> = ({ fila, expandido, onToggle }) => {
  const [asesorias, setAsesorias] = useState<Asesoria[]>([]);
  const [loaded, setLoaded]       = useState(false);
  const [loadingA, setLoadingA]   = useState(false);
  const [showForm, setShowForm]   = useState(false);
  const [editando, setEditando]   = useState<Asesoria | null>(null);
  const [error, setError]         = useState('');

  const cargar = async () => {
    if (!fila.seguimiento) return;
    setLoadingA(true);
    try {
      const data = await getAsesorias(fila.seguimiento.id_seguimiento);
      setAsesorias(data);
      setLoaded(true);
    } catch {
      setError('No se pudieron cargar las asesorías.');
    } finally {
      setLoadingA(false);
    }
  };

  const handleToggle = () => {
    onToggle();
    if (!loaded && !expandido) cargar();
  };

  const programadas = asesorias.filter(a => a.estado === 'programada').length;
  const realizadas  = asesorias.filter(a => a.estado === 'realizada').length;

  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
      <button
        onClick={handleToggle}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3 text-left min-w-0">
          <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
            <CalendarDays className="w-4 h-4 text-[#0f766e]" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">{fila.nombre_proyecto}</p>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
              <User className="w-3 h-3" />
              {fila.usuario?.nombre ?? '—'}
              {fila.seguimiento?.etapa && (
                <span className="ml-1 text-[#0f766e] font-medium">· {fila.seguimiento.etapa.nombre_etapa}</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-4">
          {loaded && (
            <div className="hidden sm:flex items-center gap-2 text-xs">
              <span className="text-amber-600 font-medium">{programadas} pendiente{programadas !== 1 ? 's' : ''}</span>
              <span className="text-gray-300">·</span>
              <span className="text-teal-600 font-medium">{realizadas} realizada{realizadas !== 1 ? 's' : ''}</span>
            </div>
          )}
          {expandido ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </button>

      {expandido && (
        <div className="border-t border-gray-100 px-5 py-5 space-y-4">
          {error && (
            <p className="text-sm text-red-600 flex items-center gap-1.5"><AlertCircle className="w-4 h-4" />{error}</p>
          )}

          {!fila.seguimiento ? (
            <p className="text-sm text-gray-400 text-center py-4">Este proyecto no tiene una mentoría iniciada.</p>
          ) : (
            <>
              {fila.estado === 'finalizado' ? (
                <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 border border-blue-100 rounded-lg px-4 py-2.5">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  Este proyecto está finalizado. No se pueden agregar más asesorías.
                </div>
              ) : (
                !showForm && !editando && (
                  <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0f766e] text-white text-sm rounded-lg hover:bg-[#115e59] transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Nueva asesoría
                  </button>
                )
              )}

              {showForm && (
                <FormAsesoria
                  onGuardar={async (datos) => {
                    const { data } = await crearAsesoria(fila.seguimiento!.id_seguimiento, datos);
                    setAsesorias(prev => [...prev, data].sort((a, b) => a.fecha.localeCompare(b.fecha)));
                    setShowForm(false);
                  }}
                  onCancelar={() => setShowForm(false)}
                />
              )}

              {editando && (
                <FormAsesoria
                  inicial={editando}
                  onGuardar={async (datos) => {
                    const { data } = await actualizarAsesoria(editando.id_asesoria, datos);
                    setAsesorias(prev => prev.map(a => a.id_asesoria === data.id_asesoria ? data : a));
                    setEditando(null);
                  }}
                  onCancelar={() => setEditando(null)}
                />
              )}

              {loadingA ? (
                <div className="flex justify-center py-8">
                  <div className="w-5 h-5 border-2 border-[#0f766e] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : asesorias.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <CalendarDays className="w-6 h-6 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Sin asesorías programadas aún.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {asesorias.map(a => (
                    <TarjetaAsesoria
                      key={a.id_asesoria}
                      asesoria={a}
                      onEditar={() => { setEditando(a); setShowForm(false); }}
                      onEliminar={async () => {
                        await eliminarAsesoria(a.id_asesoria);
                        setAsesorias(prev => prev.filter(x => x.id_asesoria !== a.id_asesoria));
                      }}
                      onCambiarEstado={async (estado) => {
                        const { data } = await actualizarAsesoria(a.id_asesoria, { estado });
                        setAsesorias(prev => prev.map(x => x.id_asesoria === data.id_asesoria ? data : x));
                      }}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

/* ── Tarjeta individual de asesoría ───────────────────────────── */
const TarjetaAsesoria: React.FC<{
  asesoria: Asesoria;
  onEditar: () => void;
  onEliminar: () => Promise<void>;
  onCambiarEstado: (estado: 'programada' | 'realizada' | 'cancelada') => Promise<void>;
}> = ({ asesoria: a, onEditar, onEliminar, onCambiarEstado }) => {
  const [cargando, setCargando] = useState(false);
  const cfg  = ESTADO_CFG[a.estado];
  const Icon = cfg.icon;

  const accion = async (fn: () => Promise<void>) => {
    setCargando(true);
    try { await fn(); } finally { setCargando(false); }
  };

  return (
    <div className={`rounded-xl border border-gray-100 p-4 ${a.estado === 'cancelada' ? 'opacity-55' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-medium text-gray-800">{a.titulo}</p>
            <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border ${cfg.cls}`}>
              <Icon className="w-3 h-3" /> {cfg.label}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
            <span className="flex items-center gap-1">
              <CalendarDays className="w-3.5 h-3.5" />
              {new Date(a.fecha + 'T00:00:00').toLocaleDateString('es-EC', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {a.hora_inicio}{a.hora_fin ? ` – ${a.hora_fin}` : ''}
            </span>
            <span className="flex items-center gap-1">
              {a.modalidad === 'virtual'
                ? <><Video className="w-3.5 h-3.5 text-blue-500" /> Virtual</>
                : <><MapPin className="w-3.5 h-3.5 text-teal-600" /> Presencial</>}
            </span>
          </div>

          {a.descripcion && (
            <p className="text-xs text-gray-500 leading-relaxed">{a.descripcion}</p>
          )}

          {a.modalidad === 'virtual' && a.enlace && (
            <a href={a.enlace} target="_blank" rel="noreferrer"
               className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline">
              <Link className="w-3 h-3" /> Unirse a la reunión
            </a>
          )}
          {a.modalidad === 'presencial' && a.lugar && (
            <p className="flex items-center gap-1 text-xs text-gray-500">
              <MapPin className="w-3 h-3" /> {a.lugar}
            </p>
          )}

          {a.notas && (
            <div className="mt-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
              <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-1 flex items-center gap-1">
                <FileText className="w-3 h-3" /> Notas de la reunión
              </p>
              <p className="text-xs text-gray-700 whitespace-pre-line">{a.notas}</p>
            </div>
          )}
        </div>

        {a.estado !== 'cancelada' && (
          <div className="flex items-center gap-1 shrink-0">
            {a.estado === 'programada' && (
              <>
                <button onClick={() => accion(() => onCambiarEstado('realizada'))} disabled={cargando}
                  title="Marcar como realizada"
                  className="p-1.5 rounded-lg text-gray-400 hover:text-teal-600 hover:bg-teal-50 transition-colors cursor-pointer disabled:opacity-40">
                  <CheckCircle2 className="w-4 h-4" />
                </button>
                <button onClick={onEditar} disabled={cargando} title="Editar"
                  className="p-1.5 rounded-lg text-gray-400 hover:text-[#0f766e] hover:bg-teal-50 transition-colors cursor-pointer disabled:opacity-40">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => accion(onEliminar)} disabled={cargando} title="Eliminar"
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-40">
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
            {a.estado === 'realizada' && (
              <button onClick={onEditar} disabled={cargando} title="Editar notas"
                className="p-1.5 rounded-lg text-gray-400 hover:text-[#0f766e] hover:bg-teal-50 transition-colors cursor-pointer disabled:opacity-40">
                <Pencil className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

/* ── Formulario crear / editar ────────────────────────────────── */
type FormData = Omit<Asesoria, 'id_asesoria' | 'id_seguimiento'>;

const FormAsesoria: React.FC<{
  inicial?: Asesoria;
  onGuardar: (datos: FormData) => Promise<void>;
  onCancelar: () => void;
}> = ({ inicial, onGuardar, onCancelar }) => {
  const [form, setForm]       = useState<FormData>({
    titulo:      inicial?.titulo      ?? '',
    descripcion: inicial?.descripcion ?? '',
    fecha:       inicial?.fecha       ?? '',
    hora_inicio: inicial?.hora_inicio ?? '',
    hora_fin:    inicial?.hora_fin    ?? '',
    modalidad:   inicial?.modalidad   ?? 'virtual',
    enlace:      inicial?.enlace      ?? '',
    lugar:       inicial?.lugar       ?? '',
    estado:      inicial?.estado      ?? 'programada',
    notas:       inicial?.notas       ?? '',
  });
  const [guardando, setGuardando] = useState(false);
  const [error, setError]         = useState('');

  const set = (k: keyof FormData, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setGuardando(true);
    try {
      await onGuardar({
        ...form,
        descripcion: form.descripcion || null,
        hora_fin:    form.hora_fin    || null,
        enlace:      form.enlace      || null,
        lugar:       form.lugar       || null,
        notas:       form.notas       || null,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al guardar.');
    } finally {
      setGuardando(false);
    }
  };

  const inp = 'w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 outline-none focus:ring-2 focus:ring-teal-100 focus:border-[#0f766e] transition-all';
  const lbl = 'block text-xs font-medium text-gray-600 mb-1';

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
      <p className="text-xs font-semibold text-[#0f766e] uppercase tracking-wide">
        {inicial ? 'Editar asesoría' : 'Nueva asesoría'}
      </p>

      <div>
        <label className={lbl}>Título *</label>
        <input required value={form.titulo} onChange={e => set('titulo', e.target.value)}
          placeholder="Ej: Revisión de modelo de negocio" className={inp} />
      </div>

      <div>
        <label className={lbl}>Descripción</label>
        <textarea value={form.descripcion ?? ''} onChange={e => set('descripcion', e.target.value)}
          rows={2} placeholder="Temas a tratar..." className={`${inp} resize-none`} />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className={lbl}>Fecha *</label>
          <input required type="date" value={form.fecha} onChange={e => set('fecha', e.target.value)} className={inp} />
        </div>
        <div>
          <label className={lbl}>Hora inicio *</label>
          <input required type="time" value={form.hora_inicio} onChange={e => set('hora_inicio', e.target.value)} className={inp} />
        </div>
        <div>
          <label className={lbl}>Hora fin</label>
          <input type="time" value={form.hora_fin ?? ''} onChange={e => set('hora_fin', e.target.value)} className={inp} />
        </div>
      </div>

      <div>
        <label className={lbl}>Modalidad *</label>
        <div className="flex gap-2">
          {(['virtual', 'presencial'] as const).map(m => (
            <button key={m} type="button" onClick={() => set('modalidad', m)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm border transition-colors cursor-pointer
                ${form.modalidad === m ? 'bg-[#0f766e] text-white border-[#0f766e]' : 'bg-white text-gray-600 border-gray-200 hover:border-[#0f766e]'}`}>
              {m === 'virtual' ? <Video className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {form.modalidad === 'virtual' ? (
        <div>
          <label className={lbl}>Enlace de reunión</label>
          <input type="url" value={form.enlace ?? ''} onChange={e => set('enlace', e.target.value)}
            placeholder="https://meet.google.com/..." className={inp} />
        </div>
      ) : (
        <div>
          <label className={lbl}>Lugar</label>
          <input value={form.lugar ?? ''} onChange={e => set('lugar', e.target.value)}
            placeholder="Ej: Sala B, Piso 3" className={inp} />
        </div>
      )}

      {inicial && (
        <>
          <div>
            <label className={lbl}>Estado</label>
            <select value={form.estado} onChange={e => set('estado', e.target.value)} className={inp}>
              <option value="programada">Programada</option>
              <option value="realizada">Realizada</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>
          <div>
            <label className={lbl}>Notas post-reunión</label>
            <textarea value={form.notas ?? ''} onChange={e => set('notas', e.target.value)}
              rows={3} placeholder="Conclusiones, acuerdos, próximos pasos..." className={`${inp} resize-none`} />
          </div>
        </>
      )}

      {error && <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{error}</p>}

      <div className="flex gap-2 pt-1">
        <button type="submit" disabled={guardando}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#0f766e] text-white text-sm rounded-lg hover:bg-[#115e59] transition-colors cursor-pointer disabled:opacity-60">
          <Save className="w-3.5 h-3.5" />
          {guardando ? 'Guardando...' : inicial ? 'Guardar cambios' : 'Programar'}
        </button>
        <button type="button" onClick={onCancelar}
          className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
          Cancelar
        </button>
      </div>
    </form>
  );
};
