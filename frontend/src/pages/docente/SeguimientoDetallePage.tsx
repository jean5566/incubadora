import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, AlertCircle, X, ChevronRight, FileText,
  Download, Save, MessageSquare, Upload, User, Calendar,
  CheckCircle2, Clock, Flag,
} from 'lucide-react';
import {
  getMisProyectosAsignados, getSeguimientosProyecto, avanzarEtapa,
  getRevisiones, guardarObservacionesRevision,
  descargarDocumento, type ProyectoConUsuario, type Seguimiento, type Revision,
} from '../../api';

const ETAPAS = ['Ideación', 'Validación', 'Prototipo', 'Incubación', 'Escalamiento'];

export const SeguimientoDetallePage: React.FC = () => {
  const { id_proyecto } = useParams<{ id_proyecto: string }>();
  const navigate        = useNavigate();
  const id              = Number(id_proyecto);

  const [proyecto, setProyecto]   = useState<ProyectoConUsuario | null>(null);
  const [lista, setLista]         = useState<Seguimiento[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [tab, setTab]             = useState(0);
  const [avanzando, setAvanzando]       = useState(false);
  const [confirmarAvance, setConfirmarAvance] = useState(false);

  const [revisiones, setRevisiones]       = useState<Record<number, Revision[]>>({});
  const [loadingRevs, setLoadingRevs]     = useState<Record<number, boolean>>({});
  const [obsRevision, setObsRevision]     = useState<Record<number, string>>({});
  const [guardandoRev, setGuardandoRev]   = useState<number | null>(null);
  const [guardadoRevOk, setGuardadoRevOk] = useState<number | null>(null);
  const loadedRevs = useRef<Set<number>>(new Set());

  useEffect(() => {
    Promise.all([getMisProyectosAsignados(), getSeguimientosProyecto(id)])
      .then(([proyectos, segs]) => {
        const p = proyectos.find(x => x.id_proyecto === id) ?? null;
        setProyecto(p);
        setLista(segs);
        const activo = segs.find(s => !s.fecha_fin);
        const initialTab = activo ? ETAPAS.indexOf(activo.etapa?.nombre_etapa ?? '') : 0;
        if (activo) setTab(initialTab);
        const initialSeg = segs.find(s => s.etapa?.nombre_etapa === ETAPAS[initialTab]);
        if (initialSeg) cargarRevisiones(initialSeg.id_seguimiento);
      })
      .catch(e => setError(e instanceof Error ? e.message : 'Error al cargar datos.'))
      .finally(() => setLoading(false));
  }, [id]);

  const cargarRevisiones = (id_seguimiento: number) => {
    if (loadedRevs.current.has(id_seguimiento)) return;
    loadedRevs.current.add(id_seguimiento);
    setLoadingRevs(prev => ({ ...prev, [id_seguimiento]: true }));
    getRevisiones(id_seguimiento)
      .then(revs => {
        setRevisiones(prev => ({ ...prev, [id_seguimiento]: revs }));
        const obsRev: Record<number, string> = {};
        revs.forEach(r => { obsRev[r.id_revision] = r.observaciones ?? ''; });
        setObsRevision(prev => ({ ...prev, ...obsRev }));
      })
      .catch(() => {})
      .finally(() => setLoadingRevs(prev => ({ ...prev, [id_seguimiento]: false })));
  };

  const handleTabChange = (i: number) => {
    setTab(i);
    const seg = lista.find(s => s.etapa?.nombre_etapa === ETAPAS[i]);
    if (seg) cargarRevisiones(seg.id_seguimiento);
  };

  const handleGuardarRevision = async (id_revision: number) => {
    setGuardandoRev(id_revision);
    try {
      await guardarObservacionesRevision(id_revision, obsRevision[id_revision] ?? '');
      setRevisiones(prev => {
        const updated = { ...prev };
        for (const key in updated) {
          updated[key] = updated[key].map(r =>
            r.id_revision === id_revision
              ? { ...r, revisado: true, observaciones: obsRevision[id_revision] ?? '' }
              : r
          );
        }
        return updated;
      });
      setGuardadoRevOk(id_revision);
      setTimeout(() => setGuardadoRevOk(null), 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al guardar observaciones.');
    } finally {
      setGuardandoRev(null);
    }
  };

  const activo   = lista.find(s => !s.fecha_fin);
  const etapaIdx = activo ? ETAPAS.indexOf(activo.etapa?.nombre_etapa ?? '') : -1;
  const completada = !activo && lista.length > 0;

  const handleSiguiente = async () => {
    if (!activo) return;
    setAvanzando(true);
    setError('');
    try {
      const res = await avanzarEtapa(activo.id_seguimiento);
      const cerrada = lista.map(s =>
        s.id_seguimiento === activo.id_seguimiento
          ? { ...s, fecha_fin: new Date().toISOString().slice(0, 10) }
          : s
      );
      const nueva = res.data ? [...cerrada, res.data] : cerrada;
      setLista(nueva);
      if (!res.completo && res.data) {
        const newTab = ETAPAS.indexOf(res.data.etapa?.nombre_etapa ?? '');
        setTab(newTab);
        cargarRevisiones(res.data.id_seguimiento);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al avanzar etapa.');
    } finally {
      setAvanzando(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 border-2 border-[#0f766e] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!proyecto) return (
    <div className="text-center py-20 text-gray-400 text-sm">Proyecto no encontrado.</div>
  );

  const seg        = lista.find(s => s.etapa?.nombre_etapa === ETAPAS[tab]);
  const revs       = seg ? revisiones[seg.id_seguimiento] : undefined;
  const cargandoR  = seg ? loadingRevs[seg.id_seguimiento] : false;
  const revisadas  = revs ? revs.filter(r => r.revisado).length : 0;

  const etapaSiguiente = activo && etapaIdx < ETAPAS.length - 1 ? ETAPAS[etapaIdx + 1] : null;
  const esUltimaEtapa  = etapaIdx === ETAPAS.length - 1;

  return (
    <>
      {/* Modal de confirmación de avance */}
      {confirmarAvance && activo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
            <div className="px-6 py-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                  <Flag className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-800">
                    {esUltimaEtapa ? '¿Completar mentoría?' : '¿Avanzar a siguiente etapa?'}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {esUltimaEtapa
                      ? `Etapa actual: ${activo.etapa?.nombre_etapa}`
                      : `${activo.etapa?.nombre_etapa} → ${etapaSiguiente}`}
                  </p>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-1">
                Antes de continuar, confirma que:
              </p>
              <ul className="text-sm text-gray-600 space-y-1 mb-5 pl-4 list-disc">
                <li>Se cumplieron todos los requisitos de la etapa actual.</li>
                <li>Revisaste y aprobaste las entregas del emprendedor.</li>
                {esUltimaEtapa
                  ? <li>El proyecto está listo para finalizar la mentoría.</li>
                  : <li>El emprendedor está preparado para la siguiente etapa.</li>
                }
              </ul>

              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmarAvance(false)}
                  className="flex-1 py-2.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => { setConfirmarAvance(false); handleSiguiente(); }}
                  className="flex-1 py-2.5 text-sm font-medium bg-[#0f766e] text-white rounded-lg hover:bg-[#115e59] transition-colors cursor-pointer"
                >
                  {esUltimaEtapa ? 'Sí, completar' : 'Sí, avanzar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    <div className="space-y-6">

      {/* Barra superior */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/mentor/seguimiento')}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#0f766e] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Volver
        </button>
      </div>

      {/* Cabecera del proyecto */}
      <div className="bg-white border border-gray-100 rounded-xl px-6 py-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">{proyecto.nombre_proyecto}</h1>
            <div className="flex items-center gap-4 mt-1.5">
              <span className="flex items-center gap-1.5 text-xs text-gray-500">
                <User className="w-3.5 h-3.5" />
                {proyecto.usuario?.nombre ?? '—'}
              </span>
              {activo?.etapa && (
                <span className="flex items-center gap-1.5 text-xs font-medium text-[#0f766e] bg-teal-50 px-2.5 py-1 rounded-full border border-teal-100">
                  <Clock className="w-3 h-3" /> Etapa actual: {activo.etapa.nombre_etapa}
                </span>
              )}
              {completada && (
                <span className="flex items-center gap-1.5 text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                  <CheckCircle2 className="w-3 h-3" /> Mentoría completada
                </span>
              )}
            </div>
          </div>

          {/* Mini stats */}
          <div className="flex gap-3">
            <div className="text-center bg-gray-50 rounded-lg px-4 py-2">
              <p className="text-base font-semibold text-gray-800">{lista.length}</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide">Etapas</p>
            </div>
            <div className="text-center bg-gray-50 rounded-lg px-4 py-2">
              <p className="text-base font-semibold text-[#0f766e]">{revs?.length ?? 0}</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide">Entregas</p>
            </div>
            <div className="text-center bg-gray-50 rounded-lg px-4 py-2">
              <p className="text-base font-semibold text-teal-600">{revisadas}</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide">Revisadas</p>
            </div>
          </div>
        </div>

        {/* Barra de progreso de etapas */}
        <div className="flex items-center gap-1 mt-5">
          {ETAPAS.map((etapa, i) => {
            const pasada  = completada || i < etapaIdx;
            const actual  = i === etapaIdx;
            return (
              <React.Fragment key={etapa}>
                <button
                  onClick={() => { const s = lista.find(x => x.etapa?.nombre_etapa === etapa); if (s || pasada) handleTabChange(i); }}
                  disabled={!pasada && !actual}
                  className="flex flex-col items-center gap-1 group disabled:cursor-not-allowed"
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-all
                    ${tab === i && actual  ? 'bg-[#0f766e] border-[#0f766e] text-white ring-4 ring-teal-100'
                    : tab === i && pasada  ? 'bg-[#0f766e] border-[#0f766e] text-white ring-4 ring-teal-100'
                    : pasada               ? 'bg-[#0f766e] border-[#0f766e] text-white'
                    : actual               ? 'bg-white border-[#0f766e] text-[#0f766e]'
                                           : 'bg-white border-gray-200 text-gray-300'}`}
                  >
                    {pasada ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
                  </div>
                  <span className={`text-[10px] whitespace-nowrap hidden sm:block font-medium
                    ${pasada ? 'text-[#0f766e]' : actual ? 'text-[#0f766e]' : 'text-gray-300'}`}>
                    {etapa}
                  </span>
                </button>
                {i < ETAPAS.length - 1 && (
                  <div className={`flex-1 h-0.5 mb-4 rounded-full transition-colors ${pasada ? 'bg-[#0f766e]' : 'bg-gray-200'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" />{error}
          <button onClick={() => setError('')} className="ml-auto cursor-pointer"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Panel de etapa seleccionada */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">

        {/* Header del panel */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/60">
          <div>
            <h2 className="text-sm font-semibold text-gray-800">{ETAPAS[tab]}</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {tab < etapaIdx && 'Etapa completada'}
              {tab === etapaIdx && 'En curso'}
              {tab > etapaIdx && 'Aún no iniciada'}
            </p>
          </div>
          {tab === etapaIdx && activo && (
            <button
              onClick={() => setConfirmarAvance(true)}
              disabled={avanzando}
              className="flex items-center gap-2 px-4 py-2 bg-[#0f766e] text-white text-sm font-normal rounded-lg hover:bg-[#115e59] transition-colors cursor-pointer disabled:opacity-60"
            >
              {avanzando ? (
                <span className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Avanzando...
                </span>
              ) : (
                <>
                  {etapaIdx === ETAPAS.length - 1 ? (
                    <><Flag className="w-3.5 h-3.5" /> Completar mentoría</>
                  ) : (
                    <>Siguiente etapa <ChevronRight className="w-3.5 h-3.5" /></>
                  )}
                </>
              )}
            </button>
          )}
        </div>

        <div className="px-6 py-5 space-y-6">

          {/* Fechas */}
          {seg ? (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-xl px-4 py-3 flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">Inicio</p>
                  <p className="text-sm font-medium text-gray-700">
                    {new Date(seg.fecha_inicio + 'T00:00:00').toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl px-4 py-3 flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">Fin</p>
                  <p className="text-sm font-medium text-gray-700">
                    {seg.fecha_fin
                      ? new Date(seg.fecha_fin + 'T00:00:00').toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' })
                      : <span className="text-gray-400">En curso</span>}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">Esta etapa aún no ha comenzado.</p>
          )}

          {/* Entregas */}
          {seg && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Entregas del emprendedor
                </p>
                {revs && revs.length > 0 && (
                  <span className="text-xs text-gray-400">{revisadas}/{revs.length} revisadas</span>
                )}
              </div>

              {cargandoR ? (
                <div className="flex justify-center py-10">
                  <div className="w-5 h-5 border-2 border-[#0f766e] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : !revs || revs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <Upload className="w-7 h-7 text-gray-300 mb-2" />
                  <p className="text-sm text-gray-400">Sin entregas en esta etapa.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {revs.map((r, i) => (
                    <div key={r.id_revision} className={`rounded-xl border overflow-hidden ${r.revisado ? 'border-teal-100' : 'border-gray-100'}`}>

                      {/* Header entrega */}
                      <div className={`flex items-center justify-between px-4 py-2.5 ${r.revisado ? 'bg-teal-50/60' : 'bg-gray-50'}`}>
                        <div className="flex items-center gap-2">
                          {r.revisado
                            ? <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                            : <Clock className="w-3.5 h-3.5 text-amber-400" />
                          }
                          <span className="text-xs font-medium text-gray-700">
                            Entrega #{i + 1}
                          </span>
                          <span className="text-xs text-gray-400">·</span>
                          <span className="text-xs text-gray-400">
                            {new Date(r.fecha_envio + 'T00:00:00').toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                        {r.revisado && (
                          <span className="text-[10px] font-medium text-teal-700 bg-teal-100 rounded-full px-2 py-0.5">
                            Revisado
                          </span>
                        )}
                      </div>

                      {/* Documentos */}
                      <div className="px-4 py-3 space-y-2 border-b border-gray-100">
                        {r.documentos.map(d => (
                          <div key={d.id_documento} className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2">
                            <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                            <p className="text-sm text-gray-700 flex-1 truncate">{d.nombre}</p>
                            <button
                              onClick={() => descargarDocumento(d.id_documento, d.nombre)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0f766e] text-white text-xs rounded-lg hover:bg-[#115e59] transition-colors shrink-0 cursor-pointer"
                            >
                              <Download className="w-3.5 h-3.5" /> Descargar
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Observaciones */}
                      <div className="px-4 py-3">
                        <div className="flex items-center gap-1.5 mb-2">
                          <MessageSquare className="w-3.5 h-3.5 text-gray-400" />
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Observaciones del mentor</p>
                        </div>

                        {r.revisado ? (
                          <p className="text-sm text-gray-700 whitespace-pre-line bg-gray-50 rounded-lg px-3 py-2.5 border border-gray-100 leading-relaxed">
                            {r.observaciones || <span className="text-gray-400 italic">Sin observaciones registradas.</span>}
                          </p>
                        ) : (
                          <div className="space-y-2">
                            <textarea
                              value={obsRevision[r.id_revision] ?? ''}
                              onChange={e => setObsRevision(prev => ({ ...prev, [r.id_revision]: e.target.value }))}
                              rows={3}
                              placeholder="Escribe tus observaciones para esta entrega..."
                              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 outline-none resize-none focus:ring-2 focus:ring-teal-100 focus:border-[#0f766e] transition-all"
                            />
                            <div className="flex items-center justify-end gap-3">
                              {guardadoRevOk === r.id_revision && (
                                <span className="text-xs text-teal-600 flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Guardado
                                </span>
                              )}
                              <button
                                onClick={() => handleGuardarRevision(r.id_revision)}
                                disabled={guardandoRev === r.id_revision}
                                className="flex items-center gap-1.5 px-4 py-2 bg-[#0f766e] text-white text-sm font-normal rounded-lg hover:bg-[#115e59] transition-colors cursor-pointer disabled:opacity-60"
                              >
                                {guardandoRev === r.id_revision ? (
                                  <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Guardando...</>
                                ) : (
                                  <><Save className="w-3.5 h-3.5" /> Marcar como revisado</>
                                )}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
    </>
  );
};
