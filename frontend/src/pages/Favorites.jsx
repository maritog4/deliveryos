import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

function Favorites() {
  const navigate = useNavigate();

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user) {
      navigate('/login');
    } else {
      // Redirigir al menú después de 1 segundo
      const timer = setTimeout(() => {
        navigate('/menu');
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-cyan-50 flex items-center justify-center">
      <div className="text-center p-8">
        <div className="text-6xl mb-4">❤️</div>
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Sistema de Favoritos</h2>
        <p className="text-slate-600 mb-4">Temporalmente en mantenimiento...</p>
        <p className="text-sm text-slate-500">Redirigiendo al menú...</p>
      </div>
    </div>
  );
}

export default Favorites;
