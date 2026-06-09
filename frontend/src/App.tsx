import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { Login } from './components/Login';
import { AdminDashboard } from './components/AdminDashboard';
import { MentorDashboard } from './components/MentorDashboard';
import { Dashboard } from './components/Dashboard';
import { logout as apiLogout, type User } from './api';

// Componente de redirección estable — evita el bucle de Navigate en React Router v7 + React 19
function Redirect({ to }: { to: string }) {
  const navigate = useNavigate();
  useEffect(() => { navigate(to, { replace: true }); }, [navigate, to]);
  return null;
}

function AppRoutes({ user, onLogin, onLogout }: {
  user: User | null;
  onLogin: (u: User, t: string) => void;
  onLogout: () => void;
}) {
  const destino = !user
    ? '/login'
    : user.rol === 'administrador' ? '/admin/dashboard'
    : user.rol === 'mentor'        ? '/mentor/dashboard'
    : '/emprendedor/dashboard';

  return (
    <Routes>
      {/* Raíz */}
      <Route path="/" element={<Redirect to={destino} />} />

      {/* Login */}
      <Route
        path="/login"
        element={user ? <Redirect to={destino} /> : <Login onLogin={onLogin} />}
      />

      {/* Admin */}
      <Route
        path="/admin/*"
        element={
          user?.rol === 'administrador'
            ? <AdminDashboard user={user} onLogout={onLogout} />
            : <Redirect to="/login" />
        }
      />

      {/* Mentor */}
      <Route
        path="/mentor/*"
        element={
          user?.rol === 'mentor'
            ? <MentorDashboard user={user} onLogout={onLogout} />
            : <Redirect to="/login" />
        }
      />

      {/* Emprendedor */}
      <Route
        path="/emprendedor/*"
        element={
          user?.rol === 'emprendedor'
            ? <Dashboard user={user} onLogout={onLogout} />
            : <Redirect to="/login" />
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<Redirect to={destino} />} />
    </Routes>
  );
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try { setUser(JSON.parse(savedUser)); } catch {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setReady(true);
  }, []);

  const handleLogin = (loggedUser: User, token: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(loggedUser));
    setUser(loggedUser);
  };

  const handleLogout = async () => {
    try { await apiLogout(); } catch { /* ignorar */ } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  if (!ready) return (
    <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
      <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <BrowserRouter>
      <AppRoutes user={user} onLogin={handleLogin} onLogout={handleLogout} />
    </BrowserRouter>
  );
}

export default App;
