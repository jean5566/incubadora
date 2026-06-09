import React, { useState, useEffect } from 'react';
import { ClipboardCheck, AlertCircle, X, PlayCircle, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { getMisProyectosAsignados, iniciarMentoria, getSeguimientosProyecto, type ProyectoConUsuario, type Seguimiento } from '../../api';

const ESTADO_ESTILOS: Record<string, string> = {
  pendiente:  'bg-yellow-50 text-yellow-700',
  activo:     'bg-green-50 text-green-700',
  finalizado: 'bg-blue-50 text-blue-700',
  rechazado:  'bg-red-50 text-red-600',
};

export const EvaluacionesPage: React.FC = () => {
  const [proyectos, setProyectos]           = useState<ProyectoConUsuario[]>([]);
  const [seguimientos, setSeguimientos]     = useState<Record<number, Seguimiento[]>>({});
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState('');
  const [iniciando, setIniciando]           = useState<number | null>(null);
  const [expandido, setExpandido]           = useState<number | null>(null);

  useEffect(() => {
    getMisProyectosAsignados()
      .then(async ps => {
        setProyectos(ps);
        const resultados = await Promise.all(
          ps.map(p => getSeguimientosProyecto(p.id_proyecto).then(s => ({ id: p.id_proyecto, s })))
        );
        const mapa: Record<number, Seguimiento[]> = {};
        resultados.forEach(({ id, s }) => { mapa[id] = s; });
        setSeguimientos(mapa);
      })
      .catch(e => setError(e instanceof Error ? e.message : 'Error al cargar proyectos.'))
      .finally(() => setLoading(false));
  }, []);

  const handleIniciarMentoria = async (id_proyecto: number) => {
    setIniciando(id_proyecto);
    setError('');
    try {
      const { data } = await iniciarMentoria(id_proyecto);
      setSeguimientos(prev => ({ ...prev, [id_proyecto]: [data] }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al iniciar mentoría.');
    } finally {
      setIniciando(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-[#0f766e] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-medium text-[#0f766e]">Proyectos Asignados</h1>
        <p className="text-sm text-gray-500 mt-1">Proyectos en los que fuiste asignado como mentor.</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
          <button onClick={() => setError('')} className="ml-auto cursor-pointer"><X className="w-4 h-4" /></button>
        </div>
      )}

      {proyectos.length === 0 && !error ? (
        <div className="bg-white border border-gray-100 rounded-lg px-6 py-16 text-center">
          <ClipboardCheck className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-400 font-medium">No tienes proyectos asignados aún.</p>
          <p className="text-xs text-gray-400 mt-1">El administrador te asignará proyectos próximamente.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {proyectos.map(p => {
            const lista      = seguimientos[p.id_proyecto] ?? [];
            const activo     = lista.find(s => !s.fecha_fin);
            const iniciada   = !!activo;
            const finalizada = lista.length > 0 && !activo;

            return (
            <div key={p.id_proyecto} className="bg-white border border-gray-100 rounded-lg p-5 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${ESTADO_ESTILOS[p.estado] ?? 'bg-gray-100 text-gray-600'}`}>
                      {p.estado}
                    </span>
                    {iniciada && (
                      <span className="flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-medium bg-teal-50 text-[#0f766e]">
                        <CheckCircle2 className="w-3 h-3" /> Mentoría iniciada
                      </span>
                    )}
                    {p.sector_tecnologico && (
                      <span className="text-xs text-gray-400">{p.sector_tecnologico}</span>
                    )}
                  </div>
                  <h3 className="text-base font-medium text-gray-800">{p.nombre_proyecto}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{p.descripcion}</p>

                  <div className="flex items-center gap-4 mt-3">
                    <p className="text-xs text-gray-500">
                      Emprendedor: <span className="font-medium text-gray-700">{p.usuario?.nombre ?? '—'}</span>
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(p.fecha_registro).toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                    {iniciada && activo?.etapa && (
                      <p className="text-xs text-[#0f766e] font-medium">
                        Etapa: {activo.etapa.nombre_etapa}
                      </p>
                    )}
                  </div>
                </div>

                {finalizada ? (
                  <span className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 text-sm font-normal rounded-lg shrink-0 border border-blue-100">
                    <CheckCircle2 className="w-4 h-4" />
                    Mentoría finalizada
                  </span>
                ) : iniciada ? (
                  <span className="flex items-center gap-2 px-4 py-2 bg-teal-50 text-[#0f766e] text-sm font-normal rounded-lg shrink-0 border border-teal-100">
                    <CheckCircle2 className="w-4 h-4" />
                    En curso
                  </span>
                ) : (
                  <button
                    onClick={() => handleIniciarMentoria(p.id_proyecto)}
                    disabled={iniciando === p.id_proyecto}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0f766e] text-white text-sm font-normal rounded-lg hover:bg-[#115e59] transition-colors cursor-pointer shrink-0 disabled:opacity-60"
                  >
                    <PlayCircle className="w-4 h-4" />
                    {iniciando === p.id_proyecto ? 'Iniciando...' : 'Iniciar Mentoría'}
                  </button>
                )}
              </div>

              {/* Botón ver detalles */}
              <div className="mt-3 pt-3 border-t border-gray-100 flex justify-start">
                <button
                  onClick={() => setExpandido(expandido === p.id_proyecto ? null : p.id_proyecto)}
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#0f766e] transition-colors cursor-pointer"
                >
                  {expandido === p.id_proyecto ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  {expandido === p.id_proyecto ? 'Ocultar detalles' : 'Ver detalles del proyecto'}
                </button>
              </div>

              {/* Detalles expandibles */}
              {expandido === p.id_proyecto && (
                <div className="mt-3 space-y-3">
                  {p.descripcion && (
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Descripción</p>
                      <p className="text-sm text-gray-700">{p.descripcion}</p>
                    </div>
                  )}
                  {p.problema_resuelve && (
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Problema que resuelve</p>
                      <p className="text-sm text-gray-700">{p.problema_resuelve}</p>
                    </div>
                  )}
                  {p.propuesta_valor && (
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Propuesta de valor</p>
                      <p className="text-sm text-gray-700">{p.propuesta_valor}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );})}
        </div>
      )}
    </div>
  );
};
