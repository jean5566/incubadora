import React, { useState } from 'react';
import {
  GraduationCap, Mail, Lock, LogIn, ArrowRight,
  User, Eye, EyeOff, CheckCircle2, AlertCircle,
} from 'lucide-react';
import { login as apiLogin, register as apiRegister, type User as UserType } from '../api';

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
  const [showPass,     setShowPass]     = useState(false);
  const [showLogin,    setShowLogin]    = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState('');
  const [success,   setSuccess]   = useState('');

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
    if (clave !== confirmacion) { setError('Las contraseñas no coinciden.'); return; }
    setIsLoading(true);
    try {
      await apiRegister({ nombre, correo, rol, clave, clave_confirmation: confirmacion });
      setNombre(''); setCorreo(''); setClave(''); setConfirmacion('');
      setSuccess('¡Cuenta creada! Ya puedes iniciar sesión.');
      switchMode('login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrarse.');
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = (m: 'login' | 'register') => { setMode(m); setError(''); setSuccess(''); };

  const inp = 'w-full pl-10 pr-3 py-2.5 border-b border-gray-200 bg-transparent text-sm text-gray-800 outline-none focus:border-teal-500 transition-colors placeholder:text-gray-300';
  const lbl = 'block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1';

  return (
    <div className="h-screen w-screen flex items-center justify-center font-sans overflow-hidden relative"
      style={{
        background: 'radial-gradient(ellipse at 20% 50%, #ccfbf1 0%, #f0fdf9 40%, #d1fae5 100%)',
      }}
    >
      {/* Decoración de fondo — círculos */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-teal-100/60 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-emerald-100/60 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-teal-50/80 blur-2xl" />
      </div>

      {/* Card principal */}
      <div className="relative z-10 w-full max-w-4xl mx-4 flex rounded-3xl overflow-hidden shadow-2xl shadow-indigo-200/50">

        {/* ── Franja izquierda ── */}
        <div className="w-2 shrink-0 bg-gradient-to-b from-teal-400 via-emerald-500 to-green-600" />

        {/* ── Contenido ── */}
        <div className="flex-1 flex bg-white">

          {/* Columna izquierda — branding */}
          <div className="hidden md:flex md:w-5/12 flex-col justify-between p-10 bg-gradient-to-br from-teal-600 to-emerald-700 text-white relative overflow-hidden">

            {/* Patrón de puntos */}
            <div className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />

            {/* Forma decorativa */}
            <div className="absolute -bottom-16 -right-16 w-56 h-56 rounded-full bg-white/10" />
            <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-white/5" />

            <div className="relative z-10">
              <div className="w-11 h-11 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center mb-6">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <p className="text-xs font-bold tracking-widest text-teal-100 uppercase mb-2">UniIncubadora</p>
              <h2 className="text-2xl font-extrabold leading-tight text-white">
                Del aula<br />al mercado.
              </h2>
              <p className="text-teal-100 text-sm mt-3 leading-relaxed">
                Plataforma para gestionar proyectos de emprendimiento universitario.
              </p>
            </div>

            <div className="relative z-10 space-y-3">
              {[
                'Seguimiento por etapas de incubación',
                'Mentoría personalizada para cada proyecto',
                'Gestión de entregas y revisiones',
              ].map(t => (
                <div key={t} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-200 shrink-0 mt-0.5" />
                  <p className="text-teal-50 text-xs leading-relaxed">{t}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Columna derecha — formulario */}
          <div className="flex-1 flex flex-col justify-between p-8 md:p-10">

            {/* Header */}
            <div>
              {/* Branding móvil */}
              <div className="flex items-center gap-2 mb-6 md:hidden">
                <GraduationCap className="w-5 h-5 text-teal-600" />
                <span className="text-sm font-bold text-teal-600 uppercase tracking-widest">UniIncubadora</span>
              </div>

              <h1 className="text-2xl font-extrabold text-gray-900">
                {mode === 'login' ? 'Hola, bienvenido' : 'Crear cuenta'}
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                {mode === 'login'
                  ? 'Ingresa para continuar en la plataforma.'
                  : 'Regístrate con tu correo institucional.'}
              </p>

              {/* Tabs pill */}
              <div className="flex gap-1 mt-5 mb-6 p-1 bg-gray-100 rounded-xl w-fit">
                {(['login', 'register'] as const).map(m => (
                  <button key={m} onClick={() => switchMode(m)}
                    className={`px-5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer
                      ${mode === m
                        ? 'bg-white text-teal-600 shadow-sm'
                        : 'text-gray-400 hover:text-gray-600'}`}>
                    {m === 'login' ? 'Ingresar' : 'Registrarse'}
                  </button>
                ))}
              </div>

              {/* Alertas */}
              {success && (
                <div className="flex items-center gap-2 mb-4 px-4 py-2.5 bg-green-50 border border-green-200 rounded-xl text-green-700 text-xs font-medium">
                  <CheckCircle2 className="w-4 h-4 shrink-0" /> {success}
                </div>
              )}
              {error && (
                <div className="flex items-center gap-2 mb-4 px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                </div>
              )}
            </div>

            {/* Slider de formularios */}
            <div className="flex-1 overflow-hidden">
              <div
                className="flex w-[200%] h-full transition-transform duration-500 ease-in-out"
                style={{ transform: mode === 'register' ? 'translateX(-50%)' : 'translateX(0)' }}
              >

                {/* LOGIN */}
                <div className="w-1/2 flex flex-col justify-center space-y-5">
                  <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                      <label className={lbl}>Correo electrónico</label>
                      <div className="relative">
                        <Mail className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                        <input type="email" value={loginCorreo} onChange={e => setLoginCorreo(e.target.value)}
                          required className={inp} placeholder="usuario@universidad.edu.ec" />
                      </div>
                    </div>
                    <div>
                      <label className={lbl}>Contraseña</label>
                      <div className="relative">
                        <Lock className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                        <input type={showLogin ? 'text' : 'password'} value={loginClave}
                          onChange={e => setLoginClave(e.target.value)} required
                          className={`${inp} pr-10`} placeholder="••••••••" />
                        <button type="button" onClick={() => setShowLogin(p => !p)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 cursor-pointer">
                          {showLogin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <button type="submit" disabled={isLoading}
                      className="w-full py-3 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 shadow-lg shadow-teal-200 mt-2">
                      {isLoading
                        ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        : <><LogIn className="w-4 h-4" /> Ingresar</>}
                    </button>
                  </form>
                </div>

                {/* REGISTER */}
                <div className="w-1/2 flex flex-col justify-center">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className={lbl}>Nombre completo</label>
                        <div className="relative">
                          <User className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                          <input type="text" value={nombre} onChange={e => setNombre(e.target.value)}
                            required className={inp} placeholder="Pedro Sáenz" />
                        </div>
                      </div>
                      <div className="col-span-2">
                        <label className={lbl}>Correo institucional</label>
                        <div className="relative">
                          <Mail className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                          <input type="email" value={correo} onChange={e => setCorreo(e.target.value)}
                            required className={inp} placeholder="usuario@universidad.edu.ec" />
                        </div>
                      </div>
                      <div className="col-span-2">
                        <label className={lbl}>Rol</label>
                        <select value={rol} onChange={e => setRol(e.target.value as 'mentor' | 'emprendedor')}
                          className="w-full pb-2 border-b border-gray-200 bg-transparent text-sm text-gray-700 outline-none focus:border-teal-500 transition-colors cursor-pointer">
                          <option value="emprendedor">Estudiante (Emprendedor)</option>
                          <option value="mentor">Docente (Mentor)</option>
                        </select>
                      </div>
                      <div>
                        <label className={lbl}>Contraseña</label>
                        <div className="relative">
                          <Lock className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                          <input type={showPass ? 'text' : 'password'} value={clave}
                            onChange={e => setClave(e.target.value)} required minLength={8}
                            className={`${inp} pr-9`} placeholder="Mín. 8 chars" />
                          <button type="button" onClick={() => setShowPass(p => !p)}
                            className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 cursor-pointer">
                            {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className={lbl}>Confirmar</label>
                        <div className="relative">
                          <Lock className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                          <input type={showPass ? 'text' : 'password'} value={confirmacion}
                            onChange={e => setConfirmacion(e.target.value)} required
                            className={`${inp} ${confirmacion && confirmacion !== clave ? '!border-red-400' : ''}`}
                            placeholder="Repetir" />
                        </div>
                        {confirmacion && confirmacion !== clave && (
                          <p className="text-[10px] text-red-400 mt-1">No coinciden</p>
                        )}
                      </div>
                    </div>
                    <button type="submit"
                      disabled={isLoading || (!!confirmacion && confirmacion !== clave)}
                      className="w-full py-3 rounded-2xl bg-gradient-to-r from-teal-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-indigo-200 mt-1">
                      {isLoading
                        ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        : <><ArrowRight className="w-4 h-4" /> Crear Cuenta</>}
                    </button>
                  </form>
                </div>

              </div>
            </div>

            {/* Footer */}
            <p className="text-xs text-gray-400 text-center pt-4 border-t border-gray-100 mt-4">
              {mode === 'login'
                ? <>¿No tienes cuenta?{' '}<button onClick={() => switchMode('register')} className="text-teal-600 font-semibold hover:underline cursor-pointer">Regístrate aquí</button></>
                : <>¿Ya tienes cuenta?{' '}<button onClick={() => switchMode('login')} className="text-teal-600 font-semibold hover:underline cursor-pointer">Inicia sesión</button></>
              }
            </p>

          </div>
        </div>
      </div>
    </div>
  );
};
