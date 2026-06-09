import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen, AlertCircle, X, Upload, FileText,
  Send, ChevronDown, ChevronUp, Plus, MessageSquare,
  CalendarDays, Clock, Video, MapPin, Link, CheckCircle2, XCircle, Trophy, User,
} from 'lucide-react';
import {
  getMisMentorias, getRevisiones, crearRevision, getAsesorias,
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

// ── Panel de revisiones ───────────────────────────────────────────────────────
const RevisionesPanel: React.FC<{ id_seguimiento: number; finalizada: boolean }> = ({ id_seguimiento, finalizada }) => {
  const [revisiones, setRevisiones]   = useState<Revision[]>([]);
  const [loading, setLoading]         = useState(true);
  const [enviando, setEnviando]       = useState(false);
  const [error, setError]             = useState('');
  const [exito, setExito]             = useState('');
  const [archivos, setArchivos]       = useState<File[]>([]);
  const [nombres, setNombres]         = useState<string[]>([]);
  const fileRef                       = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getRevisiones(id_seguimiento)
      .then(setRevisiones)
      .catch(() => setError('No se pudieron cargar las entregas.'))
      .finally(() => setLoading(false));
  }, [id_seguimiento]);

  const agregarArchivo = (files: FileList | null) => {
    if (!files) return;
    const nuevos = Array.from(files);
    setArchivos(prev => [...prev, ...nuevos]);
    setNombres(prev => [...prev, ...nuevos.map(f => f.name.replace(/\.[^.]+$/, ''))]);
    if (fileRef.current) fileRef.current.value = '';
  };

  const quitarArchivo = (i: number) => {
    setArchivos(prev => prev.filter((_, idx) => idx !== i));
    setNombres(prev => prev.filter((_, idx) => idx !== i));
  };

  const handleEnviar = async () => {
    if (archivos.length === 0) { setError('Agrega al menos un archivo.'); return; }
    if (nombres.some(n => !n.trim())) { setError('Todos los archivos deben tener nombre.'); return; }
    setEnviando(true); setError(''); setExito('');
    try {
      const { data } = await crearRevision(id_seguimiento, nombres, archivos);
      setRevisiones(prev => [...prev, data]);
      setArchivos([]);
      setNombres([]);
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
        <div className="space-y-3">
          <p className="text-xs font-medium text-[#1A365D] uppercase tracking-wider">Nueva entrega</p>

          {archivos.length > 0 && (
            <div className="space-y-2">
              {archivos.map((f, i) => (
                <div key={i} className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#1A365D] shrink-0" />
                  <input
                    type="text"
                    value={nombres[i]}
                    onChange={e => setNombres(prev => prev.map((n, idx) => idx === i ? e.target.value : n))}
                    className="flex-1 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 outline-none focus:border-[#1A365D] transition-all"
                    placeholder="Nombre del documento"
                  />
                  <span className="text-xs text-gray-400 truncate max-w-[120px]">{f.name}</span>
                  <button type="button" onClick={() => quitarArchivo(i)} className="text-gray-300 hover:text-red-500 cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 px-3 py-2 border border-dashed border-gray-200 rounded-lg text-sm text-gray-500 cursor-pointer hover:bg-gray-50 transition-colors">
              <Plus className="w-4 h-4 text-[#1A365D]" />
              Agregar archivo
              <input ref={fileRef} type="file" multiple className="hidden" onChange={e => agregarArchivo(e.target.files)} />
            </label>
            <button
              onClick={handleEnviar}
              disabled={enviando || archivos.length === 0}
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
        ) : revisiones.length === 0 ? (
          <div className="text-center py-6">
            <Upload className="w-6 h-6 text-gray-200 mx-auto mb-2" />
            <p className="text-sm text-gray-400">Aún no has enviado entregas en esta etapa.</p>
          </div>
        ) : (
          revisiones.map((r, i) => (
            <div key={r.id_revision} className="border border-gray-100 rounded-lg overflow-hidden">
              {/* Cabecera de la entrega */}
              <div className="bg-gray-50 px-4 py-2.5 flex items-center gap-3">
                <p className="text-xs font-medium text-[#1A365D] flex-1">
                  Entrega #{i + 1} · {new Date(r.fecha_envio + 'T00:00:00').toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
                {r.revisado && (
                  <span className="text-xs font-medium text-teal-700 bg-teal-50 border border-teal-100 rounded-full px-2.5 py-0.5">
                    Revisado
                  </span>
                )}
              </div>

              {/* Documentos */}
              <div className="px-4 py-3 space-y-1.5">
                {r.documentos.map(d => (
                  <div key={d.id_documento} className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <p className="text-sm text-gray-700 truncate">{d.nombre}</p>
                  </div>
                ))}
              </div>

              {/* Observaciones del mentor */}
              {r.observaciones && (
                <div className="px-4 py-3 border-t border-gray-100 bg-blue-50/40">
                  <p className="text-xs text-[#1A365D] font-medium flex items-center gap-1.5 mb-1">
                    <MessageSquare className="w-3.5 h-3.5" /> Observaciones del mentor
                  </p>
                  <p className="text-sm text-gray-700 whitespace-pre-line">{r.observaciones}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
