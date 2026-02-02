import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { categoryService } from '../../services/productService';
import AdminLayout from '../../components/AdminLayout';

function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: '',
    display_order: 0,
    status: 'active'
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await categoryService.getAll();
      if (response.success) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      alert('Error al cargar las categorías');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      let response;
      if (editingCategory) {
        response = await categoryService.update(editingCategory.id, formData);
      } else {
        response = await categoryService.create(formData);
      }

      if (response.success) {
        alert(editingCategory ? 'Categoría actualizada' : 'Categoría creada');
        setShowModal(false);
        resetForm();
        loadCategories();
      } else {
        alert(response.message || 'Error al guardar la categoría');
      }
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Error al guardar la categoría');
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      image_url: category.image_url || '',
      display_order: category.display_order || 0,
      status: category.status
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta categoría?')) return;

    try {
      const response = await categoryService.delete(id);
      if (response.success) {
        alert('Categoría eliminada');
        loadCategories();
      } else {
        alert(response.message || 'Error al eliminar');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Error al eliminar la categoría');
    }
  };

  const resetForm = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      image_url: '',
      display_order: 0,
      status: 'active'
    });
  };

  if (loading) {
    return (
      <AdminLayout title="Gestión de Categorías" subtitle="Cargando...">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin text-4xl">⏳</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="📂 Gestión de Categorías"
      subtitle="Administra las categorías de productos"
    >
      {/* Action Bar */}
      <div className="mb-6 flex justify-end">
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-gradient-to-br from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-sky-500/30 transition-all duration-200 transform hover:scale-[1.02]"
        >
          + Nueva Categoría
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map(category => (
          <div key={category.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-200">
            <div className="h-32 bg-gradient-to-r from-cyan-400 to-sky-400 flex items-center justify-center relative">
              {category.image_url ? (
                <img src={category.image_url} alt={category.name} className="h-full w-full object-cover" />
              ) : (
                <span className="text-5xl">📁</span>
              )}
            </div>
            
            <div className="p-5 text-center">
              <div className="flex flex-col items-center mb-3">
                <h3 className="text-lg font-bold text-slate-800 mb-2">{category.name}</h3>
                <span className={`px-3 py-1 text-xs rounded-full font-semibold ${
                  category.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  {category.status === 'active' ? 'Activa' : 'Inactiva'}
                </span>
              </div>

              <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                {category.description || 'Sin descripción'}
              </p>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleEdit(category)}
                  className="w-full bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-3 py-2 rounded-xl text-sm font-semibold transition-all"
                >
                  ✏️ Editar
                </button>
                <button
                  onClick={() => handleDelete(category.id)}
                  className="w-full bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-3 py-2 rounded-xl text-sm font-semibold transition-all"
                >
                  🗑️ Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
          <span className="text-6xl block mb-4">📦</span>
          <p className="text-slate-500 text-lg">No hay categorías para mostrar</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full">
            <div className="bg-gradient-to-br from-sky-500 to-cyan-600 text-white p-6 rounded-t-3xl">
              <h2 className="text-2xl font-bold">
                {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
              </h2>
            </div>
            <div className="p-6">
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

                  <div>
                    <label className="block text-sm font-medium mb-1">URL de Imagen</label>
                    <input
                      type="url"
                      value={formData.image_url}
                      onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2"
                      placeholder="https://ejemplo.com/imagen.jpg"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Orden</label>
                      <input
                        type="number"
                        value={formData.display_order}
                        onChange={(e) => setFormData({...formData, display_order: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Estado</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2"
                      >
                        <option value="active">Activa</option>
                        <option value="inactive">Inactiva</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    className="flex-1 bg-sky-600 hover:bg-sky-700 text-white px-6 py-3 rounded-lg font-semibold"
                  >
                    {editingCategory ? 'Actualizar' : 'Crear'}
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

export default CategoriesPage;

