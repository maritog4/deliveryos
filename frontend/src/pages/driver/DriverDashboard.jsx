import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import NotificationBell from '../../components/NotificationBell';
import { 
  MapPinIcon, 
  ClockIcon, 
  PhoneIcon, 
  CheckCircleIcon,
  TruckIcon,
  XCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

const API_URL = 'http://localhost/deliverySv/backend/api';

export default function DriverDashboard() {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingLocation, setUpdatingLocation] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'driver') {
      navigate('/admin-login');
      return;
    }
    
    // Pedir permiso para notificaciones del navegador
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    
    fetchDriverOrders();
    // Actualizar órdenes cada 10 segundos (más rápido que antes)
    const interval = setInterval(() => {
      fetchDriverOrders(true); // true = actualización automática silenciosa
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchDriverOrders = async (isAutoRefresh = false) => {
    if (isAutoRefresh) {
      setIsRefreshing(true);
    }
    
    try {
      const response = await fetch(`${API_URL}/orders/driver-orders.php?driver_id=${user.id}`, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      });
      const data = await response.json();
      if (data.success) {
        const newOrders = data.orders || [];
        
        // Detectar si hay nuevas órdenes
        if (isAutoRefresh && orders.length > 0 && newOrders.length > orders.length) {
          // Nueva orden detectada - reproducir sonido
          playNotificationSound();
          // Mostrar notificación visual (opcional)
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Nueva Orden Asignada', {
              body: `Tienes ${newOrders.length - orders.length} nueva(s) orden(es)`,
              icon: '/favicon.svg'
            });
          }
        }
        
        setOrders(newOrders);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
      if (isAutoRefresh) {
        setTimeout(() => setIsRefreshing(false), 500);
      }
    }
  };

  // Función para reproducir sonido de notificación
  const playNotificationSound = () => {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYHGGS57OihUhELTKXh8bllHAU2jdXvymopBSl+zPLaizsKE2S56+mjUBEKSKHe8bNeHgU7k9n0xnEpBSh+zPDaizsKE2K36+mjTxAKSKHf8bNeHgU6k9j0xnEpBSh9y/DaizsKE2K36+mjTxAKSKHf8bNeHgU7k9j0xnEpBSh9y/DaizsKE2K36+mjTxAKSKHf8bNeHgU7k9j0xnEpBSh9y/DaizsKE2K36+mjTxAKSKHf8bNeHgU7k9j0xnEpBSh9y/DaizsKE2K36+mjTxAKSKHf8bNeHgU7k9j0xnEpBSh9y/DaizsKE2K36+mjTxAKSKHf8bNeHgU7k9j0xnEpBSh9y/DaizsKE2K36+mjTxAKSKHf8bNeHgU7k9j0xnEpBSh9y/DaizsKE2K36+mjTxAKSKHf8bNeHgU7k9j0xnEpBSh9y/DaizsKE2K36+mjTxAKSKHf8bNeHgU7k9j0xnEpBSh9y/DaizsKE2K36+mjTxAKSKHf8bNeHgU7k9j0xnEpBSh9y/DaizsKE2K36+mjTxAKSKHf8bNeHgU7k9j0xnEpBSh9y/DaizsKE2K36+mjTxAKSKHf8bNeHgU7k9j0xnEpBSh9y/DaizsKE2K36+mjTxAKSKHf8bNeHgU7k9j0xnEpBSh9y/DaizsKE2K36+mjTxAKSKHf8bNeHgU7k9j0xnEpBSh9y/DaizsKE2K36+mjTxAKSKHf8bNeHgU7k9j0xnEpBSh9y/DaizsKE2K36+mjTxAKSKHf8bNeHgU7k9j0xnEpBSh9y/DaizsKE2K36+mjTxAKSKHf8bNeHgU7k9j0xnEpBSh9y/DaizsKE2K36+mjTxAKSKHf8bNeHgU7k9j0xnEpBSh9y/DaizsKE2K36+mjTxAKSKHf8bNeHgU7k9j0xnEpBSh9y/DaizsKE2K36+mjTxAKSKHf8bNeHgU7k9j0xnEpBSh9y/DaizsKE2K36+mjTxAKSKHf8bNeHgU7k9j0xnEpBSh9y/DaizsKE2K36+mjTxAKSKHf8bNeHgU7k9j0xnEpBSh9y/DaizsKE2K36+mjTxAKSKHf8bNeHgU7k9j0xnEpBSh9y/DaizsKE2K36+mjTxAKSKHf8bNeHgU7k9j0xnEpBSh9y/DaizsKE2K36+mjTxAKSKHf8bNeHgU7k9j0xnEpBSh9y/DaizsKE2K36+mjTxAKSKHf8bNeHgU7k9j0xnEpBSh9y/DaizsKE2K36+mjTxAKSKHf8bNeHgU7k9j0xnEpBSh9y/DaizsKE2K36+mjTxAK');
      audio.volume = 0.5;
      audio.play().catch(e => console.log('Could not play sound:', e));
    } catch (e) {
      console.log('Notification sound not available');
    }
  };

  // Función para actualización manual
  const handleManualRefresh = () => {
    setLoading(true);
    fetchDriverOrders(false);
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const response = await fetch(`${API_URL}/orders/driver-update-status.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`
        },
        body: JSON.stringify({
          order_id: orderId,
          status: status,
          driver_id: user.id
        })
      });

      const data = await response.json();
      if (data.success) {
        fetchDriverOrders();
        if (status === 'delivered') {
          setSelectedOrder(null);
        }
      } else {
        alert(data.message || 'Error al actualizar el estado');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error al actualizar el estado');
    }
  };

  const updateLocation = async (orderId) => {
    if (!navigator.geolocation) {
      alert('Tu navegador no soporta geolocalización');
      return;
    }

    setUpdatingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const response = await fetch(`${API_URL}/orders/update-location.php`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authService.getToken()}`
            },
            body: JSON.stringify({
              order_id: orderId,
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            })
          });

          const data = await response.json();
          if (data.success) {
            alert('✓ Ubicación actualizada');
            fetchDriverOrders();
          }
        } catch (error) {
          console.error('Error updating location:', error);
          alert('Error al actualizar la ubicación');
        } finally {
          setUpdatingLocation(false);
        }
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('No se pudo obtener tu ubicación');
        setUpdatingLocation(false);
      }
    );
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      preparing: 'bg-purple-100 text-purple-800',
      ready: 'bg-green-100 text-green-800',
      in_transit: 'bg-sky-100 text-sky-800',
      on_the_way: 'bg-sky-100 text-sky-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'Pendiente',
      confirmed: 'Confirmado',
      preparing: 'Preparando',
      ready: 'Listo para recoger',
      in_transit: 'En camino',
      on_the_way: 'En camino',
      delivered: 'Entregado',
      cancelled: 'Cancelado'
    };
    return texts[status] || status;
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/admin-login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando órdenes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center space-x-3">
              <TruckIcon className="h-8 w-8 text-sky-600" />
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Panel de Repartidor</h1>
                <p className="text-sm text-gray-600">Bienvenido, {user?.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              {/* 🔔 Campana de Notificaciones */}
              <NotificationBell />
              
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-700"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
          
          {/* Indicador de última actualización */}
          <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isRefreshing ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
              <span>
                Última actualización: {lastUpdate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
            <span className="text-gray-400">
              ⚡ Actualización automática cada 10 segundos
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-sky-100 rounded-lg p-3">
                <ClockIcon className="h-6 w-6 text-sky-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {orders.filter(o => o.status === 'ready').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                <TruckIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">En Tránsito</p>
                <p className="text-2xl font-bold text-gray-900">
                  {orders.filter(o => o.status === 'on_the_way').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-100 rounded-lg p-3">
                <CheckCircleIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Entregadas Hoy</p>
                <p className="text-2xl font-bold text-gray-900">
                  {orders.filter(o => o.status === 'delivered').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Órdenes Asignadas</h2>
          </div>

          {orders.length === 0 ? (
            <div className="p-12 text-center">
              <TruckIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay órdenes</h3>
              <p className="mt-1 text-sm text-gray-500">
                No tienes órdenes asignadas en este momento
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {orders.map((order) => (
                <div key={order.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Orden #{order.order_number}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <div className="flex items-start space-x-2 text-sm text-gray-600 mb-2">
                            <MapPinIcon className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-medium text-gray-900">{order.customer_name}</p>
                              <p>{order.delivery_address}</p>
                              {order.address_reference && (
                                <p className="text-xs text-gray-500">Ref: {order.address_reference}</p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <PhoneIcon className="h-5 w-5 text-gray-400" />
                            <a href={`tel:${order.customer_phone}`} className="text-sky-600 hover:underline">
                              {order.customer_phone}
                            </a>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Subtotal:</span>
                            <span className="font-medium">${parseFloat(order.subtotal || 0).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Envío:</span>
                            <span className="font-medium">${parseFloat(order.delivery_cost || 0).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-base font-bold border-t pt-2">
                            <span>Total:</span>
                            <span className="text-sky-600">${parseFloat(order.total || 0).toFixed(2)}</span>
                          </div>
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Pago:</span> {order.payment_method === 'cash' ? 'Efectivo' : 'Tarjeta'}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2">
                        {/* Botón para órdenes en pending - confirmar */}
                        {order.status === 'pending' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'confirmed')}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700"
                          >
                            <CheckCircleIcon className="h-4 w-4 mr-2" />
                            Confirmar Orden
                          </button>
                        )}

                        {/* Botón para órdenes confirmadas - marcar como preparando */}
                        {order.status === 'confirmed' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'preparing')}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-violet-600 hover:bg-violet-700"
                          >
                            <TruckIcon className="h-4 w-4 mr-2" />
                            Marcar Preparando
                          </button>
                        )}

                        {/* Botón para órdenes en preparación - marcar como lista */}
                        {order.status === 'preparing' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'ready')}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-cyan-600 hover:bg-cyan-700"
                          >
                            <CheckCircleIcon className="h-4 w-4 mr-2" />
                            Marcar Lista
                          </button>
                        )}

                        {/* Botón para órdenes listas - iniciar entrega */}
                        {order.status === 'ready' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'on_the_way')}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700"
                          >
                            <TruckIcon className="h-4 w-4 mr-2" />
                            Iniciar Entrega
                          </button>
                        )}

                        {/* Botones para órdenes en camino */}
                        {order.status === 'on_the_way' && (
                          <>
                            <button
                              onClick={() => updateLocation(order.id)}
                              disabled={updatingLocation}
                              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                            >
                              <MapPinIcon className="h-4 w-4 mr-2" />
                              {updatingLocation ? 'Actualizando...' : 'Actualizar Ubicación'}
                            </button>

                            <button
                              onClick={() => updateOrderStatus(order.id, 'delivered')}
                              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircleIcon className="h-4 w-4 mr-2" />
                              Marcar como Entregado
                            </button>
                          </>
                        )}

                        {order.delivery_latitude && order.delivery_longitude && (
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${order.delivery_latitude},${order.delivery_longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-4 py-2 border border-sky-300 text-sm font-medium rounded-md text-sky-700 bg-sky-50 hover:bg-sky-100"
                          >
                            <MapPinIcon className="h-4 w-4 mr-2" />
                            Ver en Mapa
                            <ArrowRightIcon className="h-4 w-4 ml-2" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
