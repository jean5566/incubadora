import React from 'react';
import { GraduationCap, FolderKanban, FileText, Activity, Lightbulb, FlaskConical, Rocket, TrendingUp, Building2, Target, Users, BarChart3, RefreshCw, Handshake } from 'lucide-react';

const ETAPAS_INFO = [
  {
    nombre: 'Ideación',
    icon: Lightbulb,
    color: 'bg-violet-100 text-violet-700',
    border: 'border-violet-200',
    desc: 'Genera y define tu idea de negocio identificando el problema y la propuesta de valor.',
  },
  {
    nombre: 'Validación',
    icon: Target,
    color: 'bg-blue-100 text-blue-700',
    border: 'border-blue-200',
    desc: 'Verifica la viabilidad de tu solución con usuarios reales mediante entrevistas y experimentos.',
  },
  {
    nombre: 'Prototipo',
    icon: FlaskConical,
    color: 'bg-amber-100 text-amber-700',
    border: 'border-amber-200',
    desc: 'Construye un MVP funcional que resuelva el problema core con el mínimo esfuerzo posible.',
  },
  {
    nombre: 'Incubación',
    icon: Building2,
    color: 'bg-teal-100 text-teal-700',
    border: 'border-teal-200',
    desc: 'Desarrolla tu modelo de negocio, consigue tracción y optimiza tus métricas clave.',
  },
  {
    nombre: 'Escalamiento',
    icon: Rocket,
    color: 'bg-emerald-100 text-emerald-700',
    border: 'border-emerald-200',
    desc: 'Expande tu startup a nuevos mercados y escala las operaciones con un modelo probado.',
  },
];

const CONCEPTOS = [
  { icon: Target,     label: 'MVP',               desc: 'Producto Mínimo Viable: la versión más simple de tu producto que permite validar hipótesis con usuarios reales.' },
  { icon: BarChart3,  label: 'Modelo de Negocio',  desc: 'Descripción de cómo tu startup crea, entrega y captura valor (Business Model Canvas).' },
  { icon: RefreshCw,  label: 'Pivote',              desc: 'Cambio estratégico en dirección basado en aprendizajes validados del mercado.' },
  { icon: TrendingUp, label: 'Tracción',            desc: 'Evidencia cuantificable de que el mercado está respondiendo positivamente a tu propuesta.' },
  { icon: Users,      label: 'Early Adopters',      desc: 'Primeros usuarios dispuestos a adoptar tu solución a pesar de ser imperfecta.' },
  { icon: Handshake,  label: 'Mentoría',            desc: 'Acompañamiento especializado de expertos que guían el desarrollo de tu startup en cada etapa.' },
];

interface EstudianteDashboardPageProps {
  userName: string;
  metrics: { total_projects: number; active_projects: number };
  currentStage: string;
  onNavigateToProyectos: () => void;
  onNavigateToProgreso: () => void;
  onNavigateToMentorias: () => void;
}

export const EstudianteDashboardPage: React.FC<EstudianteDashboardPageProps> = ({
  metrics,
  currentStage,
  onNavigateToProyectos,
  onNavigateToProgreso,
  onNavigateToMentorias,
}) => {
  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-[#1A365D] rounded-[2rem] shadow-xl p-8 lg:p-12 border-b-[6px] border-[#3182CE]">
        <div className="absolute -top-10 -right-10 opacity-10 pointer-events-none">
          <GraduationCap className="w-80 h-80 text-white" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl font-medium text-white tracking-tight leading-tight mb-2">
              Bienvenido a tu <br />Ruta de Incubación
            </h1>
            <p className="text-lg text-blue-200 font-medium max-w-xl mt-4">
              Haz seguimiento a los hitos de tu proyecto, solicita evaluaciones de mentores y escala tu startup al siguiente nivel.
            </p>
          </div>
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 text-white font-normal items-center">
            <div className="flex justify-between items-center w-full">
              <span className="text-right flex-1 pr-4">Reglamentos</span>
              <button className="bg-white text-gray-800 text-xs px-4 py-1.5 rounded-full hover:bg-gray-100 hover:scale-105 transform transition-all shadow-sm cursor-pointer">
                Ver PDF
              </button>
            </div>
            <div className="flex justify-between items-center w-full">
              <span className="text-right flex-1 pr-4">Mentores</span>
              <button onClick={onNavigateToMentorias} className="bg-white text-gray-800 text-xs px-4 py-1.5 rounded-full hover:bg-gray-100 hover:scale-105 transform transition-all shadow-sm cursor-pointer">
                Ver
              </button>
            </div>
            <div className="flex justify-between items-center w-full">
              <span className="text-right flex-1 pr-4">Directrices</span>
              <button className="bg-white text-gray-800 text-xs px-4 py-1.5 rounded-full hover:bg-gray-100 hover:scale-105 transform transition-all shadow-sm cursor-pointer">
                Explorar
              </button>
            </div>
            <div className="flex justify-between items-center w-full">
              <span className="text-right flex-1 pr-4">Soporte</span>
              <button className="bg-white text-gray-800 text-xs px-4 py-1.5 rounded-full hover:bg-gray-100 hover:scale-105 transform transition-all shadow-sm cursor-pointer">
                Contactar
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Gestión de la Incubación */}
      <section>
        <h2 className="text-base font-medium text-gray-800 mb-4">Gestión de la Incubación</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {ETAPAS_INFO.map(({ nombre, icon: Icon, color, border, desc }) => (
            <div
              key={nombre}
              className={`bg-white border ${border} rounded-2xl p-4 flex flex-col gap-3 hover:shadow-md transition-shadow`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
                <Icon className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">{nombre}</p>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          onClick={onNavigateToProyectos}
          className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer group hover:-translate-y-1"
        >
          <div className="w-12 h-12 bg-[#EBF8FF] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <FolderKanban className="w-6 h-6 text-[#1A365D]" />
          </div>
          <h3 className="text-gray-500 font-medium text-sm">Proyectos Activos</h3>
          <p className="text-lg font-medium text-gray-800 mt-1">{metrics.active_projects}</p>
        </div>
        <div
          onClick={onNavigateToProyectos}
          className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer group hover:-translate-y-1"
        >
          <div className="w-12 h-12 bg-[#EBF8FF] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <FileText className="w-6 h-6 text-[#1A365D]" />
          </div>
          <h3 className="text-gray-500 font-medium text-sm">Total Proyectos</h3>
          <p className="text-lg font-medium text-gray-800 mt-1">{metrics.total_projects}</p>
        </div>
        <div
          onClick={onNavigateToProgreso}
          className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer group hover:-translate-y-1"
        >
          <div className="w-12 h-12 bg-[#EBF8FF] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Activity className="w-6 h-6 text-[#1A365D]" />
          </div>
          <h3 className="text-gray-500 font-medium text-sm">Fase Actual</h3>
          <p className="text-xl font-medium text-gray-800 mt-2">{currentStage}</p>
        </div>
      </div>
      {/* Conceptos Clave */}
      <section>
        <h2 className="text-base font-medium text-gray-800 mb-4">Conceptos Clave</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {CONCEPTOS.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="bg-white border border-gray-100 rounded-2xl px-5 py-4 flex gap-4 items-start hover:shadow-md transition-shadow">
              <div className="w-8 h-8 rounded-xl bg-[#EBF8FF] flex items-center justify-center shrink-0 mt-0.5">
                <Icon className="w-4 h-4 text-[#1A365D]" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">{label}</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
