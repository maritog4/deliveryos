import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productService, categoryService } from '../../services/productService';
import AdminLayout from '../../components/AdminLayout';
import EmptyState from '../../components/EmptyState';

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [filterCategory, setFilterCategory] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category_id: '',
    price: '',
    image: '',
    is_available: true,
    is_featured: false,
    preparation_time: 15,
    display_order: 0
  });

  useEffect(() => {
    loadData();
  }, [filterCategory]);

  const loadData = async () => {
    try {
      setLoading(true);
      const filters = filterCategory ? { category_id: filterCategory } : {};
      
      const [productsRes, categoriesRes] = await Promise.all([
        productService.getAll(filters),
        categoryService.getAll('active')
      ]);

      if (productsRes.success) setProducts(productsRes.data);
      if (categoriesRes.success) setCategories(categoriesRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const data = {
        ...formData,
        is_available: formData.is_available ? 1 : 0,
        is_featured: formData.is_featured ? 1 : 0
      };

      let response;
      if (editingProduct) {
        response = await productService.update(editingProduct.id, data);
      } else {
        response = await productService.create(data);
      }

      if (response.success) {
        alert(editingProduct ? 'Producto actualizado' : 'Producto creado');
        setShowModal(false);
        resetForm();
        loadData();
      } else {
        alert(response.message || 'Error al guardar el producto');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error al guardar el producto');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Solo se permiten imágenes JPG, PNG, GIF o WEBP');
      return;
    }

    // Validar tamaño (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen es muy grande. Tamaño máximo: 5MB');
      return;
    }

    try {
      setUploadingImage(true);
      const formDataImg = new FormData();
      formDataImg.append('image', file);

      const response = await fetch('http://localhost/deliverySv/backend/api/products/upload-image.php', {
        method: 'POST',
        body: formDataImg
      });

      const data = await response.json();

      if (data.success) {
        setFormData({...formData, image: data.image_url});
        alert('Imagen subida exitosamente');
      } else {
        alert(data.message || 'Error al subir la imagen');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error al subir la imagen');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      category_id: product.category_id,
      price: product.price,
      image: product.image || '',
      is_available: product.is_available == 1,
      is_featured: product.is_featured == 1,
      preparation_time: product.preparation_time || 15,
      display_order: product.display_order || 0
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;

    try {
      const response = await productService.delete(id);
      if (response.success) {
        alert('Producto eliminado');
        loadData();
      } else {
        alert(response.message || 'Error al eliminar');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error al eliminar el producto');
    }
  };

  const handleToggleAvailability = async (product) => {
    try {
      const newAvailable = product.is_available == 1 ? 0 : 1;
      const response = await productService.toggleAvailability(product.id, newAvailable);
      if (response.success) {
        alert(`Producto ${newAvailable ? 'activado' : 'desactivado'} exitosamente`);
        loadData();
      } else {
        alert('Error al cambiar disponibilidad: ' + (response.message || 'Error desconocido'));
      }
    } catch (error) {
      console.error('Error toggling availability:', error);
      alert('Error al cambiar disponibilidad del producto');
    }
  };

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      category_id: '',
      price: '',
      image: '',
      is_available: true,
      is_featured: false,
      preparation_time: 15,
      display_order: 0
    });
  };

  if (loading) {
    return (
      <AdminLayout title="Gestión de Productos" subtitle="Carga...">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin text-4xl">⏳</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="🍔 Gestión de Productos"
      subtitle="Administra tu catálogo de productos"
    >
      {/* Action Bar */}
      <div className="mb-6 flex justify-between items-center">
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-gradient-to-br from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-sky-500/30 transition-all duration-200 transform hover:scale-[1.02]"
        >
          + Nuevo Producto
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 mb-6">
        <div className="flex gap-4 items-center">
          <label className="font-semibold text-slate-700">Filtrar por categoría:</label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="border-2 border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          >
            <option value="">Todas las categorías</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(product => (
          <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-200 group">
            <div className="h-48 bg-slate-100 overflow-hidden relative flex items-center justify-center">
              {product.image ? (
                <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
              ) : (
                <span className="text-6xl">🍽️</span>
              )}
            </div>
            
            <div className="p-4 text-center">
              <div className="flex flex-col items-center mb-2">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{product.name}</h3>
                  <span className="text-lg font-bold text-sky-600">
                    ${parseFloat(product.price).toFixed(2)}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {product.description || 'Sin descripción'}
                </p>

                <div className="flex gap-2 mb-3 justify-center">
                  <span className="px-2 py-1 bg-cyan-100 text-cyan-800 text-xs rounded-full">
                    {product.category_name}
                  </span>
                  {product.is_featured == 1 && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                      ⭐ Destacado
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm"
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={() => handleToggleAvailability(product)}
                    className={`w-full px-3 py-2 rounded text-sm text-white ${
                      product.is_available == 1
                        ? 'bg-orange-500 hover:bg-orange-600'
                        : 'bg-green-500 hover:bg-green-600'
                    }`}
                  >
                    {product.is_available == 1 ? '🚫 Desactivar' : '✅ Activar'}
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="w-full bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-sm"
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
      </div>

      {products.length === 0 && (
        <EmptyState
          icon="🍕"
          title="No hay productos"
          description="Agrega tu primer producto para comenzar a vender"
          action={
            <button
              onClick={() => {
                setEditingProduct(null);
                setFormData({
                  name: '',
                  description: '',
                  price: '',
                  category_id: '',
                  stock: '',
                  is_available: 1,
                  is_featured: 0,
                  image: null
                });
                setImagePreview(null);
                setShowModal(true);
              }}
              className="mt-4 px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
            >
              + Agregar Producto
            </button>
          }
        />
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">
                {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
              </h2>

              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nombre *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Descripción</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows="3"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Categoría *</label>
                      <select
                        required
                        value={formData.category_id}
                        onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2"
                      >
                        <option value="">Seleccionar...</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Precio ($) *</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Imagen del Producto</label>
                    
                    {/* Mostrar imagen actual si existe */}
                    {formData.image && (
                      <div className="mb-3">
                        <img 
                          src={formData.image} 
                          alt="Preview" 
                          className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
                        />
                      </div>
                    )}

                    {/* Botón para subir imagen */}
                    <div className="mb-3">
                      <label className="block">
                        <span className="sr-only">Seleccionar imagen</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                          onChange={handleImageUpload}
                          disabled={uploadingImage}
                          className="block w-full text-sm text-slate-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-lg file:border-0
                            file:text-sm file:font-semibold
                            file:bg-sky-50 file:text-sky-700
                            hover:file:bg-sky-100
                            cursor-pointer"
                        />
                      </label>
                      {uploadingImage && (
                        <p className="text-sm text-sky-600 mt-2">⏳ Subiendo imagen...</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Formatos: JPG, PNG, GIF, WEBP. Tamaño máximo: 5MB
                      </p>
                    </div>

                    {/* O ingresar URL manualmente */}
                    <div className="border-t pt-3">
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        O ingresa una URL de imagen
                      </label>
                      <input
                        type="url"
                        value={formData.image}
                        onChange={(e) => setFormData({...formData, image: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm"
                        placeholder="https://ejemplo.com/imagen.jpg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Tiempo de preparación (min)</label>
                      <input
                        type="number"
                        value={formData.preparation_time}
                        onChange={(e) => setFormData({...formData, preparation_time: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Orden de visualización</label>
                      <input
                        type="number"
                        value={formData.display_order}
                        onChange={(e) => setFormData({...formData, display_order: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2"
                      />
                    </div>
                  </div>

                  <div className="flex gap-6">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.is_available}
                        onChange={(e) => setFormData({...formData, is_available: e.target.checked})}
                        className="w-4 h-4"
                      />
                      <span>Disponible</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.is_featured}
                        onChange={(e) => setFormData({...formData, is_featured: e.target.checked})}
                        className="w-4 h-4"
                      />
                      <span>Destacado</span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    className="flex-1 bg-sky-600 hover:bg-sky-700 text-white px-6 py-3 rounded-lg font-semibold"
                  >
                    {editingProduct ? 'Actualizar' : 'Crear'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 px-6 py-3 rounded-xl font-semibold transition-all"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default ProductsPage;
