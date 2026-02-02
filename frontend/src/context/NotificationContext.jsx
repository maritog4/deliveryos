import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { authService } from '../services/authService';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    // Crear elemento de audio para notificación
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjKH0fPTgjMGHm7A7+OZRQ0PVqzn77FfGAU+ltrzxnMnBSt+zPLaizsIGGS57OmjUBELTKXh8bllHAU2jtXzzn0pBSl6yu/ekDsKE1+16+qnVBELSKDf8r9pIAYugdDz1YU2Bhxqvu7mnUoPEVOo5PG2ZRsFOJHX8stzJgUpdcvv3o8+ChNftuvqplQRCkef3/K+aCAGLoHQ89WFNgYcab7u5p1KDxBUqOTxt2YbBTiR1/PLcyYFKXXL796OPwoTX7br6qZUEQpHn9/yvmggBi6B0PPVhTYGHGm+7uadSg8QVKjk8bdmGwU4kdfzy3MmBSl1y+/ejj8KE1+26+qmVBEKR5/f8r5oIAYugdDz1YU2Bhxpvu7mnUoPEFSo5PG3ZhsFOJHX8stzJgUpdcvv3o4/ChNftuvqplQRCkef3/K+aCAGLoHQ89WFNgYcab7u5p1KDxBUqOTxt2YbBTiR1/PLcyYFKXXL796OPwoTX7br6qZUEQpHn9/yvmggBi6B0PPVhTYGHGm+7uadSg8QVKjk8bdmGwU4kdfzy3MmBSl1y+/ejj8KE1+26+qmVBEKR5/f8r5oIAYugdDz1YU2Bhxpvu7mnUoPEFSo5PG3ZhsFOJHX8stzJgUpdcvv3o4/ChNftuvqplQRCkef3/K+aCAGLoHQ89WFNgYcab7u5p1KDxBUqOTxt2YbBTiR1/PLcyYFKXXL796OPwoTX7br6qZUEQpHn9/yvmggBi6B0PPVhTYGHGm+7uadSg8QVKjk8bdmGwU4kdfzy3MmBSl1y+/ejj8KE1+26+qmVBEKR5/f8r5oIAYugdDz1YU2Bhxpvu7mnUoPEFSo5PG3ZhsFOJHX8stzJgUpdcvv');

    const user = authService.getCurrentUser();
    
    // WEBSOCKET DESHABILITADO - Evitar errores de conexión
    // TODO: Habilitar cuando el servidor WebSocket esté estable
    
    /*
    if (user) {
      socketRef.current = io('http://localhost:3001', {
        transports: ['polling', 'websocket'],
        upgrade: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        timeout: 20000,
        autoConnect: true
      });

      socketRef.current.on('connect', () => {
        console.log('✅ Conectado a WebSocket');
        setIsConnected(true);
        socketRef.current.emit('register', {
          userId: user.id,
          role: user.role
        });
      });

      socketRef.current.on('disconnect', () => {
        console.log('❌ Desconectado de WebSocket');
        setIsConnected(false);
      });

      socketRef.current.on('connect_error', (error) => {
        console.log('⚠️ Error de conexión (intentando reconectar):', error.message);
      });

      socketRef.current.on('reconnect', (attemptNumber) => {
        console.log('🔄 Reconectado después de', attemptNumber, 'intentos');
      });

      socketRef.current.on('notification', (notification) => {
        console.log('📬 Nueva notificación:', notification);
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
        if (audioRef.current) {
          audioRef.current.play().catch(e => console.log('No se pudo reproducir audio'));
        }
        if (Notification.permission === 'granted') {
          new Notification(notification.title, {
            body: notification.message,
            icon: '/logo.png',
            badge: '/logo.png'
          });
        }
      });

      if (user.role === 'admin') {
        socketRef.current.on('order_update', (data) => {
          console.log('📊 Actualización de orden:', data);
        });
      }
    }
    */

    // Solicitar permiso para notificaciones del navegador
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Función para emitir evento de nueva orden
  const notifyNewOrder = (orderData) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('new_order', orderData);
    }
  };

  // Función para notificar asignación de orden
  const notifyOrderAssigned = (data) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('order_assigned', data);
    }
  };

  // Función para notificar cambio de estado
  const notifyOrderStatusChanged = (data) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('order_status_changed', data);
    }
  };

  // Marcar notificación como leída
  const markAsRead = (index) => {
    setNotifications(prev => {
      const updated = [...prev];
      if (!updated[index].read) {
        updated[index].read = true;
        setUnreadCount(count => Math.max(0, count - 1));
      }
      return updated;
    });
  };

  // Marcar todas como leídas
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  // Limpiar notificaciones
  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const value = {
    notifications,
    unreadCount,
    isConnected,
    notifyNewOrder,
    notifyOrderAssigned,
    notifyOrderStatusChanged,
    markAsRead,
    markAllAsRead,
    clearNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
