const BACKEND_ORIGIN = import.meta.env.VITE_API_URL;

if (!BACKEND_ORIGIN) {
  throw new Error(
    'Falta VITE_API_URL. Copia frontend/.env.example a frontend/.env y define ahí la URL del backend (ej: http://localhost:8000).'
  );
}

const BASE_URL = `${BACKEND_ORIGIN}/api`;

export function storageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${BACKEND_ORIGIN}${path}`;
}

export function documentoDownloadUrl(id_documento: number): string {
  return `${BASE_URL}/documentos/${id_documento}/download`;
}

export async function descargarDocumento(id_documento: number, nombre: string): Promise<void> {
  const token = localStorage.getItem('token');
  const res = await fetch(`${BASE_URL}/documentos/${id_documento}/download`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('No se pudo descargar el archivo.');
  const blob = await res.blob();
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = nombre;
  a.click();
  URL.revokeObjectURL(url);
}

function getToken(): string | null {
  return localStorage.getItem('token');
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Error desconocido' }));
    throw new Error(err.message ?? 'Error del servidor');
  }

  return res.json();
}

// Auth
export async function login(correo: string, clave: string) {
  return request<{ user: User; token: string }>('/login', {
    method: 'POST',
    body: JSON.stringify({ correo, clave }),
  });
}

export async function register(data: {
  nombre: string;
  correo: string;
  rol: 'mentor' | 'emprendedor';
  clave: string;
  clave_confirmation: string;
}) {
  return request<{ user: User; token: string }>('/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function logout() {
  return request('/logout', { method: 'POST' });
}


// Dashboard (filtra por rol en el backend)
export async function getDashboard() {
  return request<{ metrics: DashboardMetrics; projects: Project[] }>('/dashboard');
}

// Proyectos
export async function createProject(data: CreateProjectPayload) {
  return request<{ message: string; data: Project }>('/projects', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function evaluateProject(
  projectId: number,
  payload: { evaluation_notes: string; advance_stage: boolean }
) {
  return request(`/projects/${projectId}/evaluate`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function submitEntrega(projectId: number, descripcion: string, archivo?: File) {
  const token = getToken();
  const form = new FormData();
  form.append('descripcion', descripcion);
  if (archivo) form.append('archivo', archivo);

  const res = await fetch(`${BASE_URL}/projects/${projectId}/submit`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    body: form,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Error desconocido' }));
    throw new Error(err.message ?? 'Error del servidor');
  }
  return res.json() as Promise<{ message: string; data: Entrega }>;
}

export async function getEntregas(projectId: number) {
  return request<Entrega[]>(`/projects/${projectId}/submissions`);
}

export async function assignMentor(projectId: number, mentorId: number) {
  return request(`/projects/${projectId}/assign-mentor`, {
    method: 'POST',
    body: JSON.stringify({ mentor_id: mentorId }),
  });
}

// Proyectos
export async function getMisProyectos() {
  return request<Proyecto[]>('/proyectos');
}

export async function getMisProyectosAsignados() {
  return request<ProyectoConUsuario[]>('/proyectos/mis-asignados');
}

export async function crearProyecto(data: {
  nombre_proyecto: string;
  descripcion: string;
  sector_tecnologico?: string;
  problema_resuelve?: string;
  propuesta_valor?: string;
}) {
  return request<{ message: string; data: Proyecto }>('/proyectos', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function editarProyecto(id: number, data: {
  nombre_proyecto: string;
  descripcion: string;
  sector_tecnologico?: string;
  problema_resuelve?: string;
  propuesta_valor?: string;
}) {
  return request<{ message: string; data: Proyecto }>(`/proyectos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function getTodosProyectos() {
  return request<ProyectoConUsuario[]>('/proyectos/todos');
}

export async function cambiarEstadoProyecto(id: number, estado: Proyecto['estado']) {
  return request<{ message: string; data: Proyecto }>(`/proyectos/${id}/estado`, {
    method: 'PATCH',
    body: JSON.stringify({ estado }),
  });
}

export async function getProyectosAprobados() {
  return request<ProyectoAprobado[]>('/proyectos/aprobados');
}

export async function asignarDocente(id: number, id_docente: number | null) {
  return request<{ message: string; data: ProyectoAprobado }>(`/proyectos/${id}/asignar-docente`, {
    method: 'PATCH',
    body: JSON.stringify({ id_docente }),
  });
}

// Admin — Usuarios
export async function getUsuarios() {
  return request<UsuarioAdmin[]>('/usuarios');
}

export async function crearUsuario(data: { nombre: string; correo: string; rol: string; clave: string }) {
  return request<{ message: string; data: UsuarioAdmin }>('/usuarios', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function editarUsuario(id: number, data: { nombre: string; correo: string; rol: string; clave?: string }) {
  return request<{ message: string; data: UsuarioAdmin }>(`/usuarios/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function eliminarUsuario(id: number) {
  return request<{ message: string }>(`/usuarios/${id}`, { method: 'DELETE' });
}

export async function toggleUsuarioEstado(id: number) {
  return request<{ message: string; estado: string }>(`/usuarios/${id}/toggle-estado`, { method: 'PATCH' });
}

export async function getMentoresActivos() {
  return request<UsuarioAdmin[]>('/mentores-activos');
}

// Mentor — Perfil
export async function getMentorPerfil() {
  return request<MentorPerfil>('/mentor/perfil');
}

export async function actualizarMentorPerfil(data: {
  nombre: string;
  correo: string;
  especialidad?: string;
  clave?: string;
}) {
  return request<MentorPerfil & { message: string }>('/mentor/perfil', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export interface MentorPerfil {
  id_usuario: number;
  nombre: string;
  correo: string;
  especialidad: string | null;
}

// Admin — Asignaciones
export async function getAsignaciones(id_proyecto?: number) {
  const qs = id_proyecto !== undefined ? `?id_proyecto=${id_proyecto}` : '';
  return request<AsignacionDetalle[]>(`/asignaciones${qs}`);
}

export async function crearAsignacion(data: { id_proyecto: number; id_usuario: number }) {
  return request<{ message: string; data: AsignacionDetalle }>('/asignaciones', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function eliminarAsignacion(id: number) {
  return request<{ message: string }>(`/asignaciones/${id}`, { method: 'DELETE' });
}

// Admin — Mentores
export async function getMentors() {
  return request<MentorUser[]>('/mentors');
}

export async function createMentor(data: CreateMentorPayload) {
  return request<{ message: string; data: MentorUser }>('/mentors', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function deleteMentor(mentorId: number) {
  return request(`/mentors/${mentorId}`, { method: 'DELETE' });
}

// Seguimientos
export async function iniciarMentoria(id_proyecto: number) {
  return request<{ message: string; data: Seguimiento }>('/seguimientos/iniciar', {
    method: 'POST',
    body: JSON.stringify({ id_proyecto }),
  });
}

export async function getSeguimientosProyecto(id_proyecto: number) {
  return request<Seguimiento[]>(`/seguimientos/proyecto/${id_proyecto}`);
}

export async function avanzarEtapa(id_seguimiento: number) {
  return request<{ message: string; completo: boolean; data?: Seguimiento }>('/seguimientos/avanzar', {
    method: 'POST',
    body: JSON.stringify({ id_seguimiento }),
  });
}

// Revisiones
export interface RevisionDocumento extends Omit<Documento, 'usuario'> {}

export interface Revision {
  id_revision: number;
  id_seguimiento: number;
  fecha_envio: string;
  comentario_estudiante: string | null;
  observaciones: string | null;
  revisado: boolean;
  documentos: RevisionDocumento[];
}

export async function getRevisiones(id_seguimiento: number) {
  return request<Revision[]>(`/seguimientos/${id_seguimiento}/revisiones`);
}

export async function crearRevision(id_seguimiento: number, nombres: string[], archivos: File[], comentarioEstudiante?: string) {
  const token = localStorage.getItem('token');
  const form  = new FormData();
  archivos.forEach((f, i) => {
    form.append(`archivos[${i}]`, f);
    form.append(`nombres[${i}]`, nombres[i]);
  });
  if (comentarioEstudiante) {
    form.append('comentario_estudiante', comentarioEstudiante);
  }

  const res = await fetch(`${BASE_URL}/seguimientos/${id_seguimiento}/revisiones`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: form,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Error desconocido' }));
    throw new Error(err.message ?? 'Error del servidor');
  }
  return res.json() as Promise<{ message: string; data: Revision }>;
}

export async function guardarObservacionesRevision(id_revision: number, observaciones: string) {
  return request<{ message: string; data: Revision }>(`/revisiones/${id_revision}/observaciones`, {
    method: 'PATCH',
    body: JSON.stringify({ observaciones }),
  });
}

// Asesorías
export interface Asesoria {
  id_asesoria: number;
  id_seguimiento: number;
  titulo: string;
  descripcion: string | null;
  fecha: string;
  hora_inicio: string;
  hora_fin: string | null;
  modalidad: 'virtual' | 'presencial';
  enlace: string | null;
  lugar: string | null;
  estado: 'programada' | 'realizada' | 'cancelada';
  notas: string | null;
}

export async function getAsesorias(id_seguimiento: number) {
  return request<Asesoria[]>(`/seguimientos/${id_seguimiento}/asesorias`);
}

export async function crearAsesoria(id_seguimiento: number, data: Omit<Asesoria, 'id_asesoria' | 'id_seguimiento'>) {
  return request<{ message: string; data: Asesoria }>(`/seguimientos/${id_seguimiento}/asesorias`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function actualizarAsesoria(id_asesoria: number, data: Partial<Omit<Asesoria, 'id_asesoria' | 'id_seguimiento'>>) {
  return request<{ message: string; data: Asesoria }>(`/asesorias/${id_asesoria}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function eliminarAsesoria(id_asesoria: number) {
  return request<{ message: string }>(`/asesorias/${id_asesoria}`, { method: 'DELETE' });
}

// Documentos
export interface Documento {
  id_documento: number;
  id_proyecto: number;
  id_usuario: number;
  nombre: string;
  archivo: string;
  archivo_url: string;
  fecha: string;
  usuario?: { id_usuario: number; nombre: string };
}

export async function getDocumentosProyecto(id_proyecto: number) {
  return request<Documento[]>(`/proyectos/${id_proyecto}/documentos`);
}

export async function subirDocumento(id_proyecto: number, nombre: string, archivo: File) {
  const token = localStorage.getItem('token');
  const form  = new FormData();
  form.append('nombre', nombre);
  form.append('archivo', archivo);

  const res = await fetch(`${BASE_URL}/proyectos/${id_proyecto}/documentos`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: form,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Error desconocido' }));
    throw new Error(err.message ?? 'Error del servidor');
  }
  return res.json() as Promise<{ message: string; data: Documento }>;
}

export async function eliminarDocumento(id_documento: number) {
  return request(`/documentos/${id_documento}`, { method: 'DELETE' });
}

export async function getMisMentorias() {
  return request<(Proyecto & { seguimientos: Seguimiento[] })[]>('/seguimientos/mis-mentorias');
}

export async function getEntregasProyecto(id_proyecto: number) {
  return request<Entrega[]>(`/proyectos/${id_proyecto}/entregas`);
}

export async function subirEntrega(id_proyecto: number, descripcion: string, archivo?: File) {
  const token = localStorage.getItem('token');
  const form = new FormData();
  form.append('descripcion', descripcion);
  if (archivo) form.append('archivo', archivo);

  const res = await fetch(`${BASE_URL}/proyectos/${id_proyecto}/entregas`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: form,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Error desconocido' }));
    throw new Error(err.message ?? 'Error del servidor');
  }
  return res.json() as Promise<{ message: string; data: Entrega }>;
}

// Tipos
export interface Seguimiento {
  id_seguimiento: number;
  id_proyecto: number;
  id_etapa: number;
  id_mentor: number;
  fecha_inicio: string;
  fecha_fin: string | null;
  etapa?: { id_etapa: number; nombre_etapa: string; orden_etapa: number };
}

export interface User {
  id: number;
  nombre: string;
  correo: string;
  rol: 'administrador' | 'mentor' | 'emprendedor';
}

export interface Project {
  id: number;
  usuario_id: number;
  nombre: string;
  descripcion: string;
  sector_tecnologico: string;
  propuesta_valor: string;
  etapa: 'Ideación' | 'Validación' | 'Prototipo' | 'Incubación' | 'Escalamiento';
  entrepreneur?: User;
  mentors?: User[];
  progress_logs?: ProgressLog[];
}

export interface ProgressLog {
  id: number;
  accion: string;
  detalles: string;
  created_at: string;
}

export interface CreateProjectPayload {
  nombre: string;
  descripcion: string;
  sector_tecnologico: string;
  propuesta_valor: string;
}

export interface MentorUser {
  id: number;
  nombre: string;
  correo: string;
  especialidad: string | null;
  mentored_projects_count: number;
}

export interface CreateMentorPayload {
  nombre: string;
  correo: string;
  especialidad: string;
  contrasena: string;
}

export interface Entrega {
  id: number;
  proyecto_id: number;
  usuario_id: number;
  descripcion: string;
  archivo_nombre: string | null;
  archivo_url: string | null;
  created_at: string;
  usuario?: { id: number; nombre: string };
}

export interface ProyectoConUsuario extends Proyecto {
  usuario?: { id_usuario: number; nombre: string; correo: string };
}

export interface Proyecto {
  id_proyecto: number;
  id_usuario: number;
  id_docente: number | null;
  nombre_proyecto: string;
  descripcion: string;
  sector_tecnologico: string | null;
  problema_resuelve: string | null;
  propuesta_valor: string | null;
  estado: 'pendiente' | 'activo' | 'finalizado' | 'rechazado';
  fecha_registro: string;
  docente?: { id_usuario: number; nombre: string; correo: string } | null;
}

export interface ProyectoAprobado extends Proyecto {
  usuario?: { id_usuario: number; nombre: string; correo: string };
  docente?: { id_usuario: number; nombre: string; correo: string } | null;
  id_docente: number | null;
}

export interface UsuarioAdmin {
  id_usuario: number;
  nombre: string;
  correo: string;
  rol: 'administrador' | 'mentor' | 'emprendedor';
  estado: 'activo' | 'inactivo';
  fecha_registro: string | null;
}

export interface Asignacion {
  id_asignacion: number;
  id_proyecto: number;
  id_usuario: number;
  fecha: string;
  activo: 'si' | 'no';
}

export interface AsignacionDetalle extends Asignacion {
  usuario?: { id_usuario: number; nombre: string; correo: string; rol: string };
  proyecto?: { id_proyecto: number; nombre_proyecto: string };
}

export interface DashboardMetrics {
  // Entrepreneur
  total_projects?: number;
  active_projects?: number;
  // Mentor
  assigned_projects?: number;
  // Admin
  total_projects_system?: number;
  projects_by_stage?: Record<string, number>;
}

// Perfil emprendedor
export interface PerfilEmprendedor {
  id_usuario: number;
  nombre:     string;
  correo:     string;
  telefono:   string | null;
  carrera:    string | null;
  semestre:   string | null;
  bio:        string | null;
}

export async function getPerfilEmprendedor() {
  return request<PerfilEmprendedor>('/emprendedor/perfil');
}

export async function actualizarPerfilEmprendedor(data: Partial<PerfilEmprendedor> & { clave?: string }) {
  return request<{ message: string } & PerfilEmprendedor>('/emprendedor/perfil', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// ── Notificaciones ────────────────────────────────────────────────────────────

export interface Notificacion {
  id: number;
  id_usuario: number;
  tipo: string;
  mensaje: string;
  url: string | null;
  leida: boolean;
  created_at: string;
}

export async function getNotificaciones() {
  return request<Notificacion[]>('/notificaciones');
}

export async function marcarNotificacionLeida(id: number) {
  return request<{ message: string }>(`/notificaciones/${id}/leer`, { method: 'PATCH' });
}

export async function marcarTodasLeidas() {
  return request<{ message: string }>('/notificaciones/leer-todas', { method: 'PATCH' });
}

export async function eliminarNotificacionesLeidas() {
  return request<{ message: string }>('/notificaciones/leidas', { method: 'DELETE' });
}
