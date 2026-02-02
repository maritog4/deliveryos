import { useState } from 'react';
import axios from 'axios';

export default function TestConnection() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testSimpleFetch = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost/deliverySv/backend/api/orders/create.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_name: "Test Fetch Simple",
          customer_phone: "1234",
          customer_email: "test@test.com",
          delivery_address: "Test",
          delivery_zone_id: 1,
          payment_method: "cash",
          notes: "",
          items: [{id: 1, name: "Pizza", price: 10.50, quantity: 1, special_instructions: ""}]
        })
      });
      const data = await response.json();
      setResult('✅ FETCH SIMPLE FUNCIONA:\n' + JSON.stringify(data, null, 2));
    } catch (error) {
      setResult('❌ FETCH SIMPLE FALLÓ:\n' + error.message);
    }
    setLoading(false);
  };

  const testAxiosDirecto = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost/deliverySv/backend/api/orders/create.php', {
        customer_name: "Test Axios Directo",
        customer_phone: "1234",
        customer_email: "test@test.com",
        delivery_address: "Test",
        delivery_zone_id: 1,
        payment_method: "cash",
        notes: "",
        items: [{id: 1, name: "Pizza", price: 10.50, quantity: 1, special_instructions: ""}]
      }, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      setResult('✅ AXIOS DIRECTO FUNCIONA:\n' + JSON.stringify(response.data, null, 2));
    } catch (error) {
      setResult('❌ AXIOS DIRECTO FALLÓ:\n' + error.message + '\n' + JSON.stringify(error.response?.data || {}, null, 2));
    }
    setLoading(false);
  };

  const testConApi = async () => {
    setLoading(true);
    try {
      const api = await import('../services/api');
      const testData = {
        customer_name: "Test Con API Service",
        customer_phone: "1234",
        customer_email: "test@test.com",
        delivery_address: "Test",
        delivery_zone_id: 1,
        payment_method: "cash",
        notes: "",
        coupon_code: null,
        discount: 0,
        items: [{id: 1, name: "Pizza", price: 10.50, quantity: 1, special_instructions: ""}]
      };
      console.log('🔍 Enviando con api.js:', testData);
      console.log('🔍 BaseURL:', api.default.defaults.baseURL);
      const response = await api.default.post('/orders/create.php', testData);
      setResult('✅ API SERVICE FUNCIONA:\n' + JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.error('❌ Error completo:', error);
      console.error('❌ Response:', error.response);
      setResult(`❌ API SERVICE FALLÓ:
Error: ${error.message}
Status: ${error.response?.status}
Data: ${JSON.stringify(error.response?.data || {}, null, 2)}
Config URL: ${error.config?.url}
Base URL: ${error.config?.baseURL}`);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6">🧪 Test de Conexión Backend</h1>
        
        <div className="space-y-4 mb-6">
          <button
            onClick={testSimpleFetch}
            disabled={loading}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            1️⃣ Test con fetch() simple (sin interceptores)
          </button>

          <button
            onClick={testAxiosDirecto}
            disabled={loading}
            className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
          >
            2️⃣ Test con axios directo (sin api.js)
          </button>

          <button
            onClick={testConApi}
            disabled={loading}
            className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 disabled:bg-gray-400"
          >
            3️⃣ Test con api.js (con interceptores)
          </button>
        </div>

        {loading && (
          <div className="text-center text-gray-600 mb-4">
            ⏳ Probando...
          </div>
        )}

        {result && (
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto max-h-96">
            <pre className="text-sm">{result}</pre>
          </div>
        )}

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-bold mb-2">📋 Instrucciones:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Prueba cada botón en orden</li>
            <li>Anota cuál funciona y cuál falla</li>
            <li>Abre DevTools (F12) → Network para ver las peticiones</li>
            <li>Si uno funciona y otro no, sabremos exactamente dónde está el problema</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
