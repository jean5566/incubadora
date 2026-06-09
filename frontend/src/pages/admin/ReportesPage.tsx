import React, { useEffect, useState } from 'react';
import { BarChart3, Users, UserCheck, GraduationCap, ShieldCheck, RefreshCw, Download } from 'lucide-react';
import { getUsuarios, type UsuarioAdmin } from '../../api';

const ROL_LABEL: Record<string, string> = {
  administrador: 'Administrador',
  mentor: 'Mentor',
  emprendedor: 'Emprendedor',
};

const ROL_COLOR: Record<string, string> = {
  administrador: 'bg-indigo-100 text-indigo-700',
  mentor: 'bg-blue-100 text-blue-700',
  emprendedor: 'bg-emerald-100 text-emerald-700',
};

function formatFecha(fecha: string | null): string {
  if (!fecha) return '—';
  return new Date(fecha).toLocaleString('es-EC', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function agruparPorMes(usuarios: UsuarioAdmin[]): { mes: string; total: number }[] {
  const mapa: Record<string, number> = {};
  usuarios.forEach(u => {
    if (!u.fecha_registro) return;
    const d = new Date(u.fecha_registro);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    mapa[key] = (mapa[key] ?? 0) + 1;
  });
  return Object.entries(mapa)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([mes, total]) => ({
      mes: new Date(mes + '-01').toLocaleDateString('es-EC', { year: 'numeric', month: 'short' }),
      total,
    }));
}

function exportCSV(usuarios: UsuarioAdmin[]) {
  const header = 'ID,Nombre,Correo,Rol,Estado,Fecha Registro';
  const rows = usuarios.map(u =>
    [
      u.id_usuario,
      `"${u.nombre}"`,
      u.correo,
      ROL_LABEL[u.rol] ?? u.rol,
      u.estado,
      formatFecha(u.fecha_registro),
    ].join(',')
  );
  const csv = [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `reporte-usuarios-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export const ReportesPage: React.FC = () => {
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rolFiltro, setRolFiltro] = useState<'todos' | 'administrador' | 'mentor' | 'emprendedor'>('todos');

  const load = () => {
    setLoading(true);
    setError('');
    getUsuarios()
      .then(setUsuarios)
      .catch(() => setError('No se pudieron cargar los datos.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtrados = rolFiltro === 'todos' ? usuarios : usuarios.filter(u => u.rol === rolFiltro);
  const registrosPorMes = agruparPorMes(usuarios);
  const maxMes = Math.max(...registrosPorMes.map(r => r.total), 1);

  const mentores      = usuarios.filter(u => u.rol === 'mentor').length;
  const emprendedores = usuarios.filter(u => u.rol === 'emprendedor').length;
  const admins        = usuarios.filter(u => u.rol === 'administrador').length;
  const activos       = usuarios.filter(u => u.estado === 'activo').length;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-medium text-[#1A365D]">Reportes de Usuarios</h1>
          <p className="text-sm text-gray-500 mt-0.5">{usuarios.length} usuarios registrados en el sistema</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={load}
            className="flex items-center gap-2 px-4 py-2 text-sm font-normal text-[#1A365D] border border-blue-200 rounded-xl hover:bg-[#EBF8FF] transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" /> Actualizar
          </button>
          <button
            onClick={() => exportCSV(filtrados)}
            disabled={loading || filtrados.length === 0}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[#1A365D] hover:bg-[#0F2442] text-white rounded-xl transition-colors cursor-pointer disabled:opacity-60"
          >
            <Download className="w-4 h-4" /> Exportar CSV
          </button>
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total usuarios',  value: usuarios.length, icon: Users,         color: 'bg-indigo-50 border-indigo-100',   text: 'text-indigo-700'  },
          { label: 'Emprendedores',   value: emprendedores,   icon: GraduationCap, color: 'bg-emerald-50 border-emerald-100', text: 'text-emerald-700' },
          { label: 'Mentores',        value: mentores,        icon: UserCheck,     color: 'bg-teal-50 border-teal-100',       text: 'text-teal-700'    },
          { label: 'Administradores', value: admins,          icon: ShieldCheck,   color: 'bg-blue-50 border-blue-100',       text: 'text-blue-700'    },
        ].map(({ label, value, icon: Icon, color, text }) => (
          <div key={label} className={`border rounded-xl px-5 py-4 flex items-center gap-3 ${color}`}>
            <Icon className={`w-5 h-5 shrink-0 ${text}`} />
            <div>
              <p className={`text-xl font-semibold ${text}`}>{value}</p>
              <p className={`text-xs mt-0.5 ${text} opacity-80`}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Gráfico de registros por mes */}
      {registrosPorMes.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 className="w-4 h-4 text-[#1A365D]" />
            <h2 className="text-sm font-medium text-[#1A365D]">Registros por mes</h2>
          </div>
          <div className="flex items-end gap-3 h-32 overflow-x-auto pb-1">
            {registrosPorMes.map(({ mes, total }) => (
              <div key={mes} className="flex flex-col items-center gap-1 min-w-[48px]">
                <span className="text-xs font-medium text-gray-600">{total}</span>
                <div
                  className="w-10 bg-[#1A365D] rounded-t-md transition-all"
                  style={{ height: `${Math.max((total / maxMes) * 96, 8)}px` }}
                />
                <span className="text-[10px] text-gray-400 whitespace-nowrap">{mes}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {/* Filtro */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <p className="text-sm font-medium text-gray-700">{filtrados.length} registros · {activos} activos</p>
          <select
            value={rolFiltro}
            onChange={e => setRolFiltro(e.target.value as typeof rolFiltro)}
            className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1A365D] transition-all cursor-pointer"
          >
            <option value="todos">Todos los roles</option>
            <option value="emprendedor">Emprendedor</option>
            <option value="mentor">Mentor</option>
            <option value="administrador">Administrador</option>
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400">
            <div className="w-6 h-6 border-2 border-blue-200 border-t-[#3182CE] rounded-full animate-spin mr-3" />
            Cargando reporte...
          </div>
        ) : error ? (
          <p className="px-5 py-10 text-center text-sm text-red-500">{error}</p>
        ) : filtrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Users className="w-10 h-10 mb-3 opacity-40" />
            <p className="text-sm font-medium">No hay usuarios para mostrar</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3.5 font-medium text-gray-500 uppercase tracking-wider text-xs">#</th>
                <th className="text-left px-5 py-3.5 font-medium text-gray-500 uppercase tracking-wider text-xs">Nombre</th>
                <th className="text-left px-5 py-3.5 font-medium text-gray-500 uppercase tracking-wider text-xs hidden md:table-cell">Correo</th>
                <th className="text-left px-5 py-3.5 font-medium text-gray-500 uppercase tracking-wider text-xs">Rol</th>
                <th className="text-left px-5 py-3.5 font-medium text-gray-500 uppercase tracking-wider text-xs">Estado</th>
                <th className="text-left px-5 py-3.5 font-medium text-gray-500 uppercase tracking-wider text-xs">Fecha Registro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtrados.map(u => (
                <tr key={u.id_usuario} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-5 py-4 text-gray-400 font-medium">{u.id_usuario}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#1A365D] text-white flex items-center justify-center font-normal text-xs shrink-0">
                        {u.nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <span className="font-normal text-gray-800">{u.nombre}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-500 hidden md:table-cell">{u.correo}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${ROL_COLOR[u.rol] ?? 'bg-gray-100 text-gray-600'}`}>
                      {ROL_LABEL[u.rol] ?? u.rol}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${u.estado === 'activo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                      {u.estado === 'activo' ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-500">{formatFecha(u.fecha_registro)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
};
