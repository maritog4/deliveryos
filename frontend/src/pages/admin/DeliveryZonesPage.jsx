import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import axios from 'axios';

const API_URL = 'http://localhost/deliverySv/backend/api';

function DeliveryZonesPage() {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingZone, setEditingZone] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    delivery_cost: '',
    min_order_amount: '',
    estimated_time: '',
    is_active: true
  });

  useEffect(() => {
    loadZones();
  }, []);

  const loadZones = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/delivery-zones/read.php`);
      if (response.data.success) {
        setZones(response.data.data || []);
      }
    } catch (error) {
      console.error('Error loading zones:', error);
      alert('Error al cargar las zonas de entrega');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };

      let response;
      if (editingZone) {
        response = await axios.put(
          `${API_URL}/delivery-zones/update.php`,
          { ...formData, id: editingZone.id },
          config
        );
      } else {
        response = await axios.post(
          `${API_URL}/delivery-zones/create.php`,
          formData,
          config
        );
      }

      if (response.data.success) {
        alert(editingZone ? 'Zona actualizada exitosamente' : 'Zona creada exitosamente');
        setShowModal(false);
        resetForm();
        loadZones();
      } else {
        alert(response.data.message || 'Error al guardar la zona');
      }
    } catch (error) {
      console.error('Error saving zone:', error);
      alert('Error al guardar la zona de entrega');
    }
  };

  const handleEdit = (zone) => {
    setEditingZone(zone);
    setFormData({
      name: zone.name,
      description: zone.description || '',
      delivery_cost: zone.delivery_cost,
      min_order_amount: zone.min_order_amount,
      estimated_time: zone.estimated_time,
      is_active: zone.is_active === 1 || zone.is_active === true
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta zona de entrega?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `${API_URL}/delivery-zones/delete.php`,
        {
          headers: { 'Authorization': `Bearer ${token}` },
          data: { id }
        }
      );

      if (response.data.success) {
        alert('Zona eliminada exitosamente');
        loadZones();
      } else {
        alert(response.data.message || 'Error al eliminar');
      }
    } catch (error) {
      console.error('Error deleting zone:', error);
      alert('Error al eliminar la zona');
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_URL}/delivery-zones/toggle.php`,
        { id, is_active: !currentStatus },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (response.data.success) {
        loadZones();
      } else {
        alert(response.data.message || 'Error al cambiar estado');
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      alert('Error al cambiar el estado');
    }
  };

  const resetForm = () => {
    setEditingZone(null);
    setFormData({
      name: '',
      description: '',
      delivery_cost: '',
      min_order_amount: '',
      estimated_time: '',
      is_active: true
    });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-SV', { 
      style: 'currency', 
      currency: 'USD' 
    }).format(value || 0);
  };

  if (loading) {
    return (
      <AdminLayout title="Zonas de Entrega">
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin text-4xl mb-4">⏳</div>
            <p className="text-slate-600">Cargando zonas...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="🗺️ Zonas de Entrega"
      subtitle="Gestiona las zonas donde realizas entregas"
    >
      {/* Header con botón agregar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-blue-600">Zonas de Entrega</h2>
          <p className="text-slate-600 mt-1">
            {zones.length} {zones.length === 1 ? 'zona configurada' : 'zonas configuradas'}
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 whitespace-nowrap w-full sm:w-auto"
        >
          ➕ Nueva Zona
        </button>
      </div>

      {/* Tabla de zonas */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">Zona</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">Descripción</th>
                <th className="px-6 py-4 text-center text-sm font-bold text-slate-700">Costo Delivery</th>
                <th className="px-6 py-4 text-center text-sm font-bold text-slate-700">Pedido Mínimo</th>
                <th className="px-6 py-4 text-center text-sm font-bold text-slate-700">Tiempo Est.</th>
                <th className="px-6 py-4 text-center text-sm font-bold text-slate-700">Estado</th>
                <th className="px-6 py-4 text-center text-sm font-bold text-slate-700">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {zones.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                    <div className="text-6xl mb-4">📍</div>
                    <p className="text-lg font-medium">No hay zonas configuradas</p>
                    <p className="text-sm mt-2">Agrega tu primera zona de entrega</p>
                  </td>
                </tr>
              ) : (
                zones.map((zone) => (
                  <tr key={zone.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">{zone.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-600 max-w-xs truncate">
                        {zone.description || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-semibold text-green-600">
                        {formatCurrency(zone.delivery_cost)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-slate-700">
                        {formatCurrency(zone.min_order_amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        ⏱️ {zone.estimated_time} min
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(zone.id, zone.is_active)}
                        className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                          zone.is_active
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        {zone.is_active ? '✅ Activa' : '❌ Inactiva'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2 flex-wrap">
                        <button
                          onClick={() => handleEdit(zone)}
                          className="p-2.5 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:scale-110 rounded-lg transition-all duration-200 text-lg shadow-sm hover:shadow-md"
                          title="Editar zona"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(zone.id)}
                          className="p-2.5 bg-red-50 text-red-600 hover:bg-red-100 hover:scale-110 rounded-lg transition-all duration-200 text-lg shadow-sm hover:shadow-md"
                          title="Eliminar zona"
                        >
                          🗑️
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

      {/* Modal para crear/editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 rounded-t-2xl">
              <h3 className="text-2xl font-bold text-white">
                {editingZone ? '✏️ Editar Zona' : '➕ Nueva Zona'}
              </h3>
              <p className="text-blue-100 mt-1">
                {editingZone ? 'Modifica los datos de la zona' : 'Configura una nueva zona de entrega'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Nombre de la Zona *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Centro, Zona Norte, Santa Tecla"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ej: Incluye Centro Histórico, Colonia Escalón..."
                  rows="3"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all resize-none"
                />
              </div>

              {/* Costo de Delivery */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Costo de Delivery (USD) *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-semibold">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.delivery_cost}
                    onChange={(e) => setFormData({ ...formData, delivery_cost: e.target.value })}
                    placeholder="2.50"
                    className="w-full pl-8 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Pedido Mínimo */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Monto Mínimo de Pedido (USD) *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-semibold">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.min_order_amount}
                    onChange={(e) => setFormData({ ...formData, min_order_amount: e.target.value })}
                    placeholder="5.00"
                    className="w-full pl-8 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Tiempo Estimado */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Tiempo Estimado de Entrega (minutos) *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.estimated_time}
                  onChange={(e) => setFormData({ ...formData, estimated_time: e.target.value })}
                  placeholder="30"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                />
              </div>

              {/* Estado */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-5 h-5 text-blue-600 border-2 border-slate-300 rounded focus:ring-2 focus:ring-blue-200"
                />
                <label htmlFor="is_active" className="text-sm font-semibold text-slate-700 cursor-pointer">
                  Zona activa (visible para clientes)
                </label>
              </div>

              {/* Botones */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {editingZone ? '💾 Guardar Cambios' : '➕ Crear Zona'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default DeliveryZonesPage;
