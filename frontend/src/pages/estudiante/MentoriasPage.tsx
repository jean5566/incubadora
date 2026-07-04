import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen, AlertCircle, X, Upload, FileText,
  Send, ChevronDown, ChevronUp, Plus, MessageSquare,
  CalendarDays, Clock, Video, MapPin, Link, CheckCircle2, XCircle, Trophy, User,
  ClipboardList, GraduationCap, Paperclip, Download,
} from 'lucide-react';
import {
  getMisMentorias, getRevisiones, crearRevision, getAsesorias, descargarDocumento,
  type Proyecto, type Seguimiento, type Revision, type Asesoria,
} from '../../api';

const ESTADO_ASESORIA = {
  programada: { label: 'Programada', cls: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock },
  realizada:  { label: 'Realizada',  cls: 'bg-teal-50 text-teal-700 border-teal-200',   icon: CheckCircle2 },
  cancelada:  { label: 'Cancelada',  cls: 'bg-red-50 text-red-600 border-red-200',      icon: XCircle },
};

type ProyectoConMentoria = Proyecto & { seguimientos: Seguimiento[] };
const ETAPAS = ['Ideación', 'Validación', 'Prototipo', 'Incubación', 'Escalamiento'];

export const MentoriasPage: React.FC = () => {
  const [proyectos, setProyectos] = useState<ProyectoConMentoria[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [abierto, setAbierto]     = useState<number | null>(null);

  useEffect(() => {
    getMisMentorias()
      .then(setProyectos)
      .catch(e => setError(e instanceof Error ? e.message : 'Error al cargar mentorías.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 border-2 border-[#1A365D] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-medium text-[#1A365D]">Mis Mentorías</h1>
        <p className="text-sm text-gray-500 mt-1">Envía tus entregas y revisa las observaciones de tu mentor.</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" />{error}
          <button onClick={() => setError('')} className="ml-auto cursor-pointer"><X className="w-4 h-4" /></button>
        </div>
      )}

      {proyectos.length === 0 && !error ? (
        <div className="bg-white border border-gray-100 rounded-lg px-6 py-20 text-center">
          <BookOpen className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-400 font-medium">Aún no tienes mentorías activas.</p>
          <p className="text-xs text-gray-400 mt-1">Tu mentor iniciará la mentoría cuando esté listo.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {proyectos.map(p => {
            const segs       = p.seguimientos ?? [];
            const activo     = segs.find(s => !s.fecha_fin);
            const finalizada = segs.length > 0 && !activo;
            const seguimiento = activo ?? segs[segs.length - 1];
            const etapaActual = activo?.etapa?.nombre_etapa ?? (finalizada ? 'Finalizada' : '—');
            const etapaIdx    = finalizada ? ETAPAS.length : ETAPAS.indexOf(etapaActual);
            const expandido   = abierto === p.id_proyecto;

            return (
              <div key={p.id_proyecto} className={`bg-white border rounded-lg overflow-hidden ${finalizada ? 'border-blue-100' : 'border-gray-100'}`}>

                {/* Banner finalizada */}
                {finalizada && (
                  <div className="flex items-center gap-3 px-5 py-3 bg-blue-50 border-b border-blue-100">
                    <Trophy className="w-4 h-4 text-blue-600 shrink-0" />
                    <p className="text-sm font-medium text-blue-700">Mentoría completada — todas las etapas fueron superadas.</p>
                  </div>
                )}

                <button
                  onClick={() => setAbierto(expandido ? null : p.id_proyecto)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className="text-left flex-1 min-w-0">
                    <h3 className="text-base font-medium text-gray-800">{p.nombre_proyecto}</h3>
                    <p className={`text-xs font-medium mt-0.5 ${finalizada ? 'text-blue-600' : 'text-[#1A365D]'}`}>
                      {finalizada ? 'Proyecto finalizado' : <>Etapa actual: <span className="font-semibold">{etapaActual}</span></>}
                    </p>
                    {p.docente && (
                      <p className="flex items-center gap-1 text-xs text-teal-600 mt-0.5">
                        <User className="w-3 h-3" /> {p.docente.nombre}
                      </p>
                    )}
                  </div>
                  {expandido ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
                </button>

                {/* Barra de progreso */}
                <div className="px-5 pb-4 flex items-center gap-1">
                  {ETAPAS.map((etapa, i) => (
                    <React.Fragment key={etapa}>
                      <div className="flex flex-col items-center gap-1 flex-1">
                        <div className={`w-full h-1.5 rounded-full ${
                          finalizada || i < etapaIdx ? 'bg-[#1A365D]'
                          : i === etapaIdx ? 'bg-blue-400'
                          : 'bg-gray-100'
                        }`} />
                        <span className={`text-[10px] text-center leading-tight ${
                          finalizada ? 'text-[#1A365D] font-medium'
                          : i === etapaIdx ? 'text-[#1A365D] font-medium'
                          : i < etapaIdx ? 'text-blue-600'
                          : 'text-gray-300'
                        }`}>
                          {etapa}
                        </span>
                      </div>
                      {i < ETAPAS.length - 1 && (
                        <div className={`w-2 h-1.5 rounded-full shrink-0 mb-3.5 ${finalizada || i < etapaIdx ? 'bg-[#1A365D]' : 'bg-gray-100'}`} />
                      )}
                    </React.Fragment>
                  ))}
                </div>

                {expandido && seguimiento && (
                  <PanelMentoria id_seguimiento={seguimiento.id_seguimiento} finalizada={finalizada} />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ── Panel con tabs: Entregas | Asesorías ─────────────────────────────────────
const PanelMentoria: React.FC<{ id_seguimiento: number; finalizada: boolean }> = ({ id_seguimiento, finalizada }) => {
  const [tab, setTab] = useState<'entregas' | 'asesorias'>('entregas');
  return (
    <div>
      <div className="flex border-t border-gray-100">
        {(['entregas', 'asesorias'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2.5 text-xs font-medium transition-colors cursor-pointer border-b-2
              ${tab === t ? 'border-[#1A365D] text-[#1A365D] bg-blue-50/40' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
            {t === 'entregas' ? 'Entregas' : 'Asesorías'}
          </button>
        ))}
      </div>
      {tab === 'entregas'
        ? <RevisionesPanel id_seguimiento={id_seguimiento} finalizada={finalizada} />
        : <AsesoriasPanel  id_seguimiento={id_seguimiento} />}
    </div>
  );
};

// ── Panel de asesorías (solo lectura) ─────────────────────────────────────────
const AsesoriasPanel: React.FC<{ id_seguimiento: number }> = ({ id_seguimiento }) => {
  const [asesorias, setAsesorias] = useState<Asesoria[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');

  useEffect(() => {
    getAsesorias(id_seguimiento)
      .then(setAsesorias)
      .catch(() => setError('No se pudieron cargar las asesorías.'))
      .finally(() => setLoading(false));
  }, [id_seguimiento]);

  if (loading) return (
    <div className="flex justify-center py-8">
      <div className="w-5 h-5 border-2 border-[#1A365D] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="px-5 py-5 space-y-3">
      {error && <p className="text-sm text-red-600 flex items-center gap-1.5"><AlertCircle className="w-4 h-4" />{error}</p>}

      {asesorias.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <CalendarDays className="w-6 h-6 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-400">Tu mentor no ha programado asesorías aún.</p>
        </div>
      ) : (
        asesorias.map(a => {
          const cfg  = ESTADO_ASESORIA[a.estado];
          const Icon = cfg.icon;
          return (
            <div key={a.id_asesoria} className={`rounded-xl border border-gray-100 p-4 ${a.estado === 'cancelada' ? 'opacity-55' : ''}`}>
              <div className="flex items-start justify-between gap-2 flex-wrap mb-1.5">
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

              {a.descripcion && <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{a.descripcion}</p>}

              {a.modalidad === 'virtual' && a.enlace && (
                <a href={a.enlace} target="_blank" rel="noreferrer"
                   className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline mt-1.5">
                  <Link className="w-3 h-3" /> Unirse a la reunión
                </a>
              )}
              {a.modalidad === 'presencial' && a.lugar && (
                <p className="flex items-center gap-1 text-xs text-gray-500 mt-1.5">
                  <MapPin className="w-3 h-3" /> {a.lugar}
                </p>
              )}

              {a.notas && (
                <div className="mt-2 bg-blue-50/40 rounded-lg px-3 py-2 border border-blue-100">
                  <p className="text-[10px] font-medium text-[#1A365D] uppercase tracking-wide mb-1">Notas del mentor</p>
                  <p className="text-xs text-gray-700 whitespace-pre-line">{a.notas}</p>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

type ArchivoPendiente = { id: string; file: File; nombre: string };

// ── Panel de revisiones ───────────────────────────────────────────────────────
const RevisionesPanel: React.FC<{ id_seguimiento: number; finalizada: boolean }> = ({ id_seguimiento, finalizada }) => {
  const [revisiones, setRevisiones]   = useState<Revision[]>([]);
  const [loading, setLoading]         = useState(true);
  const [enviando, setEnviando]       = useState(false);
  const [error, setError]             = useState('');
  const [exito, setExito]             = useState('');
  const [pendientes, setPendientes]   = useState<ArchivoPendiente[]>([]);
  const [comentario, setComentario]   = useState('');
  const [descargando, setDescargando] = useState<number | null>(null);
  const fileRef                       = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getRevisiones(id_seguimiento)
      .then(setRevisiones)
      .catch(() => setError('No se pudieron cargar las entregas.'))
      .finally(() => setLoading(false));
  }, [id_seguimiento]);

  // Orden explícito por fecha de envío — no depende del orden en que la API devuelva las entregas.
  const revisionesOrdenadas = [...revisiones].sort((a, b) =>
    a.fecha_envio === b.fecha_envio ? a.id_revision - b.id_revision : a.fecha_envio.localeCompare(b.fecha_envio)
  );

  const agregarArchivo = (files: FileList | null) => {
    if (!files) return;
    const nuevos = Array.from(files).map(file => ({
      id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
      file,
      nombre: file.name.replace(/\.[^.]+$/, ''),
    }));
    setPendientes(prev => [...prev, ...nuevos]);
    if (fileRef.current) fileRef.current.value = '';
  };

  const quitarArchivo = (id: string) => {
    setPendientes(prev => prev.filter(p => p.id !== id));
  };

  const actualizarNombre = (id: string, nombre: string) => {
    setPendientes(prev => prev.map(p => p.id === id ? { ...p, nombre } : p));
  };

  const handleDescargar = async (id_documento: number, nombre: string) => {
    setDescargando(id_documento); setError('');
    try {
      await descargarDocumento(id_documento, nombre);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo descargar el archivo.');
    } finally {
      setDescargando(null);
    }
  };

  const handleEnviar = async () => {
    if (pendientes.length === 0) { setError('Agrega al menos un archivo.'); return; }
    if (pendientes.some(p => !p.nombre.trim())) { setError('Todos los archivos deben tener nombre.'); return; }
    setEnviando(true); setError(''); setExito('');
    try {
      const { data } = await crearRevision(
        id_seguimiento,
        pendientes.map(p => p.nombre),
        pendientes.map(p => p.file),
        comentario.trim() || undefined
      );
      setRevisiones(prev => [...prev, data]);
      setPendientes([]);
      setComentario('');
      setExito('Entrega enviada exitosamente.');
      setTimeout(() => setExito(''), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al enviar la entrega.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="border-t border-gray-100 px-5 py-5 space-y-5">

      {/* Formulario nueva entrega — oculto si la mentoría está finalizada */}
      {finalizada ? (
        <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 border border-blue-100 rounded-lg">
          <Trophy className="w-4 h-4 text-blue-500 shrink-0" />
          <p className="text-sm text-blue-700 font-medium">Mentoría finalizada — ya no es posible enviar nuevas entregas.</p>
        </div>
      ) : (
        <div className="rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/30 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#1A365D] flex items-center justify-center shrink-0">
              <ClipboardList className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1A365D]">Nueva entrega</p>
              <p className="text-[11px] text-gray-500">Adjunta tus documentos para que tu mentor los revise</p>
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Comentario (opcional) — indica al mentor lo que necesitas que revise</label>
            <textarea
              value={comentario}
              onChange={e => setComentario(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 outline-none focus:border-[#1A365D] transition-all resize-none"
              placeholder="Ej: Adjunto la versión actualizada del MVP, falta revisar el módulo de pagos..."
            />
          </div>

          {pendientes.length > 0 && (
            <div className="space-y-2">
              {pendientes.map(p => (
                <div key={p.id} className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5">
                  <FileText className="w-4 h-4 text-[#1A365D] shrink-0" />
                  <input
                    type="text"
                    value={p.nombre}
                    onChange={e => actualizarNombre(p.id, e.target.value)}
                    className="flex-1 py-0.5 bg-transparent text-sm text-gray-800 outline-none"
                    placeholder="Nombre del documento"
                  />
                  <span className="text-xs text-gray-400 truncate max-w-[120px]">{p.file.name}</span>
                  <button type="button" onClick={() => quitarArchivo(p.id)} className="text-gray-300 hover:text-red-500 cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 px-3 py-2 bg-white border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 cursor-pointer hover:bg-gray-50 transition-colors">
              <Plus className="w-4 h-4 text-[#1A365D]" />
              Agregar archivo
              <input ref={fileRef} type="file" multiple className="hidden" onChange={e => agregarArchivo(e.target.files)} />
            </label>
            <button
              onClick={handleEnviar}
              disabled={enviando || pendientes.length === 0}
              className="ml-auto flex items-center gap-2 px-4 py-2 bg-[#1A365D] hover:bg-[#0F2442] text-white text-sm font-medium rounded-lg transition-colors cursor-pointer disabled:opacity-60"
            >
              <Send className="w-4 h-4" />
              {enviando ? 'Enviando...' : 'Enviar entrega'}
            </button>
          </div>

          {error && <p className="text-sm text-red-600 flex items-center gap-1.5"><AlertCircle className="w-4 h-4" />{error}</p>}
          {exito && <p className="text-sm text-green-600">{exito}</p>}
        </div>
      )}

      {/* Lista de revisiones/entregas */}
      <div className="space-y-3">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Entregas enviadas</p>

        {loading ? (
          <div className="flex justify-center py-6">
            <div className="w-5 h-5 border-2 border-[#1A365D] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : revisionesOrdenadas.length === 0 ? (
          <div className="text-center py-6">
            <Upload className="w-6 h-6 text-gray-200 mx-auto mb-2" />
            <p className="text-sm text-gray-400">Aún no has enviado entregas en esta etapa.</p>
          </div>
        ) : (
          revisionesOrdenadas.map((r, i) => (
            <div key={r.id_revision} className="rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow bg-white">
              {/* Cabecera tipo tarea */}
              <div className={`px-4 py-3 flex items-center gap-3 border-b ${r.revisado ? 'bg-teal-50/60 border-teal-100' : 'bg-amber-50/60 border-amber-100'}`}>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0 ${r.revisado ? 'bg-teal-600' : 'bg-amber-500'}`}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">Entrega #{i + 1}</p>
                  <p className="flex items-center gap-1 text-[11px] text-gray-500">
                    <CalendarDays className="w-3 h-3" />
                    {new Date(r.fecha_envio + 'T00:00:00').toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full border shrink-0 ${
                  r.revisado ? 'bg-teal-50 text-teal-700 border-teal-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {r.revisado ? <GraduationCap className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                  {r.revisado ? 'Revisado' : 'En revisión'}
                </span>
              </div>

              <div className="p-4 space-y-3">
                {/* Comentario del estudiante — estilo nota adhesiva */}
                {r.comentario_estudiante && (
                  <div className="bg-amber-50/60 border-l-4 border-amber-300 rounded-r-lg px-3 py-2">
                    <p className="text-[11px] text-amber-700 font-semibold flex items-center gap-1.5 mb-1">
                      <MessageSquare className="w-3.5 h-3.5" /> Tu comentario
                    </p>
                    <p className="text-sm text-gray-700 whitespace-pre-line">{r.comentario_estudiante}</p>
                  </div>
                )}

                {/* Documentos adjuntos como chips descargables */}
                <div className="flex flex-wrap gap-2">
                  {r.documentos.map(d => (
                    <button
                      key={d.id_documento}
                      type="button"
                      onClick={() => handleDescargar(d.id_documento, d.nombre)}
                      disabled={descargando === d.id_documento}
                      title={`Descargar ${d.nombre}`}
                      className="group inline-flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-full pl-2 pr-3 py-1 hover:bg-teal-50 hover:border-teal-200 transition-colors cursor-pointer disabled:opacity-60"
                    >
                      <Paperclip className="w-3 h-3 text-gray-400 group-hover:text-teal-600 shrink-0" />
                      <span className="text-xs text-gray-700 truncate max-w-[160px]">{d.nombre}</span>
                      {descargando === d.id_documento
                        ? <div className="w-3 h-3 border-2 border-teal-600 border-t-transparent rounded-full animate-spin shrink-0" />
                        : <Download className="w-3 h-3 text-gray-400 group-hover:text-teal-600 shrink-0" />}
                    </button>
                  ))}
                </div>

                {/* Retroalimentación del mentor — estilo nota de clase */}
                {r.observaciones && (
                  <div className="bg-blue-50/60 border-l-4 border-[#1A365D] rounded-r-lg px-3 py-2">
                    <p className="text-[11px] text-[#1A365D] font-semibold flex items-center gap-1.5 mb-1">
                      <GraduationCap className="w-3.5 h-3.5" /> Retroalimentación del mentor
                    </p>
                    <p className="text-sm text-gray-700 whitespace-pre-line">{r.observaciones}</p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
