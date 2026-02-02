import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Contact from './pages/Contact';
import TermsAndConditions from './pages/TermsAndConditions';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Menu from './pages/Menu';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import MyOrders from './pages/MyOrders';
import Profile from './pages/Profile';
import TestConnection from './pages/TestConnection';
import TestCheckout from './pages/TestCheckout';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProductsPage from './pages/admin/ProductsPage';
import CategoriesPage from './pages/admin/CategoriesPage';
import OrdersPage from './pages/admin/OrdersPage';
import DriversPage from './pages/admin/DriversPage';
import CouponsPage from './pages/admin/CouponsPage';
import DeliveryZonesPage from './pages/admin/DeliveryZonesPage';
import DriverDashboard from './pages/driver/DriverDashboard';
import { authService } from './services/authService';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import { NotificationProvider } from './context/NotificationContext';

function ProtectedRoute({ children, allowedRoles }) {
  const isAuthenticated = authService.isAuthenticated();
  const user = authService.getCurrentUser();

  if (!isAuthenticated) {
    // Redirigir a admin-login si es una ruta de admin/driver, sino al menú
    const isAdminRoute = window.location.pathname.startsWith('/admin') || 
                        window.location.pathname.startsWith('/driver');
    return <Navigate to={isAdminRoute ? "/admin-login" : "/menu"} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to={user?.role === 'customer' ? "/menu" : "/admin-login"} replace />;
  }

  return children;
}

function App() {
  return (
    <ToastProvider>
      <NotificationProvider>
        <CartProvider>
          <Router>
          <Routes>
            {/* Rutas públicas de clientes */}
            <Route path="/contact" element={<Contact />} />
            <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            
            {/* Ruta de login de administradores y repartidores */}
            <Route path="/admin-login" element={<AdminLogin />} />
            
            {/* Rutas de administración */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/products" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ProductsPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/categories" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <CategoriesPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/orders" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <OrdersPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/drivers" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DriversPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/coupons" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <CouponsPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/zones" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DeliveryZonesPage />
              </ProtectedRoute>
            } />
            
            {/* Rutas de repartidor */}
            <Route path="/driver" element={
              <ProtectedRoute allowedRoles={['driver']}>
                <DriverDashboard />
              </ProtectedRoute>
            } />
            
            {/* Rutas de cliente */}
            <Route path="/menu" element={<Menu />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-success/:orderNumber" element={<OrderSuccess />} />
            <Route path="/my-orders" element={<MyOrders />} />
            <Route path="/profile" element={<Profile />} />
            
            {/* Ruta de test */}
            <Route path="/test-connection" element={<TestConnection />} />
            <Route path="/test-checkout" element={<TestCheckout />} />
            
            {/* Ruta raíz */}
            <Route path="/" element={<Navigate to="/menu" replace />} />
          </Routes>
        </Router>
      </CartProvider>
    </NotificationProvider>
    </ToastProvider>
  );
}

export default App;
