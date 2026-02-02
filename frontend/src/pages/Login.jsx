import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import LoadingButton from '../components/LoadingButton';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.login(email, password);
      
      if (response.success) {
        const user = response.data.user;
        
        if (user.role === 'admin') {
          navigate('/admin');
        } else if (user.role === 'driver') {
          navigate('/driver');
        } else {
          navigate('/menu');
        }
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-sky-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-sky-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg shadow-sky-500/30 mx-auto mb-4 transform hover:scale-110 transition-transform duration-300">
            <span className="text-4xl">🍽️</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Delivery SV</h1>
          <p className="text-slate-500">Sistema de pedidos en línea</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-xl">
              <p className="font-medium flex items-center">
                <span className="mr-2">⚠️</span> {error}
              </p>
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
              Correo Electrónico
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 bg-slate-50 hover:bg-white hover:border-slate-300"
              placeholder="usuario@ejemplo.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 bg-slate-50 hover:bg-white hover:border-slate-300"
              placeholder="••••••••"
            />
            <div className="mt-2 text-right">
              <Link to="/forgot-password" className="text-sm text-sky-600 hover:text-sky-700 font-medium">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          </div>

          <LoadingButton
            type="submit"
            loading={loading}
            loadingText="Iniciando sesión..."
            className="w-full bg-gradient-to-br from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-bold py-4 px-4 rounded-xl shadow-lg shadow-sky-500/30 transition-all duration-200 transform hover:scale-[1.02] hover:shadow-xl"
          >
            Iniciar Sesión
          </LoadingButton>
        </form>

        {/* Link al login de administradores */}
        <div className="mt-6 text-center">
          <p className="text-slate-600 text-sm">
            ¿Eres administrador?{' '}
            <Link 
              to="/admin-login" 
              className="text-sky-600 hover:text-sky-700 font-semibold transition-colors"
            >
              Ir al panel administrativo
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
