import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, AlertCircle, X, ChevronRight, CheckCircle2, Clock, User } from 'lucide-react';
import {
  getMisProyectosAsignados, getSeguimientosProyecto,
  type ProyectoConUsuario, type Seguimiento,
} from '../../api';

const ETAPAS = ['Ideación', 'Validación', 'Prototipo', 'Incubación', 'Escalamiento'];

export const SeguimientoPage: React.FC = () => {
  const navigate                          = useNavigate();
  const [proyectos, setProyectos]         = useState<ProyectoConUsuario[]>([]);
  const [seguimientos, setSeguimientos]   = useState<Record<number, Seguimiento[]>>({});
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState('');

  useEffect(() => {
    (async () => {
      try {
        const ps = await getMisProyectosAsignados();
        setProyectos(ps);
        const resultados = await Promise.all(
          ps.map(p => getSeguimientosProyecto(p.id_proyecto).then(s => ({ id: p.id_proyecto, s })))
        );
        const mapa: Record<number, Seguimiento[]> = {};
        resultados.forEach(({ id, s }) => { mapa[id] = s; });
        setSeguimientos(mapa);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error al cargar datos.');
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

  const activos    = proyectos.filter(p => { const l = seguimientos[p.id_proyecto] ?? []; return l.some(s => !s.fecha_fin); });
  const completados = proyectos.filter(p => { const l = seguimientos[p.id_proyecto] ?? []; return l.length > 0 && !l.some(s => !s.fecha_fin); });
  const pendientes  = proyectos.filter(p => (seguimientos[p.id_proyecto] ?? []).length === 0);

  return (
    <div className="space-y-6">

      {/* Cabecera */}
      <div>
        <h1 className="text-xl font-medium text-[#0f766e]">Seguimiento de Proyectos</h1>
        <p className="text-sm text-gray-500 mt-1">Monitorea y avanza la etapa de cada proyecto asignado.</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" />{error}
          <button onClick={() => setError('')} className="ml-auto cursor-pointer"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Métricas rápidas */}
      {proyectos.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white border border-gray-100 rounded-xl px-4 py-3 text-center">
            <p className="text-2xl font-semibold text-[#0f766e]">{activos.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">En curso</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl px-4 py-3 text-center">
            <p className="text-2xl font-semibold text-blue-600">{completados.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">Completados</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl px-4 py-3 text-center">
            <p className="text-2xl font-semibold text-gray-400">{pendientes.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">Sin iniciar</p>
          </div>
        </div>
      )}

      {proyectos.length === 0 && !error ? (
        <div className="bg-white border border-gray-100 rounded-xl px-6 py-16 text-center">
          <Activity className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-400 font-medium">No tienes proyectos asignados aún.</p>
        </div>
      ) : (
        <div className="space-y-6">

          {/* En curso */}
          {activos.length > 0 && (
            <section>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">En curso</p>
              <div className="space-y-3">
                {activos.map(p => <TarjetaProyecto key={p.id_proyecto} p={p} lista={seguimientos[p.id_proyecto] ?? []} onAbrir={() => navigate(`/mentor/seguimiento/${p.id_proyecto}`)} />)}
              </div>
            </section>
          )}

          {/* Sin iniciar */}
          {pendientes.length > 0 && (
            <section>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Sin iniciar</p>
              <div className="space-y-3">
                {pendientes.map(p => <TarjetaProyecto key={p.id_proyecto} p={p} lista={[]} onAbrir={undefined} />)}
              </div>
            </section>
          )}

          {/* Completados */}
          {completados.length > 0 && (
            <section>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Completados</p>
              <div className="space-y-3">
                {completados.map(p => <TarjetaProyecto key={p.id_proyecto} p={p} lista={seguimientos[p.id_proyecto] ?? []} onAbrir={undefined} />)}
              </div>
            </section>
          )}

        </div>
      )}
    </div>
  );
};

/* ── Tarjeta individual ───────────────────────────────────────── */
const TarjetaProyecto: React.FC<{
  p: ProyectoConUsuario;
  lista: Seguimiento[];
  onAbrir: (() => void) | undefined;
}> = ({ p, lista, onAbrir }) => {
  const activo      = lista.find(s => !s.fecha_fin);
  const etapaActual = activo?.etapa?.nombre_etapa ?? null;
  const completada  = !activo && lista.length > 0;
  const etapaIdx    = etapaActual ? ETAPAS.indexOf(etapaActual) : -1;

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-4">

        <div className="flex-1 min-w-0">
          {/* Nombre y emprendedor */}
          <div className="flex items-center gap-2 mb-1">
            {completada
              ? <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
              : etapaActual
                ? <Clock className="w-4 h-4 text-[#0f766e] shrink-0" />
                : <Activity className="w-4 h-4 text-gray-300 shrink-0" />
            }
            <h3 className="text-sm font-medium text-gray-800 truncate">{p.nombre_proyecto}</h3>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-4 pl-6">
            <User className="w-3 h-3" />
            {p.usuario?.nombre ?? '—'}
          </div>

          {/* Barra de progreso de etapas */}
          <div className="flex items-center gap-1 pl-0">
            {ETAPAS.map((etapa, i) => {
              const pasada  = completada || i < etapaIdx;
              const actual  = i === etapaIdx;
              return (
                <React.Fragment key={etapa}>
                  <div className="flex flex-col items-center gap-1">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-medium border transition-colors
                      ${pasada  ? 'bg-[#0f766e] border-[#0f766e] text-white'
                      : actual  ? 'bg-white border-[#0f766e] text-[#0f766e]'
                                : 'bg-white border-gray-200 text-gray-300'}`}
                    >
                      {pasada ? '✓' : i + 1}
                    </div>
                    <span className={`text-[10px] whitespace-nowrap hidden sm:block
                      ${pasada ? 'text-[#0f766e] font-medium' : actual ? 'text-[#0f766e]' : 'text-gray-300'}`}>
                      {etapa}
                    </span>
                  </div>
                  {i < ETAPAS.length - 1 && (
                    <div className={`flex-1 h-px mb-4 ${pasada ? 'bg-[#0f766e]' : 'bg-gray-200'}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Botón */}
        {onAbrir && (
          <button
            onClick={onAbrir}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#0f766e] text-white text-xs font-normal rounded-lg hover:bg-[#115e59] transition-colors cursor-pointer shrink-0 mt-1"
          >
            Abrir <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
        {completada && (
          <span className="text-xs font-medium text-blue-600 bg-blue-50 border border-blue-100 rounded-full px-2.5 py-1 shrink-0 mt-1">
            Completada
          </span>
        )}
      </div>
    </div>
  );
};
