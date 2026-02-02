import { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../context/NotificationContext';

function NotificationBell() {
  const { notifications, unreadCount, isConnected, markAsRead, markAllAsRead, clearNotifications } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new_order':
        return '📦';
      case 'order_assigned':
        return '🚚';
      case 'order_status_changed':
        return '📊';
      default:
        return '🔔';
    }
  };

  const getTimeAgo = (timestamp) => {
    const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
    
    if (seconds < 60) return 'Justo ahora';
    if (seconds < 3600) return `Hace ${Math.floor(seconds / 60)} min`;
    if (seconds < 86400) return `Hace ${Math.floor(seconds / 3600)} h`;
    return `Hace ${Math.floor(seconds / 86400)} d`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botón de campana */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors bg-transparent"
      >
        {/* Ícono SVG de campana */}
        <svg 
          className="w-6 h-6 text-gray-700" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
          />
        </svg>
        
        {/* Badge de notificaciones no leídas */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
        
        {/* Indicador de conexión */}
        <span 
          className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
            isConnected ? 'bg-green-500' : 'bg-gray-400'
          }`}
          title={isConnected ? 'Conectado' : 'Desconectado'}
        />
      </button>

      {/* Dropdown de notificaciones */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50">
          {/* Header */}
          <div className="bg-gradient-to-r from-sky-50 to-cyan-50 px-4 py-3 border-b border-slate-200">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-800">
                Notificaciones {unreadCount > 0 && `(${unreadCount})`}
              </h3>
              
              <div className="flex gap-2">
                {notifications.length > 0 && (
                  <>
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-sky-600 hover:text-sky-800 font-medium"
                    >
                      Marcar todas
                    </button>
                    <button
                      onClick={clearNotifications}
                      className="text-xs text-slate-500 hover:text-slate-700 font-medium"
                    >
                      Limpiar
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Lista de notificaciones */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <span className="text-5xl mb-4 block">🔔</span>
                <p className="text-sm">No tienes notificaciones</p>
              </div>
            ) : (
              notifications.map((notification, index) => (
                <div
                  key={index}
                  onClick={() => markAsRead(index)}
                  className={`px-4 py-3 border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors ${
                    !notification.read ? 'bg-sky-50' : ''
                  }`}
                >
                  <div className="flex gap-3">
                    {/* Icono */}
                    <div className="flex-shrink-0 text-2xl">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    {/* Contenido */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-sm text-slate-800 truncate">
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <span className="flex-shrink-0 h-2 w-2 bg-sky-500 rounded-full"></span>
                        )}
                      </div>
                      
                      <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      
                      <p className="text-xs text-slate-400 mt-2">
                        {getTimeAgo(notification.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer con estado de conexión */}
          <div className="px-4 py-2 bg-slate-50 text-xs text-slate-500 flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`}></span>
            {isConnected ? 'Conectado en tiempo real' : 'Desconectado'}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
