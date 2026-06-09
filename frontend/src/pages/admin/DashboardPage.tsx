import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, FolderKanban, UserCheck, ClipboardCheck,
  TrendingUp, Clock, CheckCircle2, XCircle, ChevronRight,
} from 'lucide-react';
import { getUsuarios, getTodosProyectos, getAsignaciones, type UsuarioAdmin, type ProyectoConUsuario } from '../../api';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [usuarios,    setUsuarios]    = useState<UsuarioAdmin[]>([]);
  const [proyectos,   setProyectos]   = useState<ProyectoConUsuario[]>([]);
  const [asignados,   setAsignados]   = useState(0);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    Promise.all([getUsuarios(), getTodosProyectos(), getAsignaciones()])
      .then(([u, p, a]) => {
        setUsuarios(u);
        setProyectos(p);
        setAsignados(new Set(a.map(x => x.id_proyecto)).size);
      })
      .finally(() => setLoading(false));
  }, []);

  const mentores      = usuarios.filter(u => u.rol === 'mentor').length;
  const emprendedores = usuarios.filter(u => u.rol === 'emprendedor').length;
  const pendientes    = proyectos.filter(p => p.estado === 'pendiente').length;
  const activos       = proyectos.filter(p => p.estado === 'activo').length;
  const finalizados   = proyectos.filter(p => p.estado === 'finalizado').length;
  const rechazados    = proyectos.filter(p => p.estado === 'rechazado').length;

  const Skeleton = () => (
    <div className="h-5 w-12 bg-gray-200 rounded animate-pulse" />
  );

  return (
    <div className="space-y-8">

      {/* Encabezado */}
      <div>
        <h1 className="text-xl font-medium text-[#1A365D]">Panel de Administración</h1>
        <p className="text-sm text-gray-500 mt-1">Resumen general del sistema UniIncubadora.</p>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Usuarios', value: usuarios.length,  icon: Users,         color: 'bg-indigo-50 text-indigo-600',  border: 'border-indigo-100' },
          { label: 'Mentores', value: mentores,          icon: UserCheck,     color: 'bg-teal-50 text-teal-600',      border: 'border-teal-100'   },
          { label: 'Proyectos', value: proyectos.length, icon: FolderKanban,  color: 'bg-blue-50 text-blue-600',      border: 'border-blue-100'   },
          { label: 'Asignados', value: asignados,        icon: ClipboardCheck,color: 'bg-emerald-50 text-emerald-600',border: 'border-emerald-100'},
        ].map(({ label, value, icon: Icon, color, border }) => (
          <div key={label} className={`bg-white border ${border} rounded-xl p-5 flex items-center gap-4`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{label}</p>
              <p className="text-2xl font-semibold text-gray-800 mt-0.5">
                {loading ? <Skeleton /> : value}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Estado de proyectos */}
        <div className="bg-white border border-gray-100 rounded-xl p-6 space-y-4">
          <p className="text-sm font-semibold text-gray-700">Estado de proyectos</p>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3,4].map(i => <div key={i} className="h-9 bg-gray-100 rounded-lg animate-pulse" />)}
            </div>
          ) : (
            <div className="space-y-2">
              {[
                { label: 'Pendientes de revisión', count: pendientes,  icon: Clock,        bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-400' },
                { label: 'Aprobados / Activos',    count: activos,     icon: TrendingUp,   bg: 'bg-green-50',  text: 'text-green-700',  dot: 'bg-green-400'  },
                { label: 'Finalizados',             count: finalizados, icon: CheckCircle2, bg: 'bg-blue-50',   text: 'text-blue-700',   dot: 'bg-blue-400'   },
                { label: 'Rechazados',              count: rechazados,  icon: XCircle,      bg: 'bg-red-50',    text: 'text-red-600',    dot: 'bg-red-400'    },
              ].map(({ label, count, icon: Icon, bg, text, dot }) => (
                <div key={label} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg ${bg}`}>
                  <span className={`w-2 h-2 rounded-full shrink-0 ${dot}`} />
                  <Icon className={`w-4 h-4 shrink-0 ${text}`} />
                  <span className={`text-sm flex-1 ${text}`}>{label}</span>
                  <span className={`text-sm font-semibold ${text}`}>{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Distribución de usuarios */}
        <div className="bg-white border border-gray-100 rounded-xl p-6 space-y-4">
          <p className="text-sm font-semibold text-gray-700">Distribución de usuarios</p>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-9 bg-gray-100 rounded-lg animate-pulse" />)}
            </div>
          ) : (
            <div className="space-y-3">
              {[
                { rol: 'Emprendedores', count: emprendedores, total: usuarios.length, color: 'bg-emerald-500' },
                { rol: 'Mentores',      count: mentores,       total: usuarios.length, color: 'bg-teal-500'    },
                { rol: 'Administradores', count: usuarios.filter(u => u.rol === 'administrador').length, total: usuarios.length, color: 'bg-indigo-500' },
              ].map(({ rol, count, total, color }) => {
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                return (
                  <div key={rol} className="space-y-1.5">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>{rol}</span>
                      <span className="font-medium">{count} <span className="text-gray-400">({pct}%)</span></span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Accesos rápidos */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-3">Acceso rápido</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: 'Gestionar usuarios',  desc: 'Crear, editar y administrar cuentas.',      path: '/admin/usuarios',       icon: Users         },
            { label: 'Aprobar proyectos',   desc: `${pendientes} proyecto${pendientes !== 1 ? 's' : ''} pendiente${pendientes !== 1 ? 's' : ''} de revisión.`, path: '/admin/proyectos', icon: ClipboardCheck },
            { label: 'Asignar mentores',    desc: 'Vincula proyectos con mentores activos.',    path: '/admin/asignar-mentor', icon: UserCheck     },
          ].map(({ label, desc, path, icon: Icon }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="bg-white border border-gray-100 rounded-xl p-5 text-left hover:shadow-sm hover:border-blue-100 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between">
                <div className="w-9 h-9 rounded-xl bg-[#EBF8FF] flex items-center justify-center mb-3">
                  <Icon className="w-4 h-4 text-[#1A365D]" />
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#1A365D] transition-colors mt-1" />
              </div>
              <p className="text-sm font-medium text-gray-800">{label}</p>
              <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{desc}</p>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};
