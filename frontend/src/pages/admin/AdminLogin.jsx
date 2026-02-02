import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { authService } from '../../services/authService';
import LoadingButton from '../../components/LoadingButton';

const API_URL = 'http://localhost/deliverySv/backend/api';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/auth/login.php`, formData);
      console.log('Response completa:', response.data);

      if (response.data.success) {
        const { user, token } = response.data.data;
        console.log('Usuario extraído:', user);
        console.log('Rol del usuario:', user.role);
        
        // Validar que sea admin o driver
        if (user.role !== 'admin' && user.role !== 'driver') {
          console.log('Rol rechazado:', user.role);
          setError('Acceso denegado. Esta área es solo para administradores y repartidores.');
          setLoading(false);
          return;
        }

        console.log('Rol aceptado, guardando sesión...');
        // Guardar sesión manualmente (no usar authService.login porque ya hicimos el login)
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        // Redirigir según el rol
        if (user.role === 'admin') {
          console.log('Redirigiendo a /admin');
          navigate('/admin');
        } else if (user.role === 'driver') {
          console.log('Redirigiendo a /driver');
          navigate('/driver');
        }
      } else {
        setError(response.data.message || 'Error al iniciar sesión');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Error de conexión. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50 to-emerald-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Logo y Título */}
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-sky-500 to-cyan-500 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-4xl">🚚</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            Panel de Administración
          </h2>
          <p className="mt-2 text-gray-600">
            Acceso exclusivo para administradores y repartidores
          </p>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-red-500 text-xl">⚠️</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Correo Electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
                placeholder="Correo electrónico"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
                placeholder="••••••••"
              />
            </div>

            <LoadingButton
              type="submit"
              loading={loading}
              loadingText="Iniciando sesión..."
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-white bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 font-semibold transition-all transform hover:scale-[1.02]"
            >
              Iniciar Sesión
            </LoadingButton>
          </form>

          {/* Link al sitio cliente */}
          <div className="mt-6 text-center">
            <Link 
              to="/menu" 
              className="text-sm text-sky-600 hover:text-sky-700 font-medium transition"
            >
              ← Ir al menú de clientes
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Sistema de Delivery © 2026
        </p>
      </div>
    </div>
  );
}
