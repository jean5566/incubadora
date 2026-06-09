import React, { useEffect, useState } from 'react';
import { Users, Search, RefreshCw, Plus, Pencil, Trash2, X, Eye, EyeOff } from 'lucide-react';
import {
  getUsuarios, crearUsuario, editarUsuario, eliminarUsuario,
  toggleUsuarioEstado, type UsuarioAdmin,
} from '../../api';

// ── constantes ────────────────────────────────────────────────────────────────

const ROL_LABEL: Record<string, string> = {
  administrador: 'Administrador',
  mentor:        'Mentor',
  emprendedor:   'Emprendedor',
};

const ROL_COLOR: Record<string, string> = {
  administrador: 'bg-indigo-100 text-indigo-700',
  mentor:        'bg-blue-100 text-blue-700',
  emprendedor:   'bg-emerald-100 text-emerald-700',
};

const ROLES = ['administrador', 'mentor', 'emprendedor'] as const;

// ── tipos ─────────────────────────────────────────────────────────────────────

interface FormData {
  nombre: string;
  correo: string;
  rol: string;
  clave: string;
}

const EMPTY_FORM: FormData = { nombre: '', correo: '', rol: 'emprendedor', clave: '' };

// ── modal reutilizable ────────────────────────────────────────────────────────

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
    <div className="bg-white rounded-xl w-full max-w-md">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h2 className="text-base font-medium text-[#1A365D]">{title}</h2>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  </div>
);

// ── formulario de usuario ─────────────────────────────────────────────────────

interface UserFormProps {
  initial: FormData;
  isEdit: boolean;
  onSubmit: (data: FormData) => Promise<void>;
  onCancel: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ initial, isEdit, onSubmit, onCancel }) => {
  const [form, setForm] = useState<FormData>(initial);
  const [showPass, setShowPass] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (key: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await onSubmit(form);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar.');
    } finally {
      setSaving(false);
    }
  };

  const inputCls = 'w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-800 outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1A365D] transition-all';
  const labelCls = 'block text-xs font-medium text-[#1A365D] uppercase tracking-wide mb-1';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={labelCls}>Nombre completo</label>
        <input type="text" required value={form.nombre} onChange={set('nombre')} className={inputCls} placeholder="Pedro Sáenz" />
      </div>
      <div>
        <label className={labelCls}>Correo</label>
        <input type="email" required value={form.correo} onChange={set('correo')} className={inputCls} placeholder="usuario@uniincubadora.edu.ec" />
      </div>
      <div>
        <label className={labelCls}>Rol</label>
        <select value={form.rol} onChange={set('rol')} className={inputCls}>
          {ROLES.map(r => (
            <option key={r} value={r}>{ROL_LABEL[r]}</option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelCls}>
          {isEdit ? 'Nueva contraseña (dejar vacío para no cambiar)' : 'Contraseña'}
        </label>
        <div className="relative">
          <input
            type={showPass ? 'text' : 'password'}
            required={!isEdit}
            minLength={8}
            value={form.clave}
            onChange={set('clave')}
            className={`${inputCls} pr-9`}
            placeholder={isEdit ? 'Mínimo 8 caracteres' : 'Mínimo 8 caracteres'}
          />
          <button type="button" onClick={() => setShowPass(p => !p)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
            {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {error && (
        <p className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm font-normal text-red-600">{error}</p>
      )}

      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 py-2.5 bg-[#1A365D] hover:bg-[#0F2442] text-white text-sm font-medium rounded-lg transition-colors cursor-pointer disabled:opacity-60"
        >
          {saving ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Guardando...
            </span>
          ) : isEdit ? 'Guardar cambios' : 'Crear usuario'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2.5 text-sm font-normal text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
};

// ── modal de confirmación ─────────────────────────────────────────────────────

interface ConfirmProps {
  nombre: string;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

const ConfirmDelete: React.FC<ConfirmProps> = ({ nombre, onConfirm, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handle = async () => {
    setLoading(true);
    try { await onConfirm(); }
    catch (err) { setError(err instanceof Error ? err.message : 'Error al eliminar.'); setLoading(false); }
  };

  return (
    <Modal title="Eliminar usuario" onClose={onCancel}>
      <p className="text-sm text-gray-600 font-medium mb-4">
        ¿Estás seguro de que deseas eliminar a <span className="font-medium text-gray-800">{nombre}</span>? Esta acción no se puede deshacer.
      </p>
      {error && <p className="mb-3 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm font-normal text-red-600">{error}</p>}
      <div className="flex gap-3">
        <button
          onClick={handle}
          disabled={loading}
          className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer disabled:opacity-60"
        >
          {loading ? 'Eliminando...' : 'Sí, eliminar'}
        </button>
        <button onClick={onCancel} className="px-4 py-2.5 text-sm font-normal text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
          Cancelar
        </button>
      </div>
    </Modal>
  );
};

// ── página principal ──────────────────────────────────────────────────────────

export const GestionUsuariosPage: React.FC = () => {
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [search, setSearch]     = useState('');
  const [rolFiltro, setRolFiltro] = useState<'todos' | typeof ROLES[number]>('todos');
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  // modales
  const [showCreate, setShowCreate]             = useState(false);
  const [editTarget, setEditTarget]             = useState<UsuarioAdmin | null>(null);
  const [deleteTarget, setDeleteTarget]         = useState<UsuarioAdmin | null>(null);
  const [toggling, setToggling]                 = useState<number | null>(null);

  const load = () => {
    setLoading(true);
    setError('');
    getUsuarios()
      .then(setUsuarios)
      .catch(() => setError('No se pudieron cargar los usuarios.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  // crear
  const handleCreate = async (form: FormData) => {
    const { data } = await crearUsuario(form);
    setUsuarios(prev => [...prev, data]);
    setShowCreate(false);
  };

  // editar
  const handleEdit = async (form: FormData) => {
    if (!editTarget) return;
    const payload: { nombre: string; correo: string; rol: string; clave?: string } = {
      nombre: form.nombre,
      correo: form.correo,
      rol:    form.rol,
    };
    if (form.clave) payload.clave = form.clave;
    const { data } = await editarUsuario(editTarget.id_usuario, payload);
    setUsuarios(prev => prev.map(u => u.id_usuario === data.id_usuario ? data : u));
    setEditTarget(null);
  };

  // eliminar
  const handleDelete = async () => {
    if (!deleteTarget) return;
    await eliminarUsuario(deleteTarget.id_usuario);
    setUsuarios(prev => prev.filter(u => u.id_usuario !== deleteTarget.id_usuario));
    setDeleteTarget(null);
  };

  // toggle estado
  const handleToggle = async (id: number) => {
    setToggling(id);
    try {
      const { estado } = await toggleUsuarioEstado(id);
      setUsuarios(prev => prev.map(u => u.id_usuario === id ? { ...u, estado: estado as UsuarioAdmin['estado'] } : u));
    } catch {
      setError('Error al cambiar el estado.');
    } finally {
      setToggling(null);
    }
  };

  const filtered = usuarios.filter(u => {
    const q = search.toLowerCase();
    const matchSearch = u.nombre.toLowerCase().includes(q) || u.correo.toLowerCase().includes(q);
    const matchRol    = rolFiltro === 'todos' || u.rol === rolFiltro;
    return matchSearch && matchRol;
  });

  const activos = usuarios.filter(u => u.estado === 'activo').length;

  return (
    <>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-medium text-[#1A365D]">Gestión de Usuarios</h1>
            <p className="text-sm text-gray-500 mt-0.5">{usuarios.length} usuarios registrados · {activos} activos</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={load}
              className="flex items-center gap-2 px-4 py-2 text-sm font-normal text-[#1A365D] border border-blue-200 rounded-xl hover:bg-[#EBF8FF] transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" /> Actualizar
            </button>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[#1A365D] hover:bg-[#0F2442] text-white rounded-xl transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Nuevo usuario
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o correo..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-800 outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1A365D] transition-all"
            />
          </div>
          <select
            value={rolFiltro}
            onChange={e => setRolFiltro(e.target.value as typeof rolFiltro)}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-800 outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1A365D] transition-all cursor-pointer"
          >
            <option value="todos">Todos los roles</option>
            {ROLES.map(r => <option key={r} value={r}>{ROL_LABEL[r]}</option>)}
          </select>
        </div>

        {/* Error global */}
        {error && (
          <p className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm font-normal text-red-600">{error}</p>
        )}

        {/* Tabla */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-gray-400">
              <div className="w-6 h-6 border-2 border-blue-200 border-t-[#3182CE] rounded-full animate-spin mr-3" />
              Cargando usuarios...
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <Users className="w-10 h-10 mb-3 opacity-40" />
              <p className="text-sm font-medium">No se encontraron usuarios</p>
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
                  <th className="text-right px-5 py-3.5 font-medium text-gray-500 uppercase tracking-wider text-xs">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(u => (
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
                    <td className="px-5 py-4 text-gray-500 font-medium hidden md:table-cell">{u.correo}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${ROL_COLOR[u.rol] ?? 'bg-gray-100 text-gray-600'}`}>
                        {ROL_LABEL[u.rol] ?? u.rol}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleToggle(u.id_usuario)}
                        disabled={toggling === u.id_usuario}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-opacity disabled:opacity-50
                          ${u.estado === 'activo' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-600 hover:bg-red-200'}`}
                      >
                        {toggling === u.id_usuario
                          ? '...'
                          : u.estado === 'activo' ? 'Activo' : 'Inactivo'}
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditTarget(u)}
                          title="Editar"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-[#1A365D] hover:bg-[#EBF8FF] transition-colors cursor-pointer"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(u)}
                          title="Eliminar"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>

      {/* Modal crear */}
      {showCreate && (
        <Modal title="Nuevo usuario" onClose={() => setShowCreate(false)}>
          <UserForm
            initial={EMPTY_FORM}
            isEdit={false}
            onSubmit={handleCreate}
            onCancel={() => setShowCreate(false)}
          />
        </Modal>
      )}

      {/* Modal editar */}
      {editTarget && (
        <Modal title="Editar usuario" onClose={() => setEditTarget(null)}>
          <UserForm
            initial={{ nombre: editTarget.nombre, correo: editTarget.correo, rol: editTarget.rol, clave: '' }}
            isEdit={true}
            onSubmit={handleEdit}
            onCancel={() => setEditTarget(null)}
          />
        </Modal>
      )}

      {/* Modal eliminar */}
      {deleteTarget && (
        <ConfirmDelete
          nombre={deleteTarget.nombre}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
};
