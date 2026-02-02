import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useToast } from '../context/ToastContext';

function Profile() {
  const [user, setUser] = useState(authService.getCurrentUser());
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || ''
    });
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Aquí irá la llamada al backend para actualizar el perfil
      toast.success('Perfil actualizado exitosamente');
      
      // Actualizar usuario en localStorage
      const updatedUser = { ...user, ...formData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      toast.error('Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (passwordData.new_password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      // Aquí irá la llamada al backend para cambiar la contraseña
      toast.success('Contraseña actualizada exitosamente');
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
      setShowPasswordForm(false);
    } catch (error) {
      toast.error('Error al cambiar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/menu');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-sky-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="px-8 py-6 flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-slate-600 hover:text-sky-600 transition-colors"
          >
            <span className="text-2xl">←</span>
            <span className="font-semibold">Volver al Menú</span>
          </button>
          <h1 className="text-2xl font-bold text-sky-600">Mi Perfil</h1>
          <div className="w-32"></div>
        </div>
      </header>

      <main className="px-8 py-8 max-w-4xl mx-auto">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Información Personal */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <span>👤</span>
              Información Personal
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-br from-sky-500 to-sky-600 text-white rounded-xl font-semibold hover:from-sky-600 hover:to-sky-700 transition-all disabled:opacity-50 shadow-lg shadow-sky-500/30"
              >
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </form>
          </div>

          {/* Cambiar Contraseña */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <span>🔒</span>
              Seguridad
            </h2>

            {!showPasswordForm ? (
              <div className="space-y-4">
                <p className="text-slate-600">
                  Mantén tu cuenta segura actualizando tu contraseña regularmente.
                </p>
                <button
                  onClick={() => setShowPasswordForm(true)}
                  className="w-full py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-all"
                >
                  Cambiar Contraseña
                </button>

                <div className="pt-4 border-t border-slate-200">
                  <p className="text-sm text-slate-600 mb-2">
                    <strong>Tipo de cuenta:</strong> {user.role === 'admin' ? 'Administrador' : 'Cliente'}
                  </p>
                  <p className="text-sm text-slate-600">
                    <strong>Miembro desde:</strong> {new Date(user.created_at || Date.now()).toLocaleDateString('es-SV')}
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Contraseña Actual
                  </label>
                  <input
                    type="password"
                    name="current_password"
                    value={passwordData.current_password}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nueva Contraseña
                  </label>
                  <input
                    type="password"
                    name="new_password"
                    value={passwordData.new_password}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    required
                    minLength="6"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Confirmar Nueva Contraseña
                  </label>
                  <input
                    type="password"
                    name="confirm_password"
                    value={passwordData.confirm_password}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    required
                    minLength="6"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordForm(false);
                      setPasswordData({
                        current_password: '',
                        new_password: '',
                        confirm_password: ''
                      });
                    }}
                    className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 bg-gradient-to-br from-sky-500 to-sky-600 text-white rounded-xl font-semibold hover:from-sky-600 hover:to-sky-700 transition-all disabled:opacity-50 shadow-lg shadow-sky-500/30"
                  >
                    {loading ? 'Actualizando...' : 'Actualizar'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Estadísticas */}
        <div className="mt-6 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span>📊</span>
            Mis Estadísticas
          </h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-sky-50 rounded-xl">
              <div className="text-3xl font-bold text-sky-600 mb-1">0</div>
              <div className="text-sm text-slate-600">Órdenes Totales</div>
            </div>
            <div className="p-4 bg-green-50 rounded-xl">
              <div className="text-3xl font-bold text-green-600 mb-1">$0</div>
              <div className="text-sm text-slate-600">Total Gastado</div>
            </div>
            <div className="p-4 bg-purple-50 rounded-xl">
              <div className="text-3xl font-bold text-purple-600 mb-1">0</div>
              <div className="text-sm text-slate-600">Cupones Usados</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Profile;
