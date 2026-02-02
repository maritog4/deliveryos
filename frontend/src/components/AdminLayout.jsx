import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';

function AdminLayout({ children, title, subtitle }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
    navigate('/admin-login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-sky-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin')}
                className="flex items-center gap-3 bg-transparent"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl">🍽️</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-800">Delivery SV</h1>
                  <p className="text-xs text-slate-500">Panel de Administración</p>
                </div>
              </button>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-700">{user?.name}</p>
                <p className="text-xs text-slate-500">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-white border-2 border-slate-200 hover:border-red-300 hover:bg-red-50 text-slate-700 hover:text-red-600 px-5 py-2.5 rounded-xl transition-all duration-200 font-medium shadow-sm hover:shadow"
              >
                <span className="hidden sm:inline">Cerrar Sesión</span>
                <span className="sm:hidden">🚪</span>
              </button>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex flex-wrap gap-2 pb-4 border-t border-slate-100 pt-4 overflow-x-auto">
            <button
              onClick={() => navigate('/admin')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
                location.pathname === '/admin'
                  ? 'bg-sky-600 text-white border-2 border-sky-600'
                  : 'bg-white hover:bg-sky-50 text-sky-600 border-2 border-sky-200 hover:border-sky-300'
              }`}
            >
              📊 Dashboard
            </button>
            <button
              onClick={() => navigate('/admin/orders')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
                location.pathname === '/admin/orders'
                  ? 'bg-emerald-600 text-white border-2 border-emerald-600'
                  : 'bg-white hover:bg-emerald-50 text-emerald-600 border-2 border-emerald-200 hover:border-emerald-300'
              }`}
            >
              📦 Órdenes
            </button>
            <button
              onClick={() => navigate('/admin/products')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
                location.pathname === '/admin/products'
                  ? 'bg-amber-600 text-white border-2 border-amber-600'
                  : 'bg-white hover:bg-amber-50 text-amber-600 border-2 border-amber-200 hover:border-amber-300'
              }`}
            >
              🍕 Productos
            </button>
            <button
              onClick={() => navigate('/admin/categories')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
                location.pathname === '/admin/categories'
                  ? 'bg-violet-600 text-white border-2 border-violet-600'
                  : 'bg-white hover:bg-violet-50 text-violet-600 border-2 border-violet-200 hover:border-violet-300'
              }`}
            >
              📂 Categorías
            </button>
            <button
              onClick={() => navigate('/admin/drivers')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
                location.pathname === '/admin/drivers'
                  ? 'bg-cyan-600 text-white border-2 border-cyan-600'
                  : 'bg-white hover:bg-cyan-50 text-cyan-600 border-2 border-cyan-200 hover:border-cyan-300'
              }`}
            >
              🚚 Repartidores
            </button>
            <button
              onClick={() => navigate('/admin/coupons')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
                location.pathname === '/admin/coupons'
                  ? 'bg-rose-600 text-white border-2 border-rose-600'
                  : 'bg-white hover:bg-rose-50 text-rose-600 border-2 border-rose-200 hover:border-rose-300'
              }`}
            >
              🎟️ Cupones
            </button>
            <button
              onClick={() => navigate('/admin/zones')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
                location.pathname === '/admin/zones'
                  ? 'bg-indigo-600 text-white border-2 border-indigo-600'
                  : 'bg-white hover:bg-indigo-50 text-indigo-600 border-2 border-indigo-200 hover:border-indigo-300'
              }`}
            >
              🗺️ Zonas
            </button>
          </nav>
        </div>
      </header>

      {/* Page Title */}
      {(title || subtitle) && (
        <div className="bg-white border-b border-slate-200">
          <div className="px-8 py-6 text-center">
            {title && (
              <h2 className="text-3xl font-bold text-slate-800 mb-1">{title}</h2>
            )}
            {subtitle && (
              <p className="text-slate-500">{subtitle}</p>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <main className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-8">
        {children}
      </main>
    </div>
  );
}

export default AdminLayout;
