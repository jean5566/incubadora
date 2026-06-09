import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, ClipboardCheck, CalendarDays,
  X, AlertCircle, Send, TrendingUp, FileText, Paperclip, Download, CheckCircle, UserCircle, Activity,
} from 'lucide-react';
import { NotificacionesBell } from './NotificacionesBell';
import { useNavigate, useLocation, Routes, Route } from 'react-router-dom';

function Redirect({ to }: { to: string }) {
  const nav = useNavigate();
  useEffect(() => { nav(to, { replace: true }); }, [nav, to]);
  return null;
}
import { getDashboard, evaluateProject, getEntregas, storageUrl, type User, type Project, type Entrega } from '../api';
import { DocenteDashboardPage } from '../pages/docente/DashboardPage';
import { EvaluacionesPage } from '../pages/docente/EvaluacionesPage';
import { AsesoriasPage } from '../pages/docente/AsesoriasPage';
import { PerfilPage } from '../pages/docente/PerfilPage';
import { SeguimientoPage } from '../pages/docente/SeguimientoPage';
import { SeguimientoDetallePage } from '../pages/docente/SeguimientoDetallePage';

interface MentorDashboardProps {
  user: User;
  onLogout: () => void;
}


// ── Panel de Evaluación ──────────────────────────────────────────────────────
interface EvalPanelProps {
  project: Project;
  onClose: () => void;
  onSubmitted: () => void;
}

const EvalPanel: React.FC<EvalPanelProps> = ({ project, onClose, onSubmitted }) => {
  const [notas, setNotas] = useState('');
  const [avanzar, setAvanzar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState(false);
  const [entregas, setEntregas] = useState<Entrega[]>([]);

  useEffect(() => {
    getEntregas(project.id).then(setEntregas).catch(() => setEntregas([]));
  }, [project.id]);

  const esUltimaEtapa = project.etapa === 'Escalamiento';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notas.trim()) { setError('Escribe tus observaciones antes de enviar.'); return; }
    setLoading(true);
    setError('');
    try {
      await evaluateProject(project.id, { evaluation_notes: notas, advance_stage: avanzar });
      setExito(true);
      setTimeout(() => { onSubmitted(); onClose(); }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar evaluación.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-[#0f766e] px-6 py-5 flex justify-between items-start shrink-0">
          <div>
            <p className="text-teal-200 text-xs font-normal uppercase tracking-widest mb-1">Evaluación de Proyecto</p>
            <h3 className="text-lg font-medium text-white">{project.nombre}</h3>
            <span className="inline-block mt-2 px-3 py-0.5 bg-white/20 text-white text-xs font-normal rounded-full">
              Etapa actual: {project.etapa}
            </span>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors cursor-pointer mt-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          <div className="px-6 py-5 space-y-4 border-b border-gray-100">
            <div>
              <p className="text-xs font-normal text-gray-400 uppercase tracking-widest mb-1">Descripción</p>
              <p className="text-sm text-gray-700 font-medium">{project.descripcion}</p>
            </div>
            <div>
              <p className="text-xs font-normal text-gray-400 uppercase tracking-widest mb-1">Propuesta de Valor</p>
              <p className="text-sm text-gray-700 font-medium">{project.propuesta_valor}</p>
            </div>
            <div>
              <p className="text-xs font-normal text-gray-400 uppercase tracking-widest mb-1">Sector</p>
              <p className="text-sm font-normal text-[#0f766e]">{project.sector_tecnologico}</p>
            </div>
          </div>

          {(project.progress_logs ?? []).length > 0 && (
            <div className="px-6 py-5 border-b border-gray-100">
              <p className="text-xs font-normal text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <FileText className="w-3.5 h-3.5" /> Historial de Avances
              </p>
              <div className="space-y-3">
                {[...(project.progress_logs ?? [])].reverse().map(log => (
                  <div key={log.id} className="flex gap-3 items-start">
                    <div className="w-2 h-2 rounded-full bg-[#0f766e] mt-1.5 shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-gray-700">{log.accion}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{log.detalles}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {new Date(log.created_at).toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="px-6 py-5 border-b border-gray-100">
            <p className="text-xs font-normal text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Paperclip className="w-3.5 h-3.5" /> Entregas del Estudiante
            </p>
            {entregas.length === 0 ? (
              <p className="text-sm text-gray-400 font-medium">Aún no hay entregas para este proyecto.</p>
            ) : (
              <div className="space-y-3">
                {entregas.map(e => (
                  <div key={e.id} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="text-xs font-normal text-[#0f766e] mb-1">
                          {e.usuario?.nombre ?? 'Estudiante'} · {new Date(e.created_at).toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                        <p className="text-sm text-gray-700 font-medium whitespace-pre-line">{e.descripcion}</p>
                      </div>
                      {e.archivo_url && (
                        <a
                          href={storageUrl(e.archivo_url) ?? '#'}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0f766e] text-white text-xs font-normal rounded-lg hover:bg-[#115e59] transition-colors shrink-0"
                        >
                          <Download className="w-3.5 h-3.5" />
                          {e.archivo_nombre ?? 'Archivo'}
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
            <div>
              <label className="text-sm font-medium text-[#0f766e] uppercase tracking-wide block mb-2">
                Observaciones y Retroalimentación
              </label>
              <textarea
                value={notas}
                onChange={e => setNotas(e.target.value)}
                rows={4}
                placeholder="Escribe tu análisis del proyecto, fortalezas, áreas de mejora y recomendaciones..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg outline-none text-sm font-medium resize-none focus:ring-2 focus:ring-teal-50 focus:border-[#0f766e] transition-all"
              />
            </div>

            {!esUltimaEtapa && (
              <label className="flex items-center gap-3 p-4 bg-teal-50/60 border border-teal-100 rounded-lg cursor-pointer hover:bg-teal-50 transition-colors">
                <input type="checkbox" checked={avanzar} onChange={e => setAvanzar(e.target.checked)} className="w-4 h-4 accent-[#0f766e]" />
                <div>
                  <p className="text-sm font-medium text-[#0f766e] flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4" /> Avanzar a la siguiente etapa
                  </p>
                  <p className="text-xs text-teal-600 mt-0.5">El proyecto pasará automáticamente a la etapa siguiente.</p>
                </div>
              </label>
            )}

            {error && (
              <p className="text-sm font-normal text-red-600 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> {error}
              </p>
            )}
            {exito && (
              <p className="text-sm font-normal text-[#0f766e] flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> Evaluación enviada exitosamente.
              </p>
            )}

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="flex-1 px-5 py-2.5 border border-gray-200 text-gray-600 font-normal rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                Cancelar
              </button>
              <button type="submit" disabled={loading || exito} className="flex-1 px-5 py-2.5 bg-[#0f766e] text-white font-normal rounded-lg hover:bg-[#115e59] transition-colors cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2">
                <Send className="w-4 h-4" />
                {loading ? 'Enviando...' : 'Enviar Evaluación'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// ── Layout Principal ──────────────────────────────────────────────────────────
export const MentorDashboard: React.FC<MentorDashboardProps> = ({ user, onLogout }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate  = useNavigate();
  const location  = useLocation();
  const isActive  = (path: string) => location.pathname === path;
  const [, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const cargarProyectos = () => {
    getDashboard().then(({ projects }) => setProjects(projects)).catch(console.error);
  };

  useEffect(() => { cargarProyectos(); }, []);


  const navItems = [
    { path: '/mentor/dashboard',    label: 'Resumen General',   icon: LayoutDashboard },
    { path: '/mentor/evaluaciones', label: 'Revisar Proyectos', icon: ClipboardCheck },
    { path: '/mentor/seguimiento',  label: 'Seguimiento',       icon: Activity },
    { path: '/mentor/asesorias',    label: 'Mis Asesorías',     icon: CalendarDays },
    { path: '/mentor/perfil',       label: 'Mi Perfil',         icon: UserCircle },
  ];

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans selection:bg-[#0f766e] selection:text-white overflow-hidden">

      {selectedProject && (
        <EvalPanel
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onSubmitted={cargarProyectos}
        />
      )}

      {/* Sidebar */}
      <aside className="w-64 bg-[#0f766e] text-white flex flex-col relative z-20 shrink-0">
        <div className="h-16 flex items-center gap-3 px-5 border-b border-white/10 bg-[#115e59]">
          <LayoutDashboard className="w-5 h-5 text-white opacity-80" />
          <span className="text-base font-medium tracking-tight">Portal Docente</span>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {navItems.map(({ path, label, icon: Icon }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-normal transition-colors cursor-pointer text-sm
                ${isActive(path) ? 'bg-white text-[#0f766e]' : 'text-teal-100 hover:bg-white/10 hover:text-white'}`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-white/10">
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-normal text-sm text-teal-200 hover:bg-white/10 hover:text-white transition-colors cursor-pointer">
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-end gap-2 px-8 z-10 shrink-0">
          <NotificacionesBell accentColor="#0f766e" />
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
                <p className="text-sm font-medium text-[#0f766e] leading-none">{user.nombre}</p>
                <p className="text-xs text-gray-500 font-medium mt-1">{user.correo}</p>
              </div>
              <div className="w-9 h-9 rounded-full border border-gray-100 bg-[#0f766e] text-white flex items-center justify-center font-normal text-xs">
                {user.nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-10 scroll-smooth">
          <div className="max-w-6xl mx-auto w-full">

            <Routes>
              <Route index element={<Redirect to="dashboard" />} />
              <Route path="dashboard" element={
                <DocenteDashboardPage
                  onNavigateToEvaluaciones={() => navigate('/mentor/evaluaciones')}
                  onNavigateToAsesorias={() => navigate('/mentor/asesorias')}
                />
              } />
              <Route path="evaluaciones" element={<EvaluacionesPage />} />
              <Route path="seguimiento"                    element={<SeguimientoPage />} />
              <Route path="seguimiento/:id_proyecto"      element={<SeguimientoDetallePage />} />
              <Route path="asesorias" element={<AsesoriasPage />} />
              <Route path="perfil" element={<PerfilPage />} />
              <Route path="*" element={<Redirect to="dashboard" />} />
            </Routes>

          </div>
        </main>
      </div>
    </div>
  );
};
