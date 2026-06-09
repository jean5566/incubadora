import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, X, Trash2 } from 'lucide-react';
import {
  getNotificaciones, marcarNotificacionLeida, marcarTodasLeidas,
  eliminarNotificacionesLeidas, type Notificacion,
} from '../api';

const TIPO_COLOR: Record<string, string> = {
  nuevo_proyecto:    'bg-blue-100 text-blue-600',
  estado_proyecto:   'bg-amber-100 text-amber-600',
  asignacion_proyecto: 'bg-teal-100 text-teal-600',
  nueva_asesoria:    'bg-purple-100 text-purple-600',
};

interface Props {
  accentColor?: string; // color del badge y botones, ej: '#1A365D'
}

export const NotificacionesBell: React.FC<Props> = ({ accentColor = '#1A365D' }) => {
  const [notifs, setNotifs]     = useState<Notificacion[]>([]);
  const [open, setOpen]         = useState(false);
  const ref                     = useRef<HTMLDivElement>(null);

  const navigate  = useNavigate();
  const noLeidas  = notifs.filter(n => !n.leida).length;

  const cargar = async () => {
    try {
      const data = await getNotificaciones();
      setNotifs(data);
    } catch { /* silencioso */ }
  };

  useEffect(() => {
    cargar();
    const id = setInterval(cargar, 30_000);
    return () => clearInterval(id);
  }, []);

  // Cierra al hacer click fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLeer = async (n: Notificacion) => {
    if (!n.leida) {
      await marcarNotificacionLeida(n.id);
      setNotifs(prev => prev.map(x => x.id === n.id ? { ...x, leida: true } : x));
    }
    if (n.url) {
      setOpen(false);
      navigate(n.url);
    }
  };

  const handleLeerTodas = async () => {
    await marcarTodasLeidas();
    setNotifs(prev => prev.map(x => ({ ...x, leida: true })));
  };

  const hayLeidas = notifs.some(n => n.leida);

  const handleEliminarLeidas = async () => {
    await eliminarNotificacionesLeidas();
    setNotifs(prev => prev.filter(n => !n.leida));
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
        title="Notificaciones"
      >
        <Bell className="w-5 h-5 text-gray-500" />
        {noLeidas > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold text-white flex items-center justify-center"
            style={{ backgroundColor: accentColor }}
          >
            {noLeidas > 99 ? '99+' : noLeidas}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <span className="text-sm font-medium text-gray-700">Notificaciones</span>
            <div className="flex items-center gap-1">
              {noLeidas > 0 && (
                <button
                  onClick={handleLeerTodas}
                  title="Marcar todas como leídas"
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <CheckCheck className="w-4 h-4" />
                </button>
              )}
              {hayLeidas && (
                <button
                  onClick={handleEliminarLeidas}
                  title="Eliminar notificaciones leídas"
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Lista */}
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
            {notifs.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell className="w-6 h-6 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">Sin notificaciones.</p>
              </div>
            ) : (
              notifs.map(n => (
                <div
                  key={n.id}
                  onClick={() => handleLeer(n)}
                  className={`flex items-start gap-3 px-4 py-3 transition-colors cursor-pointer
                    ${n.leida ? 'bg-white hover:bg-gray-50' : 'bg-blue-50/50 hover:bg-blue-50'}`}
                >
                  <span className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${n.leida ? 'bg-gray-200' : 'bg-blue-500'}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs leading-relaxed ${n.leida ? 'text-gray-500' : 'text-gray-700 font-medium'}`}>
                      {n.mensaje}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {new Date(n.created_at).toLocaleDateString('es-EC', {
                        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  </div>
                  {!n.leida && (
                    <span className={`mt-1 shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${TIPO_COLOR[n.tipo] ?? 'bg-gray-100 text-gray-500'}`}>
                      nueva
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
