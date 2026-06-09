import React, { useState, useEffect } from 'react';
import { ClipboardCheck, CalendarDays, ChevronRight, Layers } from 'lucide-react';
import { getMisProyectosAsignados, type ProyectoConUsuario } from '../../api';

const ESTADO_ESTILOS: Record<string, string> = {
  pendiente:  'bg-yellow-50 text-yellow-700',
  activo:     'bg-green-50 text-green-700',
  finalizado: 'bg-blue-50 text-blue-700',
  rechazado:  'bg-red-50 text-red-600',
};

interface DocenteDashboardPageProps {
  onNavigateToEvaluaciones: () => void;
  onNavigateToAsesorias: () => void;
}

export const DocenteDashboardPage: React.FC<DocenteDashboardPageProps> = ({
  onNavigateToEvaluaciones,
  onNavigateToAsesorias,
}) => {
  const [proyectos, setProyectos] = useState<ProyectoConUsuario[]>([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    getMisProyectosAsignados()
      .then(setProyectos)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const activos    = proyectos.filter(p => p.estado === 'activo').length;
  const total      = proyectos.length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-lg sm:text-xl font-medium text-[#0f766e] tracking-tight">Panel de Mentoría</h1>
        <p className="text-gray-500 font-medium mt-2">Resumen de los proyectos que tienes asignados.</p>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          onClick={onNavigateToEvaluaciones}
          className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer group hover:-translate-y-1"
        >
          <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Layers className="w-6 h-6 text-[#0f766e]" />
          </div>
          <h3 className="text-gray-500 font-medium text-sm">Proyectos Asignados</h3>
          <p className="text-2xl font-medium text-gray-800 mt-1">
            {loading ? '—' : total}
            <span className="text-sm text-[#0f766e] font-normal ml-1">
              proyecto{total !== 1 ? 's' : ''}
            </span>
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mb-4">
            <ClipboardCheck className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-gray-500 font-medium text-sm">Activos</h3>
          <p className="text-2xl font-medium text-gray-800 mt-1">
            {loading ? '—' : activos}
          </p>
        </div>

        <div
          onClick={onNavigateToAsesorias}
          className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer group hover:-translate-y-1"
        >
          <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <CalendarDays className="w-6 h-6 text-[#0f766e]" />
          </div>
          <h3 className="text-gray-500 font-medium text-sm">Asesorías</h3>
          <p className="text-2xl font-medium text-gray-800 mt-1">
            {loading ? '—' : activos}
            <span className="text-sm text-gray-400 font-medium ml-1">en curso</span>
          </p>
        </div>
      </div>

      {/* Lista de proyectos */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-base font-medium text-gray-800">Proyectos Asignados</h2>
          <button
            onClick={onNavigateToEvaluaciones}
            className="text-sm font-normal text-[#0f766e] flex items-center gap-1 hover:gap-2 transition-all cursor-pointer"
          >
            Ver todos <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-5 h-5 border-2 border-[#0f766e] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : proyectos.length === 0 ? (
          <p className="text-center text-gray-400 font-medium py-10 text-sm">
            No tienes proyectos asignados aún.
          </p>
        ) : (
          <div className="divide-y divide-gray-50">
            {proyectos.slice(0, 5).map(p => (
              <div key={p.id_proyecto} className="flex items-center justify-between px-8 py-4 hover:bg-gray-50 transition-colors">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-800 text-sm truncate">{p.nombre_proyecto}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{p.usuario?.nombre ?? '—'}</p>
                </div>
                <div className="flex items-center gap-3 ml-4 shrink-0">
                  <span className={`px-2.5 py-0.5 text-xs rounded-full font-medium ${ESTADO_ESTILOS[p.estado] ?? 'bg-gray-100 text-gray-600'}`}>
                    {p.estado}
                  </span>
                  {p.sector_tecnologico && (
                    <span className="text-xs text-gray-400 hidden sm:block">{p.sector_tecnologico}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
