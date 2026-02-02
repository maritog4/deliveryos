import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { productService, categoryService } from '../services/productService';
// import { favoriteService } from '../services/favoriteService';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { authService } from '../services/authService';
import LoginDropdown from '../components/LoginModal';
import NotificationBell from '../components/NotificationBell';
import EmptyState from '../components/EmptyState';

function Menu() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('featured'); // featured, name-asc, name-desc, price-asc, price-desc
  const [loading, setLoading] = useState(true);
  const [showCart, setShowCart] = useState(false);
  const [showLoginDropdown, setShowLoginDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  // const [favorites, setFavorites] = useState([]);
  const { cart, addToCart, removeFromCart, updateQuantity, clearCart, getCartTotal, getCartItemsCount } = useCart();
  const navigate = useNavigate();
  const [user, setUser] = useState(authService.getCurrentUser());
  const toast = useToast();

  useEffect(() => {
    loadData();
  }, [selectedCategory]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /* TEMPORALMENTE DESHABILITADO - FAVORITOS
  useEffect(() => {
    const loadFavorites = async () => {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        setFavorites([]);
        return;
      }
      try {
        const response = await favoriteService.getAll();
        if (response.success) {
          setFavorites(response.data);
        }
      } catch (error) {
        if (error.response?.status === 401) {
          setFavorites([]);
        }
      }
    };
    
    loadFavorites();
  }, []);
  */

  const loadData = async () => {
    try {
      setLoading(true);
      const filters = selectedCategory !== 'all' ? { category_id: selectedCategory, available: 1 } : { available: 1 };
      
      console.log('🔍 Cargando productos con filtros:', filters);
      
      const [productsRes, categoriesRes] = await Promise.all([
        productService.getAll(filters),
        categoryService.getAll('active')
      ]);

      console.log('📦 Respuesta de productos:', productsRes);
      console.log('📁 Respuesta de categorías:', categoriesRes);

      if (productsRes.success) {
        console.log('✅ Productos recibidos:', productsRes.data.length);
        setProducts(productsRes.data);
      }
      if (categoriesRes.success) {
        console.log('✅ Categorías recibidas:', categoriesRes.data.length);
        setCategories(categoriesRes.data);
      }
    } catch (error) {
      console.error('❌ Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  /* TEMPORALMENTE DESHABILITADO - FAVORITOS
  const handleToggleFavorite = async (productId) => {
    if (!user) {
      setShowLoginDropdown(true);
      toast.warning('Inicia sesión para guardar favoritos');
      return;
    }

    const isFav = favorites.some(fav => fav.product_id == productId);
    
    try {
      if (isFav) {
        await favoriteService.remove(productId);
        setFavorites(favorites.filter(fav => fav.product_id != productId));
        toast.info('Eliminado de favoritos');
      } else {
        const response = await favoriteService.add(productId);
        if (response.success) {
          const product = products.find(p => p.id == productId);
          if (product) {
            setFavorites([...favorites, { product_id: productId, ...product }]);
          }
        }
        toast.success('Agregado a favoritos ❤️');
      }
    } catch (error) {
      toast.error('Error al actualizar favoritos');
    }
  };
  */

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    toast.success(`✅ ${product.name} agregado al carrito`);
    
    // Animar el botón del carrito
    const cartBtn = document.querySelector('[data-cart-button]');
    if (cartBtn) {
      cartBtn.classList.add('animate-bounce');
      setTimeout(() => cartBtn.classList.remove('animate-bounce'), 1000);
    }
  };

  const handleCheckout = () => {
    // Permitir checkout sin login
    navigate('/checkout');
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    // Ya no redirigir, quedarse en el menú
  };

  const handleLogout = () => {
    authService.logout();
    clearCart(); // Limpiar el carrito al cerrar sesión
    setUser(null);
    toast.info('Sesión cerrada');
  };

  // Filtrar productos por búsqueda, categoría y precio
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  // Ordenar productos
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch(sortBy) {
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      case 'price-asc':
        return parseFloat(a.price) - parseFloat(b.price);
      case 'price-desc':
        return parseFloat(b.price) - parseFloat(a.price);
      case 'featured':
      default:
        // Destacados primero, luego por nombre
        if (a.is_featured != b.is_featured) {
          return b.is_featured - a.is_featured;
        }
        return a.name.localeCompare(b.name);
    }
  });

  console.log('📊 Total productos:', products.length);
  console.log('🔍 Productos filtrados:', filteredProducts.length);
  console.log('📈 Productos ordenados:', sortedProducts.length);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-sky-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 border-t-sky-600 mx-auto"></div>
          <p className="mt-6 text-slate-600 font-medium">Cargando menú...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-sky-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">🍽️</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Delivery SV</h1>
                <p className="text-sm text-slate-500">Comida deliciosa a tu puerta</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {user ? (
                <div className="relative">
                  {/* User Avatar Button */}
                  <button
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    className="flex items-center gap-2 bg-gradient-to-r from-sky-50 to-cyan-50 hover:from-sky-100 hover:to-cyan-100 px-3 py-2 rounded-lg border border-sky-200 transition-all duration-200"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-500 to-cyan-600 flex items-center justify-center shadow-md">
                      <span className="text-white font-bold text-xs">
                        {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </span>
                    </div>
                    <div className="text-left hidden sm:block">
                      <p className="text-xs font-semibold text-slate-800">{user.name}</p>
                    </div>
                    <svg 
                      className={`w-4 h-4 text-slate-600 transition-transform ${showUserDropdown ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {showUserDropdown && (
                    <>
                      {/* Invisible Backdrop - only to close */}
                      <div 
                        className="fixed inset-0 z-40 bg-transparent" 
                        onClick={() => setShowUserDropdown(false)}
                      />
                      
                      {/* Dropdown Content */}
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-50 animate-fadeIn">
                        {/* User Info Header */}
                        <div className="px-3 py-2 border-b border-slate-100">
                          <p className="text-xs font-semibold text-slate-800 truncate">{user.name}</p>
                          <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        </div>

                        {/* Menu Items */}
                        <div className="py-1">
                          <button
                            onClick={() => {
                              navigate('/profile');
                              setShowUserDropdown(false);
                            }}
                            className="w-full px-3 py-2 text-left bg-white hover:bg-gradient-to-r hover:from-cyan-50 hover:to-sky-50 transition-all duration-200 flex items-center gap-2 group rounded-lg mx-1"
                          >
                            <div className="w-8 h-8 rounded-lg bg-cyan-100 flex items-center justify-center group-hover:bg-cyan-200 group-hover:scale-110 transition-all duration-200">
                              <span className="text-base">👤</span>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-slate-800">Mi Perfil</p>
                            </div>
                          </button>

                          <button
                            onClick={() => {
                              navigate('/my-orders');
                              setShowUserDropdown(false);
                            }}
                            className="w-full px-3 py-2 text-left bg-white hover:bg-gradient-to-r hover:from-sky-50 hover:to-cyan-50 transition-all duration-200 flex items-center gap-2 group rounded-lg mx-1"
                          >
                            <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center group-hover:bg-sky-200 group-hover:scale-110 transition-all duration-200">
                              <span className="text-base">📦</span>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-slate-800">Mis Pedidos</p>
                            </div>
                          </button>

                          <button
                            onClick={() => {
                              navigate('/contact');
                              setShowUserDropdown(false);
                            }}
                            className="w-full px-3 py-2 text-left bg-white hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-200 flex items-center gap-2 group rounded-lg mx-1"
                          >
                            <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center group-hover:bg-green-200 group-hover:scale-110 transition-all duration-200">
                              <span className="text-base">📧</span>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-slate-800">Contacto</p>
                            </div>
                          </button>

                          {/* TEMPORALMENTE DESHABILITADO - FAVORITOS
                          <button
                            onClick={() => {
                              navigate('/favorites');
                              setShowUserDropdown(false);
                            }}
                            className="w-full px-3 py-2 text-left hover:bg-sky-50 transition-colors flex items-center gap-2 group"
                          >
                            <div className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center group-hover:bg-pink-200 transition-colors">
                              <span className="text-base">❤️</span>
                            </div>
                            <div className="flex-1">
                              <p className="text-xs font-medium text-slate-800">Favoritos</p>
                            </div>
                          </button>
                          */}
                        </div>

                        {/* Logout */}
                        <div className="border-t border-slate-100 pt-1">
                          <button
                            onClick={() => {
                              handleLogout();
                              setShowUserDropdown(false);
                            }}
                            className="w-full px-3 py-2 text-left bg-white hover:bg-gradient-to-r hover:from-red-50 hover:to-rose-50 transition-all duration-200 flex items-center gap-2 group rounded-lg mx-1"
                          >
                            <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center group-hover:bg-red-200 group-hover:scale-110 transition-all duration-200">
                              <span className="text-base">🚪</span>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-red-600">Cerrar Sesión</p>
                            </div>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setShowLoginDropdown(!showLoginDropdown)}
                  className="text-sm bg-gradient-to-br from-sky-100 to-cyan-100 hover:from-sky-200 hover:to-cyan-200 text-sky-700 px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 border border-sky-200"
                >
                  <span className="text-lg">👤</span>
                  Iniciar Sesión
                </button>
              )}
              
              {/* 🔔 Campana de Notificaciones */}
              {user && <NotificationBell />}
              
              <button
                onClick={() => setShowCart(!showCart)}
                data-cart-button
                className="relative bg-gradient-to-br from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg shadow-sky-500/30 transition-all duration-200"
              >
                🛒 Carrito
                {getCartItemsCount() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg">
                    {getCartItemsCount()}
                  </span>
                )}
              </button>
            </div>
            
            {/* Login Dropdown Modal - Outside header */}
            {showLoginDropdown && (
              <LoginDropdown 
                isOpen={showLoginDropdown} 
                onClose={() => setShowLoginDropdown(false)}
                onLoginSuccess={handleLoginSuccess}
              />
            )}
          </div>
        </div>
      </header>

      <main className="px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Búsqueda */}
              <div className="md:col-span-2">
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="🔍 Buscar productos..."
                    className="w-full px-5 py-3 pr-10 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
              
              {/* Ordenar por */}
              <div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-5 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all bg-white cursor-pointer"
                >
                  <option value="featured">⭐ Destacados</option>
                  <option value="name-asc">🔤 Nombre (A-Z)</option>
                  <option value="name-desc">🔤 Nombre (Z-A)</option>
                  <option value="price-asc">💲 Precio (menor)</option>
                  <option value="price-desc">💲 Precio (mayor)</option>
                </select>
              </div>
            </div>
            
            {/* Resultados de búsqueda */}
            {searchTerm && (
              <div className="mt-4 text-sm text-slate-600">
                {sortedProducts.length} {sortedProducts.length === 1 ? 'producto encontrado' : 'productos encontrados'}
              </div>
            )}
          </div>
        </div>

        {/* Categories Filter */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
                  selectedCategory === 'all'
                    ? 'bg-gradient-to-br from-sky-500 to-sky-600 text-white shadow-lg shadow-sky-500/30'
                    : 'bg-gradient-to-br from-sky-100 to-cyan-100 text-sky-700 hover:from-sky-200 hover:to-cyan-200'
                }`}
              >
                <span>Todas</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  selectedCategory === 'all' 
                    ? 'bg-white/20' 
                    : 'bg-sky-200'
                }`}>
                  {products.length}
                </span>
              </button>
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
                    selectedCategory === category.id
                      ? 'bg-gradient-to-br from-sky-500 to-sky-600 text-white shadow-lg shadow-sky-500/30'
                      : 'bg-gradient-to-br from-sky-100 to-cyan-100 text-sky-700 hover:from-sky-200 hover:to-cyan-200'
                  }`}
                >
                  <span>{category.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    selectedCategory === category.id 
                      ? 'bg-white/20' 
                      : 'bg-sky-200'
                  }`}>
                    {products.filter(p => p.category_id == category.id).length}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {sortedProducts.length === 0 ? (
            <div className="col-span-full">
              <EmptyState
                icon="🔍"
                title="No se encontraron productos"
                description="Intenta con otros términos de búsqueda o filtros diferentes"
              />
            </div>
          ) : (
            sortedProducts.map((product, index) => (
              <motion.div 
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  delay: index * 0.05,
                  duration: 0.4,
                  ease: "easeOut"
                }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className={`bg-white rounded-2xl shadow-sm border overflow-hidden hover:shadow-lg transition-all duration-200 group ${product.is_featured == 1 ? 'border-yellow-300 ring-2 ring-yellow-200' : 'border-slate-200'}`}
              >
              <div className="h-56 bg-gradient-to-br from-sky-50 to-cyan-50 overflow-hidden relative">
                {/* TEMPORALMENTE DESHABILITADO - FAVORITOS
                <button
                  onClick={() => handleToggleFavorite(product.id)}
                  className="absolute top-3 right-3 z-10 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center hover:scale-110 transition-all"
                >
                  <span className="text-xl">
                    {favorites.some(fav => fav.product_id == product.id) ? '❤️' : '🤍'}
                  </span>
                </button>
                */}
                
                {product.image ? (
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300" 
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <span className="text-7xl">🍽️</span>
                  </div>
                )}
                {product.is_featured == 1 && (
                  <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg animate-pulse">
                    ⭐ Destacado
                  </div>
                )}
              </div>
              
              <div className="p-5 text-center">
                <div className="flex flex-col items-center mb-2">
                  <h3 className="text-lg font-bold text-slate-800 mb-2">{product.name}</h3>
                  <span className="text-xl font-bold text-sky-600">
                    ${parseFloat(product.price).toFixed(2)}
                  </span>
                </div>

                <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                  {product.description || 'Delicioso platillo preparado con ingredientes frescos'}
                </p>

                <div className="flex flex-col items-center gap-3">
                  <span className="text-xs text-sky-600 bg-gradient-to-br from-sky-100 to-cyan-100 px-3 py-1 rounded-full border border-sky-200">
                    ⏱️ {product.preparation_time || 15} min
                  </span>
                  <motion.button
                    onClick={() => handleAddToCart(product)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-br from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-sky-500/30 transition-all duration-200 w-full"
                  >
                    Agregar +
                  </motion.button>
                </div>
              </div>
              </motion.div>
            ))
          )}
        </div>
      </main>

      {/* Cart Sidebar */}
      <AnimatePresence>
        {showCart && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-sky-900 bg-opacity-20 backdrop-blur-sm z-40"
              onClick={() => setShowCart(false)}
            ></motion.div>
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full md:w-96 bg-white shadow-2xl z-50 flex flex-col"
            >
            <div className="p-6 border-b border-slate-200 bg-white">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-sky-700">Tu Carrito</h2>
                  {cart.length > 0 && (
                    <p className="text-sm text-sky-600 mt-1">{getCartItemsCount()} {getCartItemsCount() === 1 ? 'artículo' : 'artículos'}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {cart.length > 0 && (
                    <button
                      onClick={() => {
                        if (window.confirm('¿Estás seguro de vaciar el carrito?')) {
                          clearCart();
                          toast.info('Carrito vaciado');
                        }
                      }}
                      className="bg-gradient-to-br from-red-50 to-rose-50 hover:from-red-100 hover:to-rose-100 text-red-600 hover:text-red-700 text-sm font-medium px-3 py-1.5 rounded-lg border border-red-200 transition-all"
                      title="Vaciar carrito"
                    >
                      🗑️ Vaciar
                    </button>
                  )}
                  <button
                    onClick={() => setShowCart(false)}
                    className="bg-gradient-to-br from-sky-50 to-cyan-50 hover:from-sky-100 hover:to-cyan-100 text-sky-600 hover:text-sky-700 rounded-lg w-9 h-9 flex items-center justify-center text-xl border border-sky-200 transition-all"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <span className="text-6xl block mb-4">🛒</span>
                  <p className="text-sky-600 text-lg">Tu carrito está vacío</p>
                  <p className="text-sky-500 text-sm mt-2">Agrega productos del menú</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map(item => (
                    <div key={item.id} className="bg-gradient-to-br from-sky-50 to-cyan-50 rounded-xl p-4 border border-sky-100">
                      <div className="flex gap-4">
                        {/* Imagen del producto */}
                        <div className="w-20 h-20 rounded-lg overflow-hidden bg-white flex-shrink-0 border border-sky-200">
                          {item.image ? (
                            <img 
                              src={item.image} 
                              alt={item.name} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-3xl">🍽️</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Información del producto */}
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="font-semibold text-sky-800">{item.name}</h4>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-red-500 hover:text-red-700 text-sm font-medium hover:bg-red-50 rounded-lg px-2 py-1 transition-all"
                            >
                              🗑️
                            </button>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2 bg-white rounded-lg border-2 border-sky-300 overflow-hidden">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="px-3 py-1.5 bg-gradient-to-br from-sky-100 to-cyan-100 hover:from-sky-200 hover:to-cyan-200 text-sky-700 font-bold transition-all"
                              >
                                -
                              </button>
                              <span className="font-bold text-sky-700 px-2">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="px-3 py-1.5 bg-gradient-to-br from-sky-100 to-cyan-100 hover:from-sky-200 hover:to-cyan-200 text-sky-700 font-bold transition-all"
                              >
                                +
                              </button>
                            </div>
                            <span className="font-bold text-sky-600">
                              ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-6 border-t border-slate-200 bg-white">
                {/* Tiempo estimado de preparación */}
                <div className="mb-4 p-4 bg-gradient-to-br from-sky-50 to-cyan-50 rounded-lg border border-sky-200">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-lg">⏱️</span>
                    <div>
                      <p className="font-semibold text-sky-700">Tiempo estimado:</p>
                      <p className="text-sky-600">
                        {Math.max(...cart.map(item => parseInt(item.preparation_time) || 15))} - {Math.max(...cart.map(item => parseInt(item.preparation_time) || 15)) + 15} minutos
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold text-sky-700">Total:</span>
                  <span className="text-2xl font-bold text-sky-600">
                    ${getCartTotal().toFixed(2)}
                  </span>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full bg-gradient-to-br from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-sky-500/30 transition-all duration-200 transform hover:scale-105"
                >
                  Proceder al Pago
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
      </AnimatePresence>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 bg-gradient-to-br from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white w-12 h-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center z-30 transform hover:scale-110"
          title="Volver arriba"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      )}
    </div>
  );
}

export default Menu;
