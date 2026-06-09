import React, { useState, useEffect } from 'react';
import { LogOut, LayoutDashboard, UserCog, ClipboardCheck, UserCheck, BarChart3 } from 'lucide-react';
import { NotificacionesBell } from './NotificacionesBell';
import { useNavigate, useLocation, Routes, Route } from 'react-router-dom';

function Redirect({ to }: { to: string }) {
  const nav = useNavigate();
  useEffect(() => { nav(to, { replace: true }); }, [nav, to]);
  return null;
}
import type { User } from '../api';
import { AdminDashboardPage } from '../pages/admin/DashboardPage';
import { GestionUsuariosPage } from '../pages/admin/GestionUsuariosPage';
import { AprobarProyectosPage } from '../pages/admin/AprobarProyectosPage';
import { AsignarDocentePage } from '../pages/admin/AsignarDocentePage';
import { ReportesPage } from '../pages/admin/ReportesPage';

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate  = useNavigate();
  const location  = useLocation();

  const navItems = [
    { path: '/admin/dashboard',       label: 'Control Principal', icon: LayoutDashboard },
    { path: '/admin/proyectos',       label: 'Aprobar Proyectos', icon: ClipboardCheck },
    { path: '/admin/asignar-mentor',  label: 'Asignar Mentor',   icon: UserCheck },
    { path: '/admin/usuarios',        label: 'Gestión Usuarios',  icon: UserCog },
    { path: '/admin/reportes',        label: 'Reportes',          icon: BarChart3 },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans selection:bg-[#1A365D] selection:text-white overflow-hidden">

      {/* Sidebar */}
      <aside className="w-64 bg-[#1A365D] text-white flex flex-col relative z-20 shrink-0">
        <div className="h-16 flex items-center gap-3 px-5 border-b border-white/10 bg-[#0F2442]">
          <LayoutDashboard className="w-5 h-5 text-white opacity-80" />
          <span className="text-base font-medium tracking-tight">Portal Administrador</span>
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
              <Route path="dashboard" element={<AdminDashboardPage />} />
              <Route path="proyectos"       element={<AprobarProyectosPage />} />
              <Route path="asignar-mentor" element={<AsignarDocentePage />} />
              <Route path="usuarios"        element={<GestionUsuariosPage />} />
              <Route path="reportes"        element={<ReportesPage />} />
              <Route path="*"         element={<Redirect to="dashboard" />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};
