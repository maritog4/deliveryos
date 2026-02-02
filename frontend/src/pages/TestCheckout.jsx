import { useState } from 'react';
import { orderService } from '../services/orderService';
import { useToast } from '../context/ToastContext';

export default function TestCheckout() {
  const toast = useToast();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testOrder = async () => {
    setLoading(true);
    setResult(null);

    const testData = {
      customer_name: "Test User",
      customer_phone: "7777-7777",
      customer_email: "test@example.com",
      delivery_address: "Test Address 123, San Salvador",
      address_reference: "Cerca del parque",
      delivery_zone_id: "1",
      payment_method: "cash",
      notes: "Orden de prueba",
      items: [
        {
          id: 1,
          name: "Pizza Margherita",
          price: 8.99,
          quantity: 2,
          special_instructions: "Extra queso"
        }
      ],
      coupon_code: null,
      discount: 0
    };

    console.log('📤 Enviando datos de prueba:', testData);

    try {
      const response = await orderService.create(testData);
      console.log('✅ Respuesta exitosa:', response);
      setResult({ success: true, data: response });
      toast.success('¡Orden de prueba creada exitosamente!');
    } catch (error) {
      console.error('❌ Error completo:', error);
      console.error('Response data:', error.response?.data);
      console.error('Response status:', error.response?.status);
      console.error('Response headers:', error.response?.headers);
      
      setResult({ 
        success: false, 
        error: error.message,
        details: error.response?.data || 'Sin detalles',
        status: error.response?.status || 'Sin status'
      });
      toast.error('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-800 mb-6">🔧 Test de Checkout</h1>
        
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-slate-700 mb-4">Información del Sistema</h2>
          <div className="space-y-2 text-sm">
            <p><strong>API URL:</strong> {import.meta.env.VITE_API_URL || 'http://localhost/deliverySv/backend/api'}</p>
            <p><strong>Token presente:</strong> {localStorage.getItem('token') ? '✅ Sí' : '❌ No'}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <button
            onClick={testOrder}
            disabled={loading}
            className="w-full bg-sky-500 text-white px-6 py-4 rounded-lg font-semibold text-lg hover:bg-sky-600 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
          >
            {loading ? '⏳ Probando...' : '🚀 Probar Crear Orden'}
          </button>
        </div>

        {result && (
          <div className={`rounded-xl shadow-lg p-6 ${result.success ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'}`}>
            <h2 className={`text-xl font-semibold mb-4 ${result.success ? 'text-green-700' : 'text-red-700'}`}>
              {result.success ? '✅ Éxito' : '❌ Error'}
            </h2>
            <pre className="bg-white p-4 rounded-lg overflow-auto text-xs">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-6 bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
          <h3 className="font-semibold text-yellow-800 mb-2">💡 Instrucciones</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm text-yellow-700">
            <li>Abre la Consola del Navegador (F12)</li>
            <li>Haz clic en "Probar Crear Orden"</li>
            <li>Revisa los logs en la consola (📤, ✅ o ❌)</li>
            <li>Si hay error, copia el mensaje completo</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
