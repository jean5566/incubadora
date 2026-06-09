import React, { useState, useEffect } from 'react';
import {
  CalendarDays, AlertCircle, X, Clock, Video, MapPin,
  Link, CheckCircle2, XCircle, FileText, ChevronDown, ChevronUp,
} from 'lucide-react';
import {
  getMisMentorias, getAsesorias,
  type Proyecto, type Seguimiento, type Asesoria,
} from '../../api';

type ProyectoConMentoria = Proyecto & { seguimientos: Seguimiento[] };

const ESTADO_CFG = {
  programada: { label: 'Programada', cls: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock },
  realizada:  { label: 'Realizada',  cls: 'bg-teal-50 text-teal-700 border-teal-200',   icon: CheckCircle2 },
  cancelada:  { label: 'Cancelada',  cls: 'bg-red-50 text-red-600 border-red-200',      icon: XCircle },
};

type AsesoriaConProyecto = Asesoria & { nombre_proyecto: string };

export const ReunionesPage: React.FC = () => {
  const [reuniones, setReuniones]   = useState<AsesoriaConProyecto[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [filtro, setFiltro]         = useState<'todas' | 'programada' | 'realizada' | 'cancelada'>('todas');
  const [expandida, setExpandida]   = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const proyectos: ProyectoConMentoria[] = await getMisMentorias();
        const todas: AsesoriaConProyecto[] = [];

        await Promise.all(proyectos.map(async p => {
          const seg = p.seguimientos[0];
          if (!seg) return;
          const asesorias = await getAsesorias(seg.id_seguimiento);
          asesorias.forEach(a => todas.push({ ...a, nombre_proyecto: p.nombre_proyecto }));
        }));

        // Ordenar: programadas primero (por fecha), luego realizadas, luego canceladas
        todas.sort((a, b) => {
          const orden = { programada: 0, realizada: 1, cancelada: 2 };
          if (orden[a.estado] !== orden[b.estado]) return orden[a.estado] - orden[b.estado];
          return a.fecha.localeCompare(b.fecha);
        });

        setReuniones(todas);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error al cargar las reuniones.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtradas = filtro === 'todas' ? reuniones : reuniones.filter(r => r.estado === filtro);

  const conteo = {
    programada: reuniones.filter(r => r.estado === 'programada').length,
    realizada:  reuniones.filter(r => r.estado === 'realizada').length,
    cancelada:  reuniones.filter(r => r.estado === 'cancelada').length,
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 border-2 border-[#1A365D] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">

      {/* Cabecera */}
      <div>
        <h1 className="text-xl font-medium text-[#1A365D]">Mis Reuniones</h1>
        <p className="text-sm text-gray-500 mt-1">Reuniones programadas por tu mentor en cada etapa de la mentoría.</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" />{error}
          <button onClick={() => setError('')} className="ml-auto cursor-pointer"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Métricas */}
      {reuniones.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white border border-amber-100 rounded-xl px-4 py-3 text-center">
            <p className="text-2xl font-semibold text-amber-600">{conteo.programada}</p>
            <p className="text-xs text-gray-500 mt-0.5">Pendientes</p>
          </div>
          <div className="bg-white border border-teal-100 rounded-xl px-4 py-3 text-center">
            <p className="text-2xl font-semibold text-teal-600">{conteo.realizada}</p>
            <p className="text-xs text-gray-500 mt-0.5">Realizadas</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl px-4 py-3 text-center">
            <p className="text-2xl font-semibold text-gray-400">{conteo.cancelada}</p>
            <p className="text-xs text-gray-500 mt-0.5">Canceladas</p>
          </div>
        </div>
      )}

      {/* Filtros */}
      {reuniones.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {(['todas', 'programada', 'realizada', 'cancelada'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer
                ${filtro === f
                  ? 'bg-[#1A365D] text-white border-[#1A365D]'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-[#1A365D]'}`}
            >
              {f === 'todas' ? 'Todas' : f.charAt(0).toUpperCase() + f.slice(1) + 's'}
              {f !== 'todas' && <span className="ml-1.5 opacity-70">{conteo[f]}</span>}
            </button>
          ))}
        </div>
      )}

      {/* Lista */}
      {reuniones.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl px-6 py-16 text-center">
          <CalendarDays className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-500">Tu mentor aún no ha programado reuniones.</p>
          <p className="text-xs text-gray-400 mt-1">Las reuniones aparecerán aquí cuando sean creadas.</p>
        </div>
      ) : filtradas.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">No hay reuniones con ese filtro.</p>
      ) : (
        <div className="space-y-3">
          {filtradas.map(r => {
            const cfg  = ESTADO_CFG[r.estado];
            const Icon = cfg.icon;
            const abierta = expandida === r.id_asesoria;

            return (
              <div key={r.id_asesoria}
                className={`bg-white border rounded-xl overflow-hidden transition-opacity ${r.estado === 'cancelada' ? 'opacity-60' : 'border-gray-100'}`}>

                {/* Cabecera clickeable */}
                <button
                  onClick={() => setExpandida(abierta ? null : r.id_asesoria)}
                  className="w-full text-left px-5 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="text-sm font-medium text-gray-800">{r.titulo}</p>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border ${cfg.cls}`}>
                          <Icon className="w-3 h-3" />{cfg.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                        <span className="flex items-center gap-1">
                          <CalendarDays className="w-3.5 h-3.5" />
                          {new Date(r.fecha + 'T00:00:00').toLocaleDateString('es-EC', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {r.hora_inicio}{r.hora_fin ? ` – ${r.hora_fin}` : ''}
                        </span>
                        <span className="flex items-center gap-1">
                          {r.modalidad === 'virtual'
                            ? <><Video className="w-3.5 h-3.5 text-blue-500" />Virtual</>
                            : <><MapPin className="w-3.5 h-3.5 text-teal-600" />Presencial</>}
                        </span>
                      </div>

                      <p className="text-[11px] text-[#1A365D] font-medium mt-1">
                        Proyecto: {r.nombre_proyecto}
                      </p>
                    </div>

                    {abierta
                      ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0 mt-1" />
                      : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 mt-1" />}
                  </div>
                </button>

                {/* Detalle expandido */}
                {abierta && (
                  <div className="border-t border-gray-100 px-5 py-4 space-y-3">
                    {r.descripcion && (
                      <p className="text-sm text-gray-600 leading-relaxed">{r.descripcion}</p>
                    )}

                    {r.modalidad === 'virtual' && r.enlace && (
                      <a href={r.enlace} target="_blank" rel="noreferrer"
                         className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                        <Link className="w-4 h-4" /> Unirse a la reunión
                      </a>
                    )}
                    {r.modalidad === 'presencial' && r.lugar && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg px-4 py-2.5 border border-gray-100">
                        <MapPin className="w-4 h-4 text-teal-600 shrink-0" />
                        {r.lugar}
                      </div>
                    )}

                    {r.notas && (
                      <div className="bg-blue-50/50 rounded-xl px-4 py-3 border border-blue-100">
                        <p className="text-[10px] font-semibold text-[#1A365D] uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5" /> Notas del mentor
                        </p>
                        <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{r.notas}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
