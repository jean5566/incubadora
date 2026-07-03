import React, { useState } from 'react';
import { login as apiLogin, register as apiRegister, type User as UserType } from '../api';
import { Mail, Lock, User, Briefcase, ChevronRight, LogIn, UserPlus, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface LoginProps {
  onLogin: (user: UserType, token: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');

  const [loginCorreo, setLoginCorreo] = useState('');
  const [loginClave,  setLoginClave]  = useState('');

  const [nombre,       setNombre]       = useState('');
  const [correo,       setCorreo]       = useState('');
  const [rol,          setRol]          = useState<'mentor' | 'emprendedor'>('emprendedor');
  const [clave,        setClave]        = useState('');
  const [confirmacion, setConfirmacion] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState('');
  const [success,   setSuccess]   = useState('');

  const [showLoginClave,    setShowLoginClave]    = useState(false);
  const [showClave,         setShowClave]         = useState(false);
  const [showConfirmacion,  setShowConfirmacion]  = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const { user, token } = await apiLogin(loginCorreo, loginClave);
      onLogin(user, token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Credenciales incorrectas.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (clave !== confirmacion) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setIsLoading(true);
    try {
      await apiRegister({
        nombre,
        correo: `${correo}@unesum.edu.ec`,
        rol,
        clave,
        clave_confirmation: confirmacion
      });
      setNombre('');
      setCorreo('');
      setClave('');
      setConfirmacion('');
      setSuccess('¡Cuenta creada con éxito! Ya puedes iniciar sesión.');
      switchMode('login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrarse.');
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = (m: 'login' | 'register') => {
    setMode(m);
    setError('');
    setSuccess('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 font-sans text-slate-800 bg-gradient-to-br from-[#0F2442] via-[#1A365D] to-[#0F2442] relative overflow-hidden">
      
      {/* Decorative background elements (Tech Theme) */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
        {/* Tech Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:32px_32px]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#0F2442_100%)] opacity-80"></div>
        
        {/* Glowing Orbs */}
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-blue-500/10 blur-[120px] rounded-full"></div>
        <div className="absolute top-[60%] -right-[10%] w-[40%] h-[60%] bg-indigo-400/10 blur-[100px] rounded-full"></div>

        {/* Tech Geometric Accents */}
        <div className="absolute top-[15%] right-[10%] w-64 h-64 border border-white/5 rounded-full"></div>
        <div className="absolute top-[18%] right-[11.5%] w-48 h-48 border border-blue-400/10 rounded-full border-dashed animate-[spin_60s_linear_infinite]"></div>
        
        <div className="absolute bottom-[10%] left-[5%] w-96 h-96 border border-white/5 rounded-full"></div>
        <div className="absolute bottom-[15%] left-[8%] w-72 h-72 border border-indigo-400/10 rounded-full border-dashed animate-[spin_40s_linear_infinite_reverse]"></div>
        
        {/* Crosshairs & Dots */}
        <div className="absolute top-[30%] left-[20%] w-2 h-2 bg-blue-400/30 rounded-full shadow-[0_0_10px_rgba(96,165,250,0.5)]"></div>
        <div className="absolute bottom-[40%] right-[25%] w-1 h-1 bg-white/30 rounded-full"></div>
        <div className="absolute top-[70%] left-[30%] flex gap-1">
          <div className="w-1 h-1 bg-white/20"></div>
          <div className="w-1 h-1 bg-white/20"></div>
          <div className="w-1 h-1 bg-white/20"></div>
        </div>
      </div>

      <div className="w-full max-w-6xl flex flex-col md:flex-row items-center justify-center gap-12 relative z-10 mx-auto">
        
        {/* Info Section on the background */}
        <div className="hidden md:flex md:flex-1 flex-col items-center text-white">
          <div className="max-w-md animate-in fade-in slide-in-from-left-8 duration-700">
            <h2 className="text-4xl font-extrabold mb-4 tracking-tight leading-tight">Incubación de<br/>Proyectos</h2>
            <p className="text-blue-100/90 leading-relaxed text-[16px] mb-10 font-medium">
              Nuestra plataforma está diseñada para acompañar a estudiantes y emprendedores en cada etapa de su proyecto. Desde la idea inicial hasta el lanzamiento, conectando talento con mentores clave.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10 group-hover:bg-white/20 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                  <Briefcase className="w-5 h-5 text-blue-200" />
                </div>
                <div>
                  <h3 className="font-bold text-[15px]">Proyectos Reales</h3>
                  <p className="text-sm text-blue-200/80 mt-0.5">Desarrollo de ideas con impacto directo en el mercado y la sociedad.</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10 group-hover:bg-white/20 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                  <UserPlus className="w-5 h-5 text-blue-200" />
                </div>
                <div>
                  <h3 className="font-bold text-[15px]">Mentoría Experta</h3>
                  <p className="text-sm text-blue-200/80 mt-0.5">Guía personalizada de profesionales y docentes del sector tecnológico.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Separador entre la sección informativa y el formulario */}
        <div className="hidden md:block w-px self-stretch bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>

        {/* Left Form Section (sin tarjeta: flota directo sobre el fondo) */}
        <div className="w-full flex flex-1 flex-col items-center">
          <div className="flex flex-col items-center text-center">
            {mode === 'login' && (
              <div className="mb-5 inline-block animate-in fade-in zoom-in duration-300">
                <img src="/logo.png" alt="Logo de Tecnologías de la Información" className="h-20 w-auto object-contain drop-shadow-md transition-transform hover:scale-105 duration-300" />
              </div>
            )}
            <h1 className="text-2xl font-extrabold text-white m-0 tracking-tight">Tecnologías de la Información</h1>
            <p className="text-sm font-medium text-blue-100/70 mt-2">
              {mode === 'login' ? 'Bienvenido de nuevo al portal' : 'Crea tu cuenta institucional'}
            </p>
          </div>

          <div className="flex justify-center mt-6 mb-6">
            <div className="inline-flex gap-1 bg-white/5 p-1.5 border border-white/10 rounded-full">
              <button
                className={`px-6 py-2 text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 rounded-full ${
                  mode === 'login'
                    ? 'bg-white/90 text-[#1A365D] shadow-sm'
                    : 'text-blue-200/60 hover:text-white hover:bg-white/10'
                }`}
                onClick={() => switchMode('login')}
                type="button"
              >
                <LogIn className="w-4 h-4" />
                Ingresar
              </button>
              <button
                className={`px-6 py-2 text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 rounded-full ${
                  mode === 'register'
                    ? 'bg-white/90 text-[#1A365D] shadow-sm'
                    : 'text-blue-200/60 hover:text-white hover:bg-white/10'
                }`}
                onClick={() => switchMode('register')}
                type="button"
              >
                <UserPlus className="w-4 h-4" />
                Registrarse
              </button>
            </div>
          </div>

          {success && (
            <div className="w-full max-w-sm mt-2 mb-2 p-4 bg-green-500/10 border border-green-400/30 flex items-start gap-3 backdrop-blur-sm rounded-2xl">
              <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 shrink-0" />
              <p className="text-sm text-green-300 font-medium m-0">{success}</p>
            </div>
          )}

          {error && (
            <div className="w-full max-w-sm mt-2 mb-2 p-4 bg-red-500/10 border border-red-400/30 flex items-start gap-3 backdrop-blur-sm rounded-2xl">
              <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
              <p className="text-sm text-red-300 font-medium m-0">{error}</p>
            </div>
          )}

          <div className="w-full pt-2">
            {mode === 'login' ? (
            <form onSubmit={handleLogin} className="max-w-sm mx-auto w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex flex-col gap-1.5 group mb-5">
                <label className="text-[13px] font-semibold text-blue-100/80 ml-1">Correo Electrónico</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-blue-200/50 group-focus-within:text-blue-300 transition-colors">
                    <Mail className="h-5 w-5" />
                  </div>
                  <input
                    type="email"
                    value={loginCorreo}
                    onChange={e => setLoginCorreo(e.target.value)}
                    placeholder="ejemplo@universidad.edu"
                    required
                    className="w-full pl-11 pr-4 py-3 border-white/10 bg-white/5 text-white placeholder-blue-200/40 focus:outline-none focus:border-blue-400 focus:bg-white/10 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200 border rounded-2xl"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 group mb-6">
                <label className="text-[13px] font-semibold text-blue-100/80 ml-1">Contraseña</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-blue-200/50 group-focus-within:text-blue-300 transition-colors">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    type={showLoginClave ? 'text' : 'password'}
                    value={loginClave}
                    onChange={e => setLoginClave(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-11 pr-11 py-3 border-white/10 bg-white/5 text-white placeholder-blue-200/40 focus:outline-none focus:border-blue-400 focus:bg-white/10 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200 border rounded-2xl"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginClave(v => !v)}
                    tabIndex={-1}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-blue-200/50 hover:text-blue-200 transition-colors"
                    aria-label={showLoginClave ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showLoginClave ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading} 
                className="mt-4 w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-white hover:bg-blue-50 text-[#1A365D] font-semibold shadow-lg shadow-black/20 transition-all duration-300 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group rounded-2xl"
              >
                {isLoading ? 'Ingresando...' : 'Entrar al Portal'}
                {!isLoading && <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="max-w-sm mx-auto grid grid-cols-2 gap-x-4 gap-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex flex-col gap-1.5 group col-span-1">
                <label className="text-[13px] font-semibold text-blue-100/80 ml-1">Nombre Completo</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-blue-200/50 group-focus-within:text-blue-300 transition-colors">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    value={nombre}
                    onChange={e => setNombre(e.target.value)}
                    placeholder="Ej: Ana García"
                    required
                    className="w-full pl-9 pr-3 py-2.5 text-sm border-white/10 bg-white/5 text-white placeholder-blue-200/40 focus:outline-none focus:border-blue-400 focus:bg-white/10 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200 border rounded-2xl"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 group col-span-1">
                <label className="text-[13px] font-semibold text-blue-100/80 ml-1">Rol</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-blue-200/50 group-focus-within:text-blue-300 transition-colors z-10">
                    <Briefcase className="h-4 w-4" />
                  </div>
                  <select
                    value={rol}
                    onChange={e => setRol(e.target.value as 'mentor' | 'emprendedor')}
                    className="w-full pl-9 pr-8 py-2.5 text-sm border-white/10 bg-white/5 text-white focus:outline-none focus:border-blue-400 focus:bg-white/10 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200 border appearance-none relative bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2393c5fd%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_0.5rem_center] bg-[length:0.6rem_auto] rounded-2xl"
                  >
                    <option value="emprendedor" className="text-slate-800">Emprendedor</option>
                    <option value="mentor" className="text-slate-800">Docente</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 group col-span-2">
                <label className="text-[13px] font-semibold text-blue-100/80 ml-1">Correo Institucional</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-blue-200/50 group-focus-within:text-blue-300 transition-colors">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    value={correo}
                    onChange={e => setCorreo(e.target.value.split('@')[0])}
                    placeholder="usuario"
                    required
                    className="w-full pl-9 pr-32 py-2.5 text-sm border-white/10 bg-white/5 text-white placeholder-blue-200/40 focus:outline-none focus:border-blue-400 focus:bg-white/10 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200 border rounded-2xl"
                  />
                  <span className="absolute inset-y-0 right-3 flex items-center text-sm text-blue-200/50 pointer-events-none">
                    @unesum.edu.ec
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 group col-span-2">
                <label className="text-[13px] font-semibold text-blue-100/80 ml-1">Contraseña</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-blue-200/50 group-focus-within:text-blue-300 transition-colors">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showClave ? 'text' : 'password'}
                    value={clave}
                    onChange={e => setClave(e.target.value)}
                    placeholder="Mín. 8"
                    required
                    minLength={8}
                    className="w-full pl-9 pr-9 py-2.5 text-sm border-white/10 bg-white/5 text-white placeholder-blue-200/40 focus:outline-none focus:border-blue-400 focus:bg-white/10 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200 border rounded-2xl"
                  />
                  <button
                    type="button"
                    onClick={() => setShowClave(v => !v)}
                    tabIndex={-1}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-blue-200/50 hover:text-blue-200 transition-colors"
                    aria-label={showClave ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showClave ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 group col-span-2">
                <label className="text-[13px] font-semibold text-blue-100/80 ml-1">Confirmar</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-blue-200/50 group-focus-within:text-blue-300 transition-colors">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <input
                    type={showConfirmacion ? 'text' : 'password'}
                    value={confirmacion}
                    onChange={e => setConfirmacion(e.target.value)}
                    placeholder="Repetir"
                    required
                    className={`w-full pl-9 pr-9 py-2.5 text-sm border bg-white/5 text-white placeholder-blue-200/40 focus:outline-none focus:bg-white/10 focus:ring-2 transition-all duration-200 rounded-2xl ${
                      confirmacion && clave !== confirmacion
                        ? 'border-red-400/50 focus:border-red-400 focus:ring-red-400/20'
                        : 'border-white/10 focus:border-blue-400 focus:ring-blue-400/20'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmacion(v => !v)}
                    tabIndex={-1}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-blue-200/50 hover:text-blue-200 transition-colors"
                    aria-label={showConfirmacion ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showConfirmacion ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="col-span-2 pt-2">
                <button
                  type="submit"
                  disabled={isLoading || (!!confirmacion && confirmacion !== clave)}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white hover:bg-blue-50 text-[#1A365D] font-semibold shadow-lg shadow-black/20 transition-all duration-300 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group rounded-2xl"
                >
                  {isLoading ? 'Registrando...' : 'Completar Registro'}
                  {!isLoading && <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                </button>
              </div>
            </form>
          )}
          </div>
        </div>
      </div>
    </div>
  );
};
