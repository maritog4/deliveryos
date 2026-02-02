import { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';

const API_URL = 'http://localhost/deliverySv/backend/api';

function CouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percentage',
    discount_value: '',
    min_order_amount: '',
    max_discount: '',
    usage_limit: '',
    valid_from: '',
    valid_until: '',
    is_active: true,
    description: ''
  });

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/coupons/read.php`);
      
      if (response.data.success) {
        setCoupons(response.data.data || []);
      }
    } catch (error) {
      console.error('Error loading coupons:', error);
      alert('Error al cargar cupones');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const endpoint = editingCoupon 
        ? `${API_URL}/coupons/update.php`
        : `${API_URL}/coupons/create.php`;
      
      const dataToSend = editingCoupon 
        ? { ...formData, id: editingCoupon.id }
        : formData;

      const response = await axios.post(endpoint, dataToSend);
      
      if (response.data.success) {
        alert(editingCoupon ? 'Cupón actualizado exitosamente' : 'Cupón creado exitosamente');
        setShowModal(false);
        resetForm();
        loadCoupons();
      } else {
        alert(response.data.message || 'Error al guardar cupón');
      }
    } catch (error) {
      console.error('Error saving coupon:', error);
      alert('Error al guardar cupón');
    }
  };

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code || '',
      discount_type: coupon.discount_type || 'percentage',
      discount_value: coupon.discount_value || '',
      min_order_amount: coupon.min_order_amount || '',
      max_discount: coupon.max_discount || '',
      usage_limit: coupon.usage_limit || '',
      valid_from: coupon.valid_from || '',
      valid_until: coupon.valid_until || '',
      is_active: coupon.is_active === 1 || coupon.is_active === true,
      description: coupon.description || ''
    });
    setShowModal(true);
  };

  const handleToggleStatus = async (coupon) => {
    if (!confirm(`¿Estás seguro de ${coupon.is_active ? 'desactivar' : 'activar'} este cupón?`)) {
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/coupons/update.php`, {
        id: coupon.id,
        is_active: !coupon.is_active
      });
      
      if (response.data.success) {
        alert('Estado actualizado exitosamente');
        loadCoupons();
      } else {
        alert(response.data.message || 'Error al actualizar estado');
      }
    } catch (error) {
      console.error('Error toggling coupon status:', error);
      alert('Error al actualizar estado');
    }
  };

  const handleDelete = async (coupon) => {
    if (!confirm(`¿Estás seguro de eliminar el cupón "${coupon.code}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/coupons/delete.php`, {
        id: coupon.id
      });
      
      if (response.data.success) {
        alert('Cupón eliminado exitosamente');
        loadCoupons();
      } else {
        alert(response.data.message || 'Error al eliminar cupón');
      }
    } catch (error) {
      console.error('Error deleting coupon:', error);
      alert('Error al eliminar cupón');
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      discount_type: 'percentage',
      discount_value: '',
      min_order_amount: '',
      max_discount: '',
      usage_limit: '',
      valid_from: '',
      valid_until: '',
      is_active: true,
      description: ''
    });
    setEditingCoupon(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const getDiscountDisplay = (coupon) => {
    if (coupon.discount_type === 'percentage') {
      return `${coupon.discount_value}%`;
    } else {
      return `$${parseFloat(coupon.discount_value).toFixed(2)}`;
    }
  };

  const isExpired = (validUntil) => {
    if (!validUntil) return false;
    return new Date(validUntil) < new Date();
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-xl text-gray-600">Cargando cupones...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Gestión de Cupones</h1>
          <p className="text-gray-600 mt-2">Administra los cupones de descuento del sistema</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-sky-600 hover:bg-sky-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-colors"
        >
          + Nuevo Cupón
        </button>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
          <div className="text-emerald-100 text-sm font-semibold mb-2">ACTIVOS</div>
          <div className="text-4xl font-bold">
            {coupons.filter(c => c.is_active && !isExpired(c.valid_until)).length}
          </div>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg p-6 text-white">
          <div className="text-amber-100 text-sm font-semibold mb-2">INACTIVOS</div>
          <div className="text-4xl font-bold">
            {coupons.filter(c => !c.is_active).length}
          </div>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
          <div className="text-red-100 text-sm font-semibold mb-2">EXPIRADOS</div>
          <div className="text-4xl font-bold">
            {coupons.filter(c => isExpired(c.valid_until)).length}
          </div>
        </div>
        <div className="bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl shadow-lg p-6 text-white">
          <div className="text-violet-100 text-sm font-semibold mb-2">TOTAL</div>
          <div className="text-4xl font-bold">
            {coupons.length}
          </div>
        </div>
      </div>

      {/* Tabla de cupones */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Código
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Descuento
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Uso
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Validez
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
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    No hay cupones registrados
                  </td>
                </tr>
              ) : (
                coupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12 bg-gradient-to-br from-sky-400 to-cyan-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                          🎟️
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-gray-900">{coupon.code}</div>
                          <div className="text-sm text-gray-500">{coupon.description || 'Sin descripción'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-gray-900">
                        {getDiscountDisplay(coupon)}
                      </div>
                      <div className="text-sm text-gray-500">
                        Mín: ${parseFloat(coupon.min_order_amount || 0).toFixed(2)}
                      </div>
                      {coupon.max_discount && coupon.discount_type === 'percentage' && (
                        <div className="text-sm text-gray-500">
                          Máx: ${parseFloat(coupon.max_discount).toFixed(2)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {coupon.usage_count || 0} / {coupon.usage_limit || '∞'}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className="bg-sky-600 h-2 rounded-full"
                          style={{
                            width: coupon.usage_limit 
                              ? `${Math.min((coupon.usage_count / coupon.usage_limit) * 100, 100)}%`
                              : '0%'
                          }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        Desde: {coupon.valid_from ? new Date(coupon.valid_from).toLocaleDateString() : 'Siempre'}
                      </div>
                      <div className="text-sm text-gray-500">
                        Hasta: {coupon.valid_until ? new Date(coupon.valid_until).toLocaleDateString() : 'Sin límite'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isExpired(coupon.valid_until) ? (
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          🕐 Expirado
                        </span>
                      ) : (
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          coupon.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {coupon.is_active ? '● Activo' : '○ Inactivo'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(coupon)}
                          className="text-sky-600 hover:text-sky-800 font-semibold bg-transparent border-0 p-0 cursor-pointer transition-colors"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleToggleStatus(coupon)}
                          className={`font-semibold bg-transparent border-0 p-0 cursor-pointer transition-colors ${
                            coupon.is_active
                              ? 'text-amber-600 hover:text-amber-800'
                              : 'text-emerald-600 hover:text-emerald-800'
                          }`}
                        >
                          {coupon.is_active ? 'Desactivar' : 'Activar'}
                        </button>
                        <button
                          onClick={() => handleDelete(coupon)}
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

      {/* Modal para crear/editar cupón */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-sky-500 to-cyan-500 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">
                {editingCoupon ? 'Editar Cupón' : 'Nuevo Cupón'}
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
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Código del Cupón *
                  </label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent uppercase"
                    placeholder="Ej: VERANO2026"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tipo de Descuento *
                  </label>
                  <select
                    name="discount_type"
                    value={formData.discount_type}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  >
                    <option value="percentage">Porcentaje (%)</option>
                    <option value="fixed">Monto Fijo ($)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Valor del Descuento *
                  </label>
                  <input
                    type="number"
                    name="discount_value"
                    value={formData.discount_value}
                    onChange={handleInputChange}
                    required
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder={formData.discount_type === 'percentage' ? '10' : '5.00'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Pedido Mínimo ($)
                  </label>
                  <input
                    type="number"
                    name="min_order_amount"
                    value={formData.min_order_amount}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>

                {formData.discount_type === 'percentage' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Descuento Máximo ($)
                    </label>
                    <input
                      type="number"
                      name="max_discount"
                      value={formData.max_discount}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      placeholder="Opcional"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Límite de Usos
                  </label>
                  <input
                    type="number"
                    name="usage_limit"
                    value={formData.usage_limit}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="Ilimitado"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Válido Desde
                  </label>
                  <input
                    type="date"
                    name="valid_from"
                    value={formData.valid_from}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Válido Hasta
                  </label>
                  <input
                    type="date"
                    name="valid_until"
                    value={formData.valid_until}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="Descripción del cupón (opcional)"
                  ></textarea>
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-sky-600 border-gray-300 rounded focus:ring-sky-500"
                    />
                    <span className="text-sm font-semibold text-gray-700">
                      Cupón Activo
                    </span>
                  </label>
                </div>
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
                  {editingCoupon ? 'Actualizar' : 'Crear'} Cupón
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default CouponsPage;
