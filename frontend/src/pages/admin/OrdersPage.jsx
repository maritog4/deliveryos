import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { orderService } from '../../services/orderService';
import { authService } from '../../services/authService';
import EmptyState from '../../components/EmptyState';

function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', limit: 50, date_filter: 'today' });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadData();
    
    // Auto-actualizar cada 30 segundos
    const interval = setInterval(() => {
      loadData();
    }, 30000);

    // Limpiar intervalo al desmontar
    return () => clearInterval(interval);
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ordersRes, driversRes] = await Promise.all([
        orderService.getAll(filters),
        authService.getUsers('driver')
      ]);

      if (ordersRes.success) setOrders(ordersRes.data);
      if (driversRes.success) setDrivers(driversRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const response = await orderService.updateStatus(orderId, newStatus);
      if (response.success) {
        // Actualizar solo la orden específica en lugar de recargar todo
        setOrders(orders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        ));
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleAssignDriver = async (orderId, driverId) => {
    try {
      const response = await orderService.assignDriver(orderId, driverId);
      if (response.success) {
        // Actualizar solo la orden específica
        const driver = drivers.find(d => d.id === parseInt(driverId));
        setOrders(orders.map(order => 
          order.id === orderId ? { ...order, driver_id: driverId, driver_name: driver?.name || '' } : order
        ));
      }
    } catch (error) {
      console.error('Error assigning driver:', error);
    }
  };

  const openOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: '⏳', label: 'Pendiente' },
      confirmed: { bg: 'bg-blue-100', text: 'text-blue-800', icon: '✅', label: 'Confirmada' },
      preparing: { bg: 'bg-cyan-100', text: 'text-cyan-800', icon: '👨‍🍳', label: 'Preparando' },
      ready: { bg: 'bg-green-100', text: 'text-green-800', icon: '✨', label: 'Lista' },
      assigned: { bg: 'bg-sky-100', text: 'text-sky-800', icon: '🚗', label: 'Asignada' },
      picked_up: { bg: 'bg-cyan-100', text: 'text-cyan-800', icon: '📦', label: 'Recogida' },
  on_the_way: { bg: 'bg-blue-100', text: 'text-blue-800', icon: '🚚', label: 'En camino' },
      delivered: { bg: 'bg-green-100', text: 'text-green-800', icon: '✅', label: 'Entregada' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', icon: '❌', label: 'Cancelada' }
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
    <AdminLayout
      title="Gestión de Órdenes"
      subtitle="Administra pedidos, estados y asignación de conductores"
    >
      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Estado</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-4 py-2 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            >
              <option value="">Todos</option>
              <option value="pending">Pendiente</option>
              <option value="confirmed">Confirmada</option>
              <option value="preparing">Preparando</option>
              <option value="ready">Lista</option>
              <option value="assigned">Asignada</option>
              <option value="picked_up">Recogida</option>
              <option value="on_the_way">En camino</option>
              <option value="delivered">Entregada</option>
              <option value="cancelled">Cancelada</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Límite</label>
            <select
              value={filters.limit}
              onChange={(e) => setFilters({ ...filters, limit: e.target.value })}
              className="px-4 py-2 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            >
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
          <div className="mt-7 px-4 py-2 text-sm text-slate-500 italic">
            🔄 Actualización automática cada 30s
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <div className="animate-spin text-4xl mb-4">⏳</div>
            <p>Cargando órdenes...</p>
          </div>
        ) : orders.length === 0 ? (
          <EmptyState
            icon="📦"
            title="No hay órdenes"
            description="Aún no se han registrado pedidos en el sistema"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase">Orden</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase">Cliente</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase">Zona</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase">Total</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase">Estado</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase">Conductor</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <button
                        onClick={() => openOrderDetails(order)}
                        className="text-sky-600 hover:text-emerald-500 font-bold bg-transparent border-0 p-0 cursor-pointer transition-colors"
                      >
                        #{order.order_number}
                      </button>
                      <div className="text-xs text-slate-500">
                        {new Date(order.created_at).toLocaleString('es-SV')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">{order.customer_name}</div>
                      <div className="text-xs text-slate-500">{order.customer_phone}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{order.zone_name || '-'}</td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-sky-600">${parseFloat(order.total).toFixed(2)}</div>
                      <div className="text-xs text-slate-500">
                        {order.payment_method === 'cash' ? '💵 Efectivo' : '💳 Tarjeta'}
                      </div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(order.status)}</td>
                    <td className="px-6 py-4">
                      {order.driver_id ? (
                        <div className="text-sm text-slate-700">{order.driver_name || 'Sin nombre'}</div>
                      ) : (
                        <select
                          onChange={(e) => e.target.value && handleAssignDriver(order.id, e.target.value)}
                          className="text-sm px-2 py-1 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                        >
                          <option value="">Asignar...</option>
                          {drivers.map(driver => (
                            <option key={driver.id} value={driver.id}>{driver.name}</option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        disabled={order.status === 'delivered' || order.status === 'cancelled'}
                        className={`text-sm px-2 py-1 border rounded-lg focus:ring-2 focus:ring-sky-500 ${
                          order.status === 'delivered' || order.status === 'cancelled'
                            ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200'
                            : 'border-slate-300 cursor-pointer'
                        }`}
                      >
                        <option value="pending">Pendiente</option>
                        <option value="confirmed">Confirmada</option>
                        <option value="preparing">Preparando</option>
                        <option value="ready">Lista</option>
                        <option value="assigned">Asignada</option>
                        <option value="picked_up">Recogida</option>
                        <option value="on_the_way">En camino</option>
                        <option value="delivered">Entregada</option>
                        <option value="cancelled">Cancelada</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-gradient-to-br from-sky-500 to-cyan-600 text-white p-6 rounded-t-3xl">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold">Orden #{selectedOrder.order_number}</h2>
                  <p className="text-sky-100 text-sm">{new Date(selectedOrder.created_at).toLocaleString('es-SV')}</p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-white rounded-full p-2"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center">
                  <span className="mr-2">👤</span> Información del Cliente
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
                  <div className="flex justify-between">
                    <span className="text-slate-600">Email:</span>
                    <span className="font-semibold">{selectedOrder.customer_email}</span>
                  </div>
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
                    <span className="font-semibold">{selectedOrder.zone_name}</span>
                  </div>
                  <div>
                    <span className="text-slate-600 block mb-1">Dirección:</span>
                    <p className="font-semibold">{selectedOrder.delivery_address}</p>
                  </div>
                  {selectedOrder.notes && (
                    <div>
                      <span className="text-slate-600 block mb-1">Notas:</span>
                      <p className="text-sm text-slate-700">{selectedOrder.notes}</p>
                    </div>
                  )}
                </div>
              </div>

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
                        <div className="text-xs text-slate-500">${parseFloat(item.price).toFixed(2)} c/u</div>
                      </div>
                      <span className="font-bold text-sky-600">
                        ${(parseFloat(item.price) * item.quantity).toFixed(2)}
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
                    <span className="font-semibold">${parseFloat(selectedOrder.subtotal).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Envío:</span>
                    <span className="font-semibold">${parseFloat(selectedOrder.delivery_fee).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-sky-600 pt-2 border-t border-sky-200">
                    <span>Total:</span>
                    <span>${parseFloat(selectedOrder.total).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t border-sky-200">
                    <span className="text-slate-600">Método de pago:</span>
                    <span className="font-semibold">
                      {selectedOrder.payment_method === 'cash' ? '💵 Efectivo' : '💳 Tarjeta'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default OrdersPage;
