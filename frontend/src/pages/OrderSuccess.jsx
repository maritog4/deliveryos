import { useParams, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

function OrderSuccess() {
  const { orderNumber } = useParams();
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-sky-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl shadow-sky-500/20 p-8 text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30 animate-bounce">
          <span className="text-4xl">✅</span>
        </div>
        
        <h1 className="text-3xl font-bold text-slate-800 mb-3">¡Pedido Confirmado!</h1>
        <p className="text-slate-600 mb-6">
          Tu pedido ha sido recibido y está siendo procesado.
        </p>

        <div className="bg-gradient-to-br from-sky-50 to-cyan-50 rounded-2xl p-6 mb-6 border-2 border-sky-200">
          <p className="text-sm text-slate-600 mb-2">Número de orden:</p>
          <p className="text-3xl font-bold text-sky-600">{orderNumber}</p>
        </div>

        <p className="text-sm text-slate-500 mb-6">
          Recibirás una notificación cuando tu pedido esté en camino.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate('/menu')}
            className="w-full bg-gradient-to-br from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-sky-500/30 transition-all duration-200 transform hover:scale-[1.02]"
          >
            🍕 Seguir Comprando
          </button>
          {user && (
            <button
              onClick={() => navigate('/my-orders')}
              className="w-full bg-gradient-to-br from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-cyan-500/30 transition-all duration-200 transform hover:scale-[1.02]"
            >
              📦 Ver Mis Pedidos
            </button>
          )}
          <button
            onClick={() => navigate('/')}
            className="w-full bg-white border-2 border-slate-200 text-slate-700 font-semibold py-3 px-6 rounded-xl hover:bg-slate-50 transition-all"
          >
            🏠 Volver al Inicio
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrderSuccess;
