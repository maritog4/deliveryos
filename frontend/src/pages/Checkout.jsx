import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { orderService } from '../services/orderService';
import { authService } from '../services/authService';
import { addressService } from '../services/addressService';
import { couponService } from '../services/couponService';
import LoadingButton from '../components/LoadingButton';

function Checkout() {
  const navigate = useNavigate();
  const toast = useToast();
  const { cart, getCartTotal, clearCart } = useCart();
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedZone, setSelectedZone] = useState(null);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [saveAddress, setSaveAddress] = useState(false);
  const [cardType, setCardType] = useState(''); // Tipo de tarjeta detectado
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const user = authService.getCurrentUser();

  const [formData, setFormData] = useState({
    customer_name: user?.name || '',
    customer_phone: user?.phone || '',
    customer_email: user?.email || '',
    delivery_address: '',
    address_reference: '', // Nueva: punto de referencia
    delivery_zone_id: '',
    payment_method: 'cash',
    notes: ''
  });

  useEffect(() => {
    let isMounted = true;
    
    if (cart.length === 0) {
      navigate('/menu');
      return;
    }
    
    const fetchData = async () => {
      await loadZones();
      // DESHABILITADO: direcciones guardadas causan error
      // if (user && isMounted) {
      //   await loadSavedAddresses();
      // }
    };
    
    fetchData();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const loadZones = async () => {
    try {
      const response = await orderService.getZones();
      if (response.success) {
        setZones(response.data);
      }
    } catch (error) {
      console.error('Error loading zones:', error);
    }
  };

  const loadSavedAddresses = async () => {
    if (!user) return;
    
    const response = await addressService.getAddresses();
    if (response?.success && response?.data) {
      setSavedAddresses(response.data);
    }
  };

  const handleSelectSavedAddress = (address) => {
    setFormData({
      ...formData,
      delivery_address: address.address,
      address_reference: address.reference || '',
      delivery_zone_id: address.zone_id
    });
    handleZoneChange(address.zone_id);
  };

  // Detectar tipo de tarjeta por el número
  const detectCardType = (number) => {
    const cleaned = number.replace(/\s/g, '');
    
    if (/^4/.test(cleaned)) return 'visa';
    if (/^5[1-5]/.test(cleaned)) return 'mastercard';
    if (/^3[47]/.test(cleaned)) return 'amex';
    if (/^6(?:011|5)/.test(cleaned)) return 'discover';
    
    return '';
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Ingresa un código de cupón');
      return;
    }

    // Calcular el subtotal actual
    const currentSubtotal = getCartTotal();
    
    if (currentSubtotal <= 0) {
      setCouponError('El carrito está vacío');
      return;
    }

    setCouponLoading(true);
    setCouponError('');

    try {
      console.log('Validando cupón:', couponCode, 'con monto:', currentSubtotal);
      const response = await couponService.validate(couponCode, currentSubtotal);
      
      console.log('Respuesta del cupón:', response);
      
      if (response.success) {
        setAppliedCoupon(response.data);
        setCouponError('');
      } else {
        setCouponError(response.message || 'Cupón no válido');
        setAppliedCoupon(null);
      }
    } catch (error) {
      console.error('Error applying coupon:', error);
      setCouponError('Error al validar el cupón');
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  const handleZoneChange = (zoneId) => {
    const zone = zones.find(z => z.id == zoneId);
    setSelectedZone(zone);
    setFormData({ ...formData, delivery_zone_id: zoneId });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validación manual de campos requeridos
    if (!formData.customer_name.trim()) {
      toast.error('Por favor ingresa tu nombre completo');
      return;
    }
    if (!formData.customer_phone.trim()) {
      toast.error('Por favor ingresa tu teléfono');
      return;
    }
    if (!formData.customer_email.trim()) {
      toast.error('Por favor ingresa tu correo electrónico');
      return;
    }
    if (!formData.delivery_address.trim()) {
      toast.error('Por favor ingresa tu dirección de entrega');
      return;
    }
    if (!formData.delivery_zone_id) {
      toast.error('Por favor selecciona una zona de entrega');
      return;
    }
    if (!formData.payment_method) {
      toast.error('Por favor selecciona un método de pago');
      return;
    }
    if (cart.length === 0) {
      toast.error('Tu carrito está vacío');
      return;
    }

    setLoading(true);

    try {
      // Guardar dirección si el usuario lo solicitó (SOLO SI ESTÁ AUTENTICADO)
      if (user && saveAddress && formData.delivery_address) {
        try {
          await addressService.create({
            address: formData.delivery_address,
            reference: formData.address_reference,
            zone_id: formData.delivery_zone_id
          });
          console.log('✅ Dirección guardada correctamente');
        } catch (error) {
          console.error('⚠️ Error al guardar dirección (no crítico):', error);
          // No detenemos el proceso de orden por este error
        }
      }

      const orderData = {
        ...formData,
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          special_instructions: item.special_instructions || ''
        })),
        // Agregar información del cupón si está aplicado
        coupon_code: appliedCoupon?.code || null,
        discount: discount
      };

      console.log('Sending order data:', orderData); // Debug

      const response = await orderService.create(orderData);

      if (response.success) {
        clearCart();
        toast.success('¡Pedido realizado exitosamente!');
        navigate(`/order-success/${response.data.order_number}`);
      } else {
        toast.error(response.message || 'Error al crear la orden');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Error al procesar tu pedido: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const subtotal = getCartTotal();
  const deliveryFee = selectedZone ? parseFloat(selectedZone.delivery_fee || 0) : 0;
  const discount = appliedCoupon ? parseFloat(appliedCoupon.discount_amount || 0) : 0;
  const total = subtotal + deliveryFee - discount;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-sky-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/menu')}
              className="text-slate-600 hover:text-slate-800"
            >
              ← Volver
            </button>
            <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-sky-500/30">
              <span className="text-2xl">🛒</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Finalizar Pedido</h1>
              <p className="text-sm text-slate-500">Completa tus datos para ordenar</p>
            </div>
          </div>
        </div>
      </header>

      <main className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulario */}
          <div className="lg:col-span-2">
            {/* Mensaje informativo para usuarios sin cuenta */}
            {!user && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-start gap-3">
                <span className="text-2xl">ℹ️</span>
                <div>
                  <h4 className="font-semibold text-blue-900 mb-1">No necesitas crear una cuenta</h4>
                  <p className="text-sm text-blue-700">
                    Puedes hacer tu pedido simplemente completando el formulario. 
                    Si deseas crear una cuenta para ver tu historial de pedidos, puedes{' '}
                    <button 
                      onClick={() => navigate('/register')} 
                      className="underline font-medium hover:text-blue-900"
                    >
                      registrarte aquí
                    </button>
                    {' '}o{' '}
                    <button 
                      onClick={() => navigate('/menu')} 
                      className="underline font-medium hover:text-blue-900"
                    >
                      iniciar sesión
                    </button>.
                  </p>
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
              {/* Información Personal */}
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                  <span className="mr-2">👤</span> Información Personal
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.customer_name}
                      onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                      placeholder="Juan Pérez"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Teléfono *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.customer_phone}
                      onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                      placeholder="7777-7777"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Correo Electrónico *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.customer_email}
                    onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                    placeholder="juan@ejemplo.com"
                  />
                </div>
              </div>

              {/* Dirección de Entrega */}
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                  <span className="mr-2">📍</span> Dirección de Entrega
                </h3>
                
                {/* Direcciones guardadas (solo para usuarios logueados) */}
                {user && savedAddresses.length > 0 && (
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Mis Direcciones Guardadas
                    </label>
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          const address = savedAddresses.find(a => a.id == e.target.value);
                          if (address) handleSelectSavedAddress(address);
                        }
                      }}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all bg-sky-50"
                    >
                      <option value="">Seleccionar dirección guardada...</option>
                      {savedAddresses.map(addr => (
                        <option key={addr.id} value={addr.id}>
                          {addr.address} {addr.reference ? `(${addr.reference})` : ''}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-slate-500 mt-1">💡 O completa una nueva dirección abajo</p>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Zona de Entrega *
                    </label>
                    <select
                      required
                      value={formData.delivery_zone_id}
                      onChange={(e) => handleZoneChange(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                    >
                      <option value="">Seleccionar zona...</option>
                      {zones.map(zone => (
                        <option key={zone.id} value={zone.id}>
                          {zone.name} - ${parseFloat(zone.delivery_fee).toFixed(2)}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Dirección Completa *
                    </label>
                    <textarea
                      required
                      value={formData.delivery_address}
                      onChange={(e) => setFormData({ ...formData, delivery_address: e.target.value })}
                      rows="2"
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                      placeholder="Ej: Colonia Escalón, Calle Principal #123"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Punto de Referencia (Opcional)
                    </label>
                    <input
                      type="text"
                      value={formData.address_reference}
                      onChange={(e) => setFormData({ ...formData, address_reference: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                      placeholder="Ej: Frente a Pizza Hut, casa blanca con portón negro"
                    />
                  </div>

                  {/* Checkbox para guardar dirección (solo usuarios logueados) */}
                  {user && (
                    <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={saveAddress}
                        onChange={(e) => setSaveAddress(e.target.checked)}
                        className="w-4 h-4 text-sky-600 rounded focus:ring-sky-500"
                      />
                      <span>💾 Guardar esta dirección para próximos pedidos</span>
                    </label>
                  )}
                </div>
              </div>

              {/* Método de Pago */}
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                  <span className="mr-2">💳</span> Método de Pago
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    formData.payment_method === 'cash' 
                      ? 'border-sky-500 bg-sky-50' 
                      : 'border-slate-200 hover:border-slate-300'
                  }`}>
                    <input
                      type="radio"
                      name="payment_method"
                      value="cash"
                      checked={formData.payment_method === 'cash'}
                      onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                      className="w-5 h-5"
                    />
                    <div>
                      <div className="font-semibold text-slate-800">💵 Efectivo</div>
                      <div className="text-xs text-slate-500">Pago contra entrega</div>
                    </div>
                  </label>
                  <label className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    formData.payment_method === 'card' 
                      ? 'border-sky-500 bg-sky-50' 
                      : 'border-slate-200 hover:border-slate-300'
                  }`}>
                    <input
                      type="radio"
                      name="payment_method"
                      value="card"
                      checked={formData.payment_method === 'card'}
                      onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                      className="w-5 h-5"
                    />
                    <div>
                      <div className="font-semibold text-slate-800">💳 Tarjeta</div>
                      <div className="text-xs text-slate-500">Pago con tarjeta</div>
                    </div>
                  </label>
                </div>

                {/* Formulario de tarjeta (solo si se selecciona tarjeta) */}
                {formData.payment_method === 'card' && (
                  <div className="mt-4 p-4 bg-slate-50 rounded-xl space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Número de Tarjeta *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required={formData.payment_method === 'card'}
                          maxLength="19"
                          placeholder="1234 5678 9012 3456"
                          className="w-full px-4 py-3 pr-32 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                          onChange={(e) => {
                            // Formatear número de tarjeta con espacios cada 4 dígitos
                            let value = e.target.value.replace(/\s/g, '');
                            let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
                            e.target.value = formattedValue;
                            
                            // Detectar tipo de tarjeta automáticamente
                            const detected = detectCardType(value);
                            setCardType(detected); // Siempre actualizar, incluso si es vacío
                          }}
                        />
                        {/* Logo de tarjeta detectada */}
                        {cardType && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            {cardType === 'visa' && (
                              <img 
                                src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg" 
                                alt="Visa" 
                                className="h-8 w-auto"
                              />
                            )}
                            {cardType === 'mastercard' && (
                              <img 
                                src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" 
                                alt="Mastercard" 
                                className="h-8 w-auto"
                              />
                            )}
                            {cardType === 'amex' && (
                              <img 
                                src="https://upload.wikimedia.org/wikipedia/commons/f/fa/American_Express_logo_%282018%29.svg" 
                                alt="American Express" 
                                className="h-8 w-auto"
                              />
                            )}
                            {cardType === 'discover' && (
                              <img 
                                src="https://upload.wikimedia.org/wikipedia/commons/5/57/Discover_Card_logo.svg" 
                                alt="Discover" 
                                className="h-8 w-auto"
                              />
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Fecha de Vencimiento *
                        </label>
                        <input
                          type="text"
                          required={formData.payment_method === 'card'}
                          placeholder="MM/AA"
                          maxLength="5"
                          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                          onChange={(e) => {
                            let value = e.target.value.replace(/\D/g, '');
                            if (value.length >= 2) {
                              value = value.slice(0, 2) + '/' + value.slice(2, 4);
                            }
                            e.target.value = value;
                          }}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          CVV *
                        </label>
                        <input
                          type="text"
                          required={formData.payment_method === 'card'}
                          placeholder="123"
                          maxLength="4"
                          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                          onChange={(e) => {
                            e.target.value = e.target.value.replace(/\D/g, '');
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Nombre del Titular *
                      </label>
                      <input
                        type="text"
                        required={formData.payment_method === 'card'}
                        placeholder="NOMBRE APELLIDO"
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all uppercase"
                      />
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
                      🔒 Tu información de pago está segura y encriptada
                    </div>
                  </div>
                )}
              </div>

              {/* Notas */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Notas Adicionales
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows="2"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                  placeholder="Instrucciones especiales para tu pedido..."
                />
              </div>

              <LoadingButton
                type="submit"
                loading={loading}
                loadingText="Procesando pedido..."
                className="w-full bg-gradient-to-br from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-sky-500/30 transition-all duration-200 transform hover:scale-[1.02]"
              >
                🚀 Confirmar Pedido
              </LoadingButton>
            </form>
          </div>

          {/* Resumen */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-4">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Resumen del Pedido</h3>
              
              <div className="space-y-3 mb-4">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-slate-600">
                      {item.quantity}x {item.name}
                    </span>
                    <span className="font-semibold text-slate-800">
                      ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-200 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="font-semibold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Envío</span>
                  <span className="font-semibold">
                    {selectedZone ? `$${deliveryFee.toFixed(2)}` : '-'}
                  </span>
                </div>
                
                {/* Mostrar descuento si hay cupón aplicado */}
                {appliedCoupon && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Descuento ({appliedCoupon.code})</span>
                    <span className="font-semibold">-${discount.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-lg font-bold text-sky-600 pt-2 border-t border-slate-200">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Sección de Cupón - SOLO para usuarios normales (no admin) */}
              {(!user || user.role !== 'admin') && (
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <h4 className="text-sm font-bold text-slate-800 mb-3">¿Tienes un cupón?</h4>
                  
                  {!appliedCoupon ? (
                    <div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => {
                            setCouponCode(e.target.value.toUpperCase());
                            setCouponError('');
                          }}
                          placeholder="Código del cupón"
                          className="flex-1 px-4 py-2 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 uppercase"
                          disabled={couponLoading}
                        />
                        <button
                          onClick={handleApplyCoupon}
                          disabled={couponLoading || !couponCode.trim()}
                          className="px-4 py-2 bg-gradient-to-br from-sky-500 to-sky-600 text-white rounded-xl font-semibold hover:from-sky-600 hover:to-sky-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-sky-500/20"
                        >
                          {couponLoading ? 'Validando...' : 'Aplicar'}
                        </button>
                      </div>
                      
                      {couponError && (
                        <p className="text-xs text-red-600 mt-2">{couponError}</p>
                      )}
                      
                      <p className="text-xs text-slate-500 mt-2">
                        💡 Tip: Prueba con <span className="font-semibold">BIENVENIDO10</span>
                      </p>
                    </div>
                  ) : (
                    <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-bold text-green-800">
                            ✓ {appliedCoupon.code}
                          </p>
                          <p className="text-xs text-green-600 mt-1">
                            {appliedCoupon.description}
                          </p>
                          <p className="text-sm font-bold text-green-700 mt-2">
                            Ahorro: ${discount.toFixed(2)}
                          </p>
                        </div>
                        <button
                          onClick={handleRemoveCoupon}
                          className="text-red-600 hover:text-red-800 text-sm font-semibold"
                        >
                          Quitar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Checkout;
