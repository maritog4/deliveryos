import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../services/orderService';
import { authService } from '../services/authService';
import OrderTrackingMap from '../components/OrderTrackingMap';
import { useCart } from '../context/CartContext';

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const { addToCart, clearCart } = useCart();

  useEffect(() => {
    if (!user) {
      navigate('/menu');
      return;
    }
    loadOrders();
    
    // Auto-refresh cada 30 segundos para órdenes activas
    const interval = setInterval(loadOrders, 30000);
    return () => clearInterval(interval);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getAll({ customer_id: user.id });
      if (response.success) {
        setOrders(response.data);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const openOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const handleRepeatOrder = (order) => {
    try {
      // Limpiar carrito actual
      clearCart();
      
      // Parsear items de la orden
      const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
      
      // Agregar cada producto al carrito
      items.forEach(item => {
        const product = {
          id: item.id || item.product_id,
          name: item.name,
          price: parseFloat(item.price),
          image: item.image || '/placeholder-product.jpg',
          description: item.description || ''
        };
        
        for (let i = 0; i < item.quantity; i++) {
          addToCart(product);
        }
      });
      
      // Redirigir al menú
      navigate('/menu');
      
      // Mostrar notificación de éxito
      alert(`✅ ${items.length} productos agregados al carrito. ¡Puedes modificar tu pedido antes de ordenar!`);
    } catch (error) {
      console.error('Error repitiendo orden:', error);
      alert('❌ Error al repetir la orden. Por favor, intenta nuevamente.');
    }
  };

  // Filtrar órdenes
  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(order => {
        if (filterStatus === 'active') {
          return ['pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'on_the_way'].includes(order.status);
        } else if (filterStatus === 'completed') {
          return order.status === 'delivered';
        } else if (filterStatus === 'cancelled') {
          return order.status === 'cancelled';
        }
        return true;
      });

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: '⏳', label: 'Pendiente' },
      confirmed: { bg: 'bg-blue-100', text: 'text-blue-800', icon: '✅', label: 'Confirmado' },
      preparing: { bg: 'bg-cyan-100', text: 'text-cyan-800', icon: '👨‍🍳', label: 'Preparando' },
      ready: { bg: 'bg-green-100', text: 'text-green-800', icon: '✨', label: 'Listo' },
      assigned: { bg: 'bg-sky-100', text: 'text-sky-800', icon: '🚗', label: 'Asignado' },
      picked_up: { bg: 'bg-cyan-100', text: 'text-cyan-800', icon: '📦', label: 'Recogido' },
  on_the_way: { bg: 'bg-blue-100', text: 'text-blue-800', icon: '🚚', label: 'En camino' },
      delivered: { bg: 'bg-green-100', text: 'text-green-800', icon: '✅', label: 'Entregado' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', icon: '❌', label: 'Cancelado' }
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
        <span>{config.icon}</span>
        {config.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-sky-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-sky-500 to-cyan-600 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/menu')}
                className="p-2 hover:bg-white/20 rounded-xl transition-all"
              >
                ← Volver
              </button>
              <div>
                <h1 className="text-3xl font-bold">Mis Pedidos</h1>
                <p className="text-sky-100">Historial completo de tus órdenes</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sky-100 text-sm">Bienvenido</p>
              <p className="font-semibold">{user?.name}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-2 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`flex-1 min-w-[120px] px-4 py-3 rounded-xl font-semibold transition-all ${
                filterStatus === 'all'
                  ? 'bg-gradient-to-br from-sky-500 to-cyan-600 text-white shadow-lg'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              📦 Todas ({orders.length})
            </button>
            <button
              onClick={() => setFilterStatus('active')}
              className={`flex-1 min-w-[120px] px-4 py-3 rounded-xl font-semibold transition-all ${
                filterStatus === 'active'
                  ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              🚀 Activas ({orders.filter(o => ['pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'on_the_way'].includes(o.status)).length})
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={`flex-1 min-w-[120px] px-4 py-3 rounded-xl font-semibold transition-all ${
                filterStatus === 'completed'
                  ? 'bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              ✅ Completadas ({orders.filter(o => o.status === 'delivered').length})
            </button>
            <button
              onClick={() => setFilterStatus('cancelled')}
              className={`flex-1 min-w-[120px] px-4 py-3 rounded-xl font-semibold transition-all ${
                filterStatus === 'cancelled'
                  ? 'bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-lg'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              ❌ Canceladas ({orders.filter(o => o.status === 'cancelled').length})
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
            <div className="animate-spin text-4xl mb-4">⏳</div>
            <p className="text-slate-600">Cargando pedidos...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
            <div className="text-6xl mb-4">
              {filterStatus === 'all' ? '📦' : filterStatus === 'active' ? '🚀' : filterStatus === 'completed' ? '✅' : '❌'}
            </div>
            <p className="text-lg font-semibold text-slate-800 mb-2">
              {filterStatus === 'all' && 'No tienes pedidos aún'}
              {filterStatus === 'active' && 'No tienes pedidos activos'}
              {filterStatus === 'completed' && 'No tienes pedidos completados'}
              {filterStatus === 'cancelled' && 'No tienes pedidos cancelados'}
            </p>
            {filterStatus === 'all' && (
              <>
                <p className="text-slate-600 mb-6">¡Haz tu primer pedido y aparecerá aquí!</p>
                <button
                  onClick={() => navigate('/menu')}
                  className="bg-gradient-to-br from-sky-500 to-sky-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-sky-600 hover:to-sky-700 transition-all shadow-lg shadow-sky-500/30"
                >
                  🍕 Ver Menú
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-all"
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-slate-800">
                          Orden #{order.order_number}
                        </h3>
                        {getStatusBadge(order.status)}
                      </div>
                      <p className="text-sm text-slate-500">
                        {new Date(order.created_at).toLocaleString('es-SV', {
                          dateStyle: 'long',
                          timeStyle: 'short'
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-600 mb-1">Total</p>
                      <p className="text-3xl font-bold text-sky-600">
                        ${(parseFloat(order.total) || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-slate-50 rounded-xl p-4">
                      <p className="text-xs text-slate-600 mb-1">📍 Dirección</p>
                      <p className="text-sm font-semibold text-slate-800">
                        {order.delivery_address}
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-4">
                      <p className="text-xs text-slate-600 mb-1">💳 Pago</p>
                      <p className="text-sm font-semibold text-slate-800">
                        {order.payment_method === 'cash' ? '💵 Efectivo' : '💳 Tarjeta'}
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-4">
                      <p className="text-xs text-slate-600 mb-1">🚚 Entrega</p>
                      <p className="text-sm font-semibold text-slate-800">
                        {order.zone_name || 'No especificada'}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => openOrderDetails(order)}
                      className="flex-1 bg-gradient-to-br from-sky-500 to-sky-600 text-white px-4 py-2 rounded-xl font-semibold hover:from-sky-600 hover:to-sky-700 transition-all shadow-lg shadow-sky-500/20"
                    >
                      👁️ Ver Detalles
                    </button>
                    {order.status === 'delivered' && (
                      <button
                        onClick={() => handleRepeatOrder(order)}
                        className="px-6 py-2 bg-gradient-to-br from-emerald-500 to-green-600 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg"
                      >
                        🔄 Repetir
                      </button>
                    )}
                    {['on_the_way', 'picked_up'].includes(order.status) && (
                      <button
                        onClick={() => openOrderDetails(order)}
                        className="px-4 py-2 bg-gradient-to-br from-violet-500 to-purple-600 text-white rounded-xl font-semibold hover:from-violet-600 hover:to-purple-700 transition-all shadow-lg animate-pulse"
                      >
                        🗺️ Rastrear
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showModal && selectedOrder && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-br from-sky-500 to-cyan-600 text-white p-6 rounded-t-3xl">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold">Orden #{selectedOrder.order_number}</h2>
                  <p className="text-sky-100 text-sm">
                    {new Date(selectedOrder.created_at).toLocaleString('es-SV')}
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Status */}
              <div className="text-center">
                {getStatusBadge(selectedOrder.status)}
              </div>

              {/* Customer Info */}
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center">
                  <span className="mr-2">👤</span> Información de Contacto
                </h3>
                <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Nombre:</span>
                    <span className="font-semibold">{selectedOrder.customer_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Teléfono:</span>
                    <span className="font-semibold">{selectedOrder.customer_phone}</span>
                  </div>
                  {selectedOrder.customer_email && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Email:</span>
                      <span className="font-semibold">{selectedOrder.customer_email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Delivery Info */}
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center">
                  <span className="mr-2">📍</span> Información de Entrega
                </h3>
                <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Zona:</span>
                    <span className="font-semibold">{selectedOrder.zone_name || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-600 block mb-1">Dirección:</span>
                    <p className="font-semibold">{selectedOrder.delivery_address}</p>
                  </div>
                  {selectedOrder.address_reference && (
                    <div>
                      <span className="text-slate-600 block mb-1">Referencia:</span>
                      <p className="text-sm text-slate-700">{selectedOrder.address_reference}</p>
                    </div>
                  )}
                  {selectedOrder.notes && (
                    <div>
                      <span className="text-slate-600 block mb-1">Notas:</span>
                      <p className="text-sm text-slate-700">{selectedOrder.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Tracking Map - Solo mostrar si la orden está en tránsito */}
              {(['on_the_way', 'picked_up', 'ready'].includes(selectedOrder.status)) && (
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center">
                    <span className="mr-2">🗺️</span> Rastreo en Tiempo Real
                  </h3>
                  <OrderTrackingMap order={selectedOrder} />
                </div>
              )}

              {/* Order Items */}
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center">
                  <span className="mr-2">🛒</span> Productos
                </h3>
                <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                  {selectedOrder.items && JSON.parse(selectedOrder.items).map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div>
                        <span className="font-semibold">{item.quantity}x {item.name}</span>
                        <div className="text-xs text-slate-500">${(parseFloat(item.price) || 0).toFixed(2)} c/u</div>
                      </div>
                      <span className="font-bold text-sky-600">
                        ${((parseFloat(item.price) || 0) * (parseInt(item.quantity) || 0)).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="bg-gradient-to-br from-sky-50 to-cyan-50 rounded-xl p-4 border-2 border-sky-200">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Subtotal:</span>
                    <span className="font-semibold">${(parseFloat(selectedOrder.subtotal) || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Costo de envío:</span>
                    <span className="font-semibold">${(parseFloat(selectedOrder.delivery_cost) || 0).toFixed(2)}</span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Descuento:</span>
                      <span className="font-semibold">-${(parseFloat(selectedOrder.discount) || 0).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t-2 border-sky-300 pt-2 flex justify-between">
                    <span className="text-lg font-bold text-slate-800">Total:</span>
                    <span className="text-2xl font-bold text-sky-600">
                      ${(parseFloat(selectedOrder.total) || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="text-center text-sm text-slate-600">
                Método de pago: {selectedOrder.payment_method === 'cash' ? '💵 Efectivo' : '💳 Tarjeta'}
              </div>

              {/* Action Buttons */}
              {selectedOrder.status === 'delivered' && (
                <div className="flex gap-3 pt-4 border-t-2 border-slate-200">
                  <button
                    onClick={() => {
                      handleRepeatOrder(selectedOrder);
                      setShowModal(false);
                    }}
                    className="flex-1 bg-gradient-to-br from-emerald-500 to-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg"
                  >
                    🔄 Repetir este Pedido
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all"
                  >
                    Cerrar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyOrders;
