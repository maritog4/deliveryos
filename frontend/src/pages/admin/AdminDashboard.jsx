import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';
import NotificationBell from '../../components/NotificationBell';

const API_URL = 'http://localhost/deliverySv/backend/api';

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardStats();
    
    // Auto-refresh cada 30 segundos
    const interval = setInterval(() => {
      refreshStats();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/stats/dashboard.php`);
      
      if (response.data.success) {
        setStats(response.data.data);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshStats = async () => {
    try {
      setRefreshing(true);
      const response = await axios.get(`${API_URL}/stats/dashboard.php`);
      
      if (response.data.success) {
        setStats(response.data.data);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Error refreshing stats:', error);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading || !stats) {
    return (
      <AdminLayout title="Dashboard" subtitle="Cargando estadísticas...">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin text-4xl mb-4">⏳</div>
            <p className="text-slate-600 font-medium">Cargando datos en tiempo real...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-SV', { 
      style: 'currency', 
      currency: 'USD' 
    }).format(value || 0);
  };

  const formatTime = (date) => {
    return new Intl.DateTimeFormat('es-SV', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <AdminLayout
      title="📊 Dashboard Administrador"
      subtitle={`Última actualización: ${formatTime(lastUpdate)}`}
    >
      {/* Header con botón de refresh */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-blue-600">Vista General de Ventas</h2>
          <p className="text-slate-600 mt-1">Estadísticas en tiempo real del sistema</p>
        </div>
        <div className="flex items-center gap-3">
          {/* 🔔 Campana de Notificaciones */}
          <NotificationBell />
          
          <button
            onClick={refreshStats}
            disabled={refreshing}
            className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            <span className={refreshing ? 'animate-spin' : ''}>🔄</span>
            <span>{refreshing ? 'Actualizando...' : 'Actualizar'}</span>
          </button>
        </div>
      </div>

      {/* Stats Cards - Ventas del Día */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-lg shadow-emerald-500/30 p-6 text-white">
          <div className="flex items-center justify-between mb-3">
            <span className="text-3xl">💰</span>
            <span className="text-emerald-100 text-sm font-medium">Hoy</span>
          </div>
          <p className="text-emerald-100 text-sm font-medium mb-1">Ventas del Día</p>
          <p className="text-3xl font-bold">{formatCurrency(stats.today.revenue)}</p>
          <p className="text-emerald-100 text-sm mt-2">{stats.today.orders} órdenes</p>
        </div>

        <div className="bg-gradient-to-br from-sky-500 to-sky-600 rounded-2xl shadow-lg shadow-sky-500/30 p-6 text-white">
          <div className="flex items-center justify-between mb-3">
            <span className="text-3xl">📅</span>
            <span className="text-sky-100 text-sm font-medium">Semana</span>
          </div>
          <p className="text-sky-100 text-sm font-medium mb-1">Ventas Semanal</p>
          <p className="text-3xl font-bold">{formatCurrency(stats.week.revenue)}</p>
          <p className="text-sky-100 text-sm mt-2">{stats.week.orders} órdenes</p>
        </div>

        <div className="bg-gradient-to-br from-violet-500 to-violet-600 rounded-2xl shadow-lg shadow-violet-500/30 p-6 text-white">
          <div className="flex items-center justify-between mb-3">
            <span className="text-3xl">📊</span>
            <span className="text-violet-100 text-sm font-medium">Mes</span>
          </div>
          <p className="text-violet-100 text-sm font-medium mb-1">Ventas Mensual</p>
          <p className="text-3xl font-bold">{formatCurrency(stats.month.revenue)}</p>
          <p className="text-violet-100 text-sm mt-2">{stats.month.orders} órdenes</p>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl shadow-lg shadow-amber-500/30 p-6 text-white">
          <div className="flex items-center justify-between mb-3">
            <span className="text-3xl">📈</span>
            <span className="text-amber-100 text-sm font-medium">Promedio</span>
          </div>
          <p className="text-amber-100 text-sm font-medium mb-1">Ticket Promedio</p>
          <p className="text-3xl font-bold">{formatCurrency(stats.today.avg_order_value)}</p>
          <p className="text-amber-100 text-sm mt-2">Por orden hoy</p>
        </div>
      </div>

      {/* Stats Cards - Sistema */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-3xl">🍕</span>
            <span className="text-slate-400">📦</span>
          </div>
          <p className="text-slate-600 text-sm font-medium mb-1">Productos</p>
          <p className="text-3xl font-bold text-blue-600">{stats.counts.products}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-3xl">📁</span>
            <span className="text-slate-400">🏷️</span>
          </div>
          <p className="text-slate-600 text-sm font-medium mb-1">Categorías</p>
          <p className="text-3xl font-bold text-blue-600">{stats.counts.categories}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-3xl">👥</span>
            <span className="text-slate-400">🛒</span>
          </div>
          <p className="text-slate-600 text-sm font-medium mb-1">Clientes</p>
          <p className="text-3xl font-bold text-blue-600">{stats.counts.customers}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-3xl">🚚</span>
            <span className="text-slate-400">📍</span>
          </div>
          <p className="text-slate-600 text-sm font-medium mb-1">Repartidores</p>
          <p className="text-3xl font-bold text-blue-600">{stats.counts.drivers}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Top Productos */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-sky-50 to-cyan-50">
            <h3 className="text-xl font-bold text-blue-600 flex items-center gap-2">
              <span>🏆</span>
              <span>Productos Más Vendidos</span>
            </h3>
            <p className="text-slate-600 text-sm mt-1">Top 5 del día de hoy</p>
          </div>
          <div className="p-6">
            {stats.top_products && stats.top_products.length > 0 ? (
              <div className="space-y-4">
                {stats.top_products.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors border border-slate-200">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-10 h-10 bg-white border-2 border-sky-400 text-sky-600 rounded-lg font-bold shadow-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-blue-600">{product.product_name}</p>
                        <p className="text-sm text-slate-600">{product.total_quantity} vendidos</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-600">{formatCurrency(product.revenue)}</p>
                      <p className="text-xs text-slate-500">{product.times_ordered} órdenes</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                <span className="text-4xl block mb-2">📊</span>
                <p>No hay ventas hoy</p>
              </div>
            )}
          </div>
        </div>

        {/* Performance de Repartidores */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-emerald-50 to-green-50">
            <h3 className="text-xl font-bold text-blue-600 flex items-center gap-2">
              <span>�</span>
              <span>Performance de Repartidores</span>
            </h3>
            <p className="text-slate-600 text-sm mt-1">Entregas realizadas hoy</p>
          </div>
          <div className="p-6">
            {stats.drivers_performance && stats.drivers_performance.length > 0 ? (
              <div className="space-y-4">
                {stats.drivers_performance.map((driver) => (
                  <div key={driver.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors border border-slate-200">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-10 h-10 bg-white border-2 border-emerald-400 text-emerald-600 rounded-full font-bold shadow-sm">
                        {driver.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-blue-600">{driver.name}</p>
                        <p className="text-sm text-slate-600">{driver.deliveries_today} entregas</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-600">{formatCurrency(driver.total_delivered)}</p>
                      <p className="text-xs text-slate-500">Total entregado</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                <span className="text-4xl block mb-2">🚚</span>
                <p>Sin entregas hoy</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Órdenes Recientes */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-violet-50 to-purple-50">
          <h3 className="text-xl font-bold text-blue-600 flex items-center gap-2">
            <span>📋</span>
            <span>Órdenes Recientes</span>
          </h3>
          <p className="text-slate-600 text-sm mt-1">Últimas 10 órdenes del sistema</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Orden #</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Total</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Repartidor</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Pago</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {stats.recent_orders && stats.recent_orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-mono text-sm font-semibold text-sky-600">{order.order_number}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-blue-600">{order.customer_name}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-bold text-emerald-600">{formatCurrency(order.total)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${
                      order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                        order.status === 'on_the_way' ? 'bg-sky-100 text-sky-700 border border-sky-200' :
                      order.status === 'ready' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                      'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}>
                      {order.status === 'delivered' ? '✅ Entregado' :
                         order.status === 'on_the_way' ? '🚚 En camino' :
                       order.status === 'ready' ? '📦 Listo' :
                       '⏳ Pendiente'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-slate-600">{order.driver_name || '—'}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs font-medium rounded ${
                      order.payment_method === 'cash' ? 'bg-green-50 text-green-700' :
                      order.payment_method === 'card' ? 'bg-blue-50 text-blue-700' :
                      'bg-purple-50 text-purple-700'
                    }`}>
                      {order.payment_method === 'cash' ? '💵 Efectivo' :
                       order.payment_method === 'card' ? '💳 Tarjeta' :
                       '🏦 Transferencia'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminDashboard;

