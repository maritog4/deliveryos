import { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';

const API_URL = 'http://localhost/deliverySv/backend/api';

function DriversPage() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [driverStats, setDriverStats] = useState(null);
  const [editingDriver, setEditingDriver] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    vehicle_type: '',
    license_plate: '',
    status: 'active'
  });

  useEffect(() => {
    loadDrivers();
  }, []);

  const loadDrivers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/auth/users.php?role=driver`);
      
      if (response.data.success) {
        setDrivers(response.data.data || []);
      }
    } catch (error) {
      console.error('Error loading drivers:', error);
      alert('Error al cargar repartidores');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const endpoint = editingDriver 
        ? `${API_URL}/drivers/update.php`
        : `${API_URL}/drivers/create.php`;
      
      const dataToSend = editingDriver 
        ? { ...formData, id: editingDriver.id }
        : formData;

      const response = await axios.post(endpoint, dataToSend);
      
      if (response.data.success) {
        alert(editingDriver ? 'Repartidor actualizado exitosamente' : 'Repartidor creado exitosamente');
        setShowModal(false);
        resetForm();
        loadDrivers();
      } else {
        alert(response.data.message || 'Error al guardar repartidor');
      }
    } catch (error) {
      console.error('Error saving driver:', error);
      alert('Error al guardar repartidor');
    }
  };

  const handleEdit = (driver) => {
    setEditingDriver(driver);
    setFormData({
      name: driver.name || '',
      email: driver.email || '',
      phone: driver.phone || '',
      password: '',
      vehicle_type: driver.vehicle_type || '',
      license_plate: driver.license_plate || '',
      status: driver.status || 'active'
    });
    setShowModal(true);
  };

  const handleToggleStatus = async (driver) => {
    if (!confirm(`¿Estás seguro de ${driver.status === 'active' ? 'desactivar' : 'activar'} este repartidor?`)) {
      return;
    }

    try {
      const newStatus = driver.status === 'active' ? 'inactive' : 'active';
      const response = await axios.post(`${API_URL}/drivers/update.php`, {
        id: driver.id,
        status: newStatus
      });
      
      if (response.data.success) {
        alert('Estado actualizado exitosamente');
        loadDrivers();
      } else {
        alert(response.data.message || 'Error al actualizar estado');
      }
    } catch (error) {
      console.error('Error toggling driver status:', error);
      alert('Error al actualizar estado');
    }
  };

  const handleDelete = async (driver) => {
    if (!confirm(`¿Estás seguro de eliminar al repartidor ${driver.name}? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/drivers/delete.php`, {
        id: driver.id
      });
      
      if (response.data.success) {
        alert('Repartidor eliminado exitosamente');
        loadDrivers();
      } else {
        alert(response.data.message || 'Error al eliminar repartidor');
      }
    } catch (error) {
      console.error('Error deleting driver:', error);
      alert('Error al eliminar repartidor');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      vehicle_type: '',
      license_plate: '',
      status: 'active'
    });
    setEditingDriver(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleViewStats = async (driver) => {
    setSelectedDriver(driver);
    setShowStatsModal(true);
    setDriverStats(null); // Reset stats while loading
    
    try {
      // Obtener estadísticas del repartidor usando el nuevo endpoint
      const response = await axios.get(`${API_URL}/drivers/stats.php?driver_id=${driver.id}`);
      
      if (response.data.success) {
        setDriverStats(response.data.data);
      } else {
        alert(response.data.message || 'Error al cargar estadísticas');
        setShowStatsModal(false);
      }
    } catch (error) {
      console.error('Error loading driver stats:', error);
      alert('Error al cargar estadísticas del repartidor');
      setShowStatsModal(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-xl text-gray-600">Cargando repartidores...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Gestión de Repartidores</h1>
          <p className="text-gray-600 mt-2">Administra los repartidores del sistema</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-sky-600 hover:bg-sky-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-colors"
        >
          + Nuevo Repartidor
        </button>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
          <div className="text-emerald-100 text-sm font-semibold mb-2">ACTIVOS</div>
          <div className="text-4xl font-bold">
            {drivers.filter(d => d.status === 'active').length}
          </div>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg p-6 text-white">
          <div className="text-amber-100 text-sm font-semibold mb-2">INACTIVOS</div>
          <div className="text-4xl font-bold">
            {drivers.filter(d => d.status === 'inactive').length}
          </div>
        </div>
        <div className="bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl shadow-lg p-6 text-white">
          <div className="text-violet-100 text-sm font-semibold mb-2">TOTAL</div>
          <div className="text-4xl font-bold">
            {drivers.length}
          </div>
        </div>
      </div>

      {/* Tabla de repartidores */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Repartidor
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Contacto
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Vehículo
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {drivers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    No hay repartidores registrados
                  </td>
                </tr>
              ) : (
                drivers.map((driver) => (
                  <tr key={driver.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12 bg-gradient-to-br from-sky-400 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {driver.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-gray-900">{driver.name}</div>
                          <div className="text-sm text-gray-500">ID: {driver.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{driver.email}</div>
                      <div className="text-sm text-gray-500">{driver.phone || 'Sin teléfono'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{driver.vehicle_type || 'No especificado'}</div>
                      <div className="text-sm text-gray-500">{driver.license_plate || 'Sin placa'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        driver.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {driver.status === 'active' ? '● Activo' : '○ Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewStats(driver)}
                          className="text-violet-600 hover:text-violet-800 font-semibold bg-transparent border-0 p-0 cursor-pointer transition-colors"
                        >
                          Estadísticas
                        </button>
                        <button
                          onClick={() => handleEdit(driver)}
                          className="text-sky-600 hover:text-sky-800 font-semibold bg-transparent border-0 p-0 cursor-pointer transition-colors"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleToggleStatus(driver)}
                          className={`font-semibold bg-transparent border-0 p-0 cursor-pointer transition-colors ${
                            driver.status === 'active'
                              ? 'text-amber-600 hover:text-amber-800'
                              : 'text-emerald-600 hover:text-emerald-800'
                          }`}
                        >
                          {driver.status === 'active' ? 'Desactivar' : 'Activar'}
                        </button>
                        <button
                          onClick={() => handleDelete(driver)}
                          className="text-red-600 hover:text-red-800 font-semibold bg-transparent border-0 p-0 cursor-pointer transition-colors"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para crear/editar repartidor */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-sky-500 to-cyan-500 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">
                {editingDriver ? 'Editar Repartidor' : 'Nuevo Repartidor'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-white hover:text-gray-200 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="Ej: Juan Pérez"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="correo@ejemplo.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Teléfono
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="7777-7777"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Contraseña {editingDriver ? '(dejar vacío para no cambiar)' : '*'}
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required={!editingDriver}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tipo de Vehículo
                  </label>
                  <select
                    name="vehicle_type"
                    value={formData.vehicle_type}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="moto">Moto</option>
                    <option value="auto">Auto</option>
                    <option value="bicicleta">Bicicleta</option>
                    <option value="pickup">Pickup</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Placa del Vehículo
                  </label>
                  <input
                    type="text"
                    name="license_plate"
                    value={formData.license_plate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="P123456"
                  />
                </div>

                {editingDriver && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Estado
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    >
                      <option value="active">Activo</option>
                      <option value="inactive">Inactivo</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-semibold shadow-lg transition-colors"
                >
                  {editingDriver ? 'Actualizar' : 'Crear'} Repartidor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Estadísticas del Repartidor */}
      {showStatsModal && selectedDriver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-violet-500 to-purple-500 px-6 py-4 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Estadísticas de {selectedDriver.name}
                </h2>
                <p className="text-violet-100 text-sm mt-1">
                  {selectedDriver.vehicle_type} - {selectedDriver.license_plate}
                </p>
              </div>
              <button
                onClick={() => setShowStatsModal(false)}
                className="text-white hover:text-gray-200 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            {driverStats ? (
              <div className="p-6 space-y-6">
                {/* Estadísticas de hoy y semana */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-cyan-500 to-sky-600 rounded-lg p-4 text-white">
                    <h4 className="text-sm font-semibold mb-3 text-cyan-100">📅 HOY</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-cyan-100">Órdenes:</span>
                        <span className="font-bold">{driverStats.today?.orders || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-cyan-100">Completadas:</span>
                        <span className="font-bold">{driverStats.today?.completed || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-cyan-100">Ingresos:</span>
                        <span className="font-bold">${(driverStats.today?.revenue || 0).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg p-4 text-white">
                    <h4 className="text-sm font-semibold mb-3 text-emerald-100">📊 ESTA SEMANA</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-emerald-100">Órdenes:</span>
                        <span className="font-bold">{driverStats.week?.orders || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-emerald-100">Completadas:</span>
                        <span className="font-bold">{driverStats.week?.completed || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-emerald-100">Ingresos:</span>
                        <span className="font-bold">${(driverStats.week?.revenue || 0).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Estadísticas generales */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-violet-500 to-violet-600 rounded-lg p-4 text-white">
                    <div className="text-violet-100 text-xs font-semibold mb-1">ENTREGAS TOTALES</div>
                    <div className="text-3xl font-bold">{driverStats.stats?.total_orders || 0}</div>
                  </div>
                  <div className="bg-gradient-to-br from-sky-500 to-sky-600 rounded-lg p-4 text-white">
                    <div className="text-sky-100 text-xs font-semibold mb-1">COMPLETADAS</div>
                    <div className="text-3xl font-bold">{driverStats.stats?.completed_orders || 0}</div>
                  </div>
                  <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg p-4 text-white">
                    <div className="text-amber-100 text-xs font-semibold mb-1">EN PROGRESO</div>
                    <div className="text-3xl font-bold">{driverStats.stats?.in_transit_orders || 0}</div>
                  </div>
                  <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-lg p-4 text-white">
                    <div className="text-rose-100 text-xs font-semibold mb-1">INGRESOS TOTALES</div>
                    <div className="text-2xl font-bold">${(driverStats.stats?.total_revenue || 0).toFixed(2)}</div>
                  </div>
                </div>

                {/* Órdenes recientes */}
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Órdenes Recientes</h3>
                  <div className="bg-gray-50 rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                            Orden
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                            Cliente
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                            Dirección
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                            Total
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                            Estado
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                            Fecha
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {(!driverStats.recent_orders || driverStats.recent_orders.length === 0) ? (
                          <tr>
                            <td colSpan="6" className="px-4 py-6 text-center text-gray-500">
                              No hay órdenes asignadas
                            </td>
                          </tr>
                        ) : (
                          driverStats.recent_orders.map((order) => (
                            <tr key={order.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                                #{order.order_number}
                              </td>
                              <td className="px-4 py-3 text-sm">
                                <div className="text-gray-900">{order.customer_name}</div>
                                <div className="text-gray-500 text-xs">{order.customer_phone}</div>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                                {order.delivery_address}
                                {order.zone_name && (
                                  <div className="text-xs text-gray-400">{order.zone_name}</div>
                                )}
                              </td>
                              <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                                ${parseFloat(order.total || 0).toFixed(2)}
                              </td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                  order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                  order.status === 'on_the_way' ? 'bg-blue-100 text-blue-800' :
                                  order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {order.status === 'delivered' ? 'Entregada' :
                                   order.status === 'on_the_way' ? 'En camino' :
                                   order.status === 'ready' ? 'Lista' :
                                   order.status === 'preparing' ? 'Preparando' :
                                   order.status === 'cancelled' ? 'Cancelada' :
                                   order.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-500">
                                {new Date(order.created_at).toLocaleDateString('es-ES', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric'
                                })}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Información adicional */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-700 mb-2">Información de Contacto</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-500">Email:</span>
                        <span className="ml-2 text-gray-900">{selectedDriver.email}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Teléfono:</span>
                        <span className="ml-2 text-gray-900">{selectedDriver.phone || 'No registrado'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Vehículo:</span>
                        <span className="ml-2 text-gray-900">
                          {selectedDriver.vehicle_type || 'No especificado'} - {selectedDriver.license_plate || 'Sin placa'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Estado:</span>
                        <span className={`ml-2 font-semibold ${
                          selectedDriver.status === 'active' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {selectedDriver.status === 'active' ? '● Activo' : '○ Inactivo'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-700 mb-2">Métricas de Performance</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-500">Tasa de completación:</span>
                        <span className="ml-2 text-gray-900 font-semibold">
                          {driverStats.stats?.completion_rate?.toFixed(1) || 0}%
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Promedio por entrega:</span>
                        <span className="ml-2 text-gray-900 font-semibold">
                          ${(driverStats.stats?.avg_order_value || 0).toFixed(2)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Órdenes canceladas:</span>
                        <span className="ml-2 text-gray-900 font-semibold">
                          {driverStats.stats?.cancelled_orders || 0}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Miembro desde:</span>
                        <span className="ml-2 text-gray-900 font-semibold">
                          {new Date(driverStats.driver?.created_at).toLocaleDateString('es-ES', {
                            month: 'long',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">
                Cargando estadísticas...
              </div>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default DriversPage;
