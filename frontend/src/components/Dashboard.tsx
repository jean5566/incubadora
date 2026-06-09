import React, { useState, useEffect } from 'react';
import { GraduationCap, LayoutDashboard, FolderKanban, LogOut, BookOpen, Lightbulb, FlaskConical, Rocket, TrendingUp, Building2, Target, Users, BarChart3, RefreshCw, Handshake, CalendarDays, UserCircle } from 'lucide-react';
import { NotificacionesBell } from './NotificacionesBell';
import { useNavigate, useLocation, Routes, Route } from 'react-router-dom';

function Redirect({ to }: { to: string }) {
  const nav = useNavigate();
  useEffect(() => { nav(to, { replace: true }); }, [nav, to]);
  return null;
}
import type { User } from '../api';
import { getMisProyectos } from '../api';
import { ProyectosPage } from '../pages/estudiante/ProyectosPage';
import { MentoriasPage } from '../pages/estudiante/MentoriasPage';
import { ReunionesPage } from '../pages/estudiante/ReunionesPage';
import { GuiaPage } from '../pages/estudiante/GuiaPage';
import { PerfilEmprendedorPage } from '../pages/estudiante/PerfilPage';

interface DashboardProps {
  user: User;
  onLogout?: () => void;
}

const ETAPAS_INFO = [
  { nombre: 'Ideación',      icon: Lightbulb,   color: 'bg-violet-100 text-violet-700', border: 'border-violet-200', desc: 'Genera y define tu idea de negocio identificando el problema y la propuesta de valor.' },
  { nombre: 'Validación',    icon: Target,       color: 'bg-blue-100 text-blue-700',     border: 'border-blue-200',   desc: 'Verifica la viabilidad de tu solución con usuarios reales mediante entrevistas y experimentos.' },
  { nombre: 'Prototipo',     icon: FlaskConical, color: 'bg-amber-100 text-amber-700',   border: 'border-amber-200',  desc: 'Construye un MVP funcional que resuelva el problema core con el mínimo esfuerzo posible.' },
  { nombre: 'Incubación',    icon: Building2,    color: 'bg-teal-100 text-teal-700',     border: 'border-teal-200',   desc: 'Desarrolla tu modelo de negocio, consigue tracción y optimiza tus métricas clave.' },
  { nombre: 'Escalamiento',  icon: Rocket,       color: 'bg-emerald-100 text-emerald-700', border: 'border-emerald-200', desc: 'Expande tu startup a nuevos mercados y escala las operaciones con un modelo probado.' },
];

const CONCEPTOS = [
  { icon: Target,     label: 'MVP',               desc: 'Producto Mínimo Viable: la versión más simple que permite validar hipótesis con usuarios reales.' },
  { icon: BarChart3,  label: 'Modelo de Negocio',  desc: 'Cómo tu startup crea, entrega y captura valor (Business Model Canvas).' },
  { icon: RefreshCw,  label: 'Pivote',              desc: 'Cambio estratégico en dirección basado en aprendizajes validados del mercado.' },
  { icon: TrendingUp, label: 'Tracción',            desc: 'Evidencia cuantificable de que el mercado responde positivamente a tu propuesta.' },
  { icon: Users,      label: 'Early Adopters',      desc: 'Primeros usuarios dispuestos a adoptar tu solución a pesar de ser imperfecta.' },
  { icon: Handshake,  label: 'Mentoría',            desc: 'Acompañamiento de expertos que guían el desarrollo de tu startup en cada etapa.' },
];

const EstudianteHome: React.FC<{ user: User }> = ({ user }) => {
  const navigate = useNavigate();
  const [proyectosActivos, setProyectosActivos] = useState<number | null>(null);

  React.useEffect(() => {
    getMisProyectos()
      .then(p => setProyectosActivos(p.filter(x => x.estado === 'activo').length))
      .catch(() => setProyectosActivos(0));
  }, []);

  return (
    <div className="space-y-8">
      {/* Encabezado */}
      <div>
        <h1 className="text-xl font-medium text-[#1A365D]">Bienvenido, {user.nombre}</h1>
        <p className="text-sm text-gray-500 mt-1">Portal del Estudiante — UniIncubadora</p>
      </div>

      {/* Acceso rápido */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          onClick={() => navigate('/emprendedor/proyectos')}
          className="bg-white rounded-lg p-6 border border-gray-100 hover:shadow-sm transition-shadow cursor-pointer"
        >
          <FolderKanban className="w-6 h-6 text-[#1A365D] mb-3" />
          <h3 className="text-base font-medium text-gray-800">Mis Proyectos</h3>
          <p className="text-sm text-gray-500 mt-1">Registra y gestiona tus proyectos de incubación.</p>
          {proyectosActivos !== null && (
            <span className="inline-block mt-2 text-xs font-medium text-[#1A365D] bg-[#EBF8FF] rounded-full px-2.5 py-0.5">
              {proyectosActivos} {proyectosActivos === 1 ? 'proyecto activo' : 'proyectos activos'}
            </span>
          )}
        </div>
        <div
          onClick={() => navigate('/emprendedor/mentorias')}
          className="bg-white rounded-lg p-6 border border-gray-100 hover:shadow-sm transition-shadow cursor-pointer"
        >
          <BookOpen className="w-6 h-6 text-[#1A365D] mb-3" />
          <h3 className="text-base font-medium text-gray-800">Mis Mentorías</h3>
          <p className="text-sm text-gray-500 mt-1">Revisa el seguimiento y entregas con tu mentor asignado.</p>
        </div>
      </div>

      {/* Gestión de la Incubación */}
      <section>
        <h2 className="text-base font-medium text-gray-800 mb-4">Gestión de la Incubación</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {ETAPAS_INFO.map(({ nombre, icon: Icon, color, border, desc }) => (
            <div key={nombre} className={`bg-white border ${border} rounded-2xl p-4 flex flex-col gap-3 hover:shadow-md transition-shadow`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">{nombre}</p>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

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

export const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/emprendedor/dashboard', label: 'Inicio',        icon: LayoutDashboard },
    { path: '/emprendedor/proyectos', label: 'Proyectos',     icon: FolderKanban },
    { path: '/emprendedor/mentorias', label: 'Mentorías',     icon: BookOpen },
    { path: '/emprendedor/reuniones', label: 'Mis Reuniones', icon: CalendarDays },
    { path: '/emprendedor/guia',      label: 'Guía',          icon: GraduationCap },
    { path: '/emprendedor/perfil',    label: 'Mi Perfil',     icon: UserCircle },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans selection:bg-[#1A365D] selection:text-white overflow-hidden">

      {/* Sidebar */}
      <aside className="w-64 bg-[#1A365D] text-white flex flex-col relative z-20 shrink-0">
        <div className="h-16 flex items-center gap-3 px-5 border-b border-white/10 bg-[#0F2442]">
          <GraduationCap className="w-5 h-5 text-white opacity-80" />
          <span className="text-base font-medium tracking-tight">UniIncubadora</span>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-normal transition-colors cursor-pointer text-sm
                ${isActive(item.path)
                  ? 'bg-white text-[#1A365D]'
                  : 'text-blue-200 hover:bg-white/10 hover:text-white'}`}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-white/10">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-normal text-sm text-blue-200 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-end gap-2 px-8 z-10 shrink-0">
          <NotificacionesBell accentColor="#1A365D" />
          <div
            className="relative"
            onMouseEnter={() => setIsProfileOpen(true)}
            onMouseLeave={() => setIsProfileOpen(false)}
          >
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer p-2 rounded-lg hover:bg-gray-50"
            >
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-[#1A365D] leading-none">{user.nombre}</p>
                <p className="text-xs text-gray-500 mt-1">{user.correo}</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-[#1A365D] text-white flex items-center justify-center text-sm">
                {user.nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="max-w-6xl mx-auto w-full">
            <Routes>
              <Route index element={<Redirect to="dashboard" />} />
              <Route path="dashboard" element={<EstudianteHome user={user} />} />
              <Route path="proyectos" element={<ProyectosPage />} />
              <Route path="mentorias" element={<MentoriasPage />} />
              <Route path="reuniones" element={<ReunionesPage />} />
              <Route path="guia"      element={<GuiaPage />} />
              <Route path="perfil"    element={<PerfilEmprendedorPage />} />
              <Route path="*"         element={<Redirect to="dashboard" />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};
