import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix para los iconos de Leaflet en Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Iconos personalizados mejorados
const createCustomIcon = (color, emoji) => {
  const iconHtml = `
    <div style="
      background: ${color};
      width: 40px;
      height: 40px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 3px solid white;
      box-shadow: 0 3px 10px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        transform: rotate(45deg);
        font-size: 20px;
      ">${emoji}</div>
    </div>
  `;
  
  return L.divIcon({
    html: iconHtml,
    className: 'custom-marker',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
  });
};

const driverIcon = createCustomIcon('linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)', '🚗');
const customerIcon = createCustomIcon('linear-gradient(135deg, #10b981 0%, #059669 100%)', '🏠');
const restaurantIcon = createCustomIcon('linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', '🍽️');

// Componente para centrar el mapa
function MapCenterControl({ center }) {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, 14);
    }
  }, [center, map]);
  
  return null;
}

// Componente para ajustar bounds
function MapBounds({ positions }) {
  const map = useMap();
  
  useEffect(() => {
    if (positions && positions.length > 1) {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [positions, map]);
  
  return null;
}

function OrderTrackingMap({ order }) {
  const [driverLocation, setDriverLocation] = useState(null);
  const [updateTime, setUpdateTime] = useState(null);

  // Ubicación del restaurante (puedes configurar esto desde la base de datos)
  const restaurantLocation = [13.6929, -89.2182]; // San Salvador - Ejemplo

  // Ubicación del cliente
  const customerLocation = order.delivery_latitude && order.delivery_longitude
    ? [parseFloat(order.delivery_latitude), parseFloat(order.delivery_longitude)]
    : null;

  // Ubicación del repartidor
  useEffect(() => {
    if (order.driver_latitude && order.driver_longitude) {
      setDriverLocation([
        parseFloat(order.driver_latitude),
        parseFloat(order.driver_longitude)
      ]);
      setUpdateTime(order.last_location_update);
    }

    // Actualizar ubicación cada 10 segundos si está en tránsito
    if (order.status === 'on_the_way') {
      const interval = setInterval(async () => {
        try {
          const response = await fetch(
            `${import.meta.env.VITE_API_URL || 'http://localhost/deliverySv/backend'}/api/orders/details.php?id=${order.id}`
          );
          const data = await response.json();
          
          if (data.success && data.order.driver_latitude && data.order.driver_longitude) {
            setDriverLocation([
              parseFloat(data.order.driver_latitude),
              parseFloat(data.order.driver_longitude)
            ]);
            setUpdateTime(data.order.last_location_update);
          }
        } catch (error) {
          console.error('Error actualizando ubicación:', error);
        }
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [order]);

  // Determinar centro del mapa y posiciones
  const positions = [];
  let center = restaurantLocation;

  if (customerLocation) {
    positions.push(customerLocation);
    center = customerLocation;
  }

  if (driverLocation && (order.status === 'on_the_way' || order.status === 'picked_up')) {
    positions.push(driverLocation);
    center = driverLocation;
  }

  // Ruta del delivery
  const deliveryRoute = [];
  if (order.status === 'on_the_way' && driverLocation && customerLocation) {
    deliveryRoute.push(driverLocation, customerLocation);
  }

  // Calcular distancia estimada
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(2);
  };

  const distanceToCustomer = driverLocation && customerLocation
    ? calculateDistance(
        driverLocation[0], driverLocation[1],
        customerLocation[0], customerLocation[1]
      )
    : null;

  return (
    <div className="space-y-4">
      {/* Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-sky-50 to-cyan-50 rounded-xl p-4 border-2 border-sky-200">
          <div className="text-2xl mb-1">🚗</div>
          <div className="text-xs text-slate-600">Repartidor</div>
          <div className="font-bold text-sky-700">{order.driver_name || 'Asignando...'}</div>
        </div>
        
        {distanceToCustomer && (
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-4 border-2 border-emerald-200">
            <div className="text-2xl mb-1">📍</div>
            <div className="text-xs text-slate-600">Distancia</div>
            <div className="font-bold text-emerald-700">{distanceToCustomer} km</div>
          </div>
        )}
        
        {updateTime && (
          <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-4 border-2 border-violet-200">
            <div className="text-2xl mb-1">⏰</div>
            <div className="text-xs text-slate-600">Última actualización</div>
            <div className="font-bold text-violet-700 text-xs">
              {new Date(updateTime).toLocaleTimeString('es-SV', { 
                hour: '2-digit', 
                minute: '2-digit'
              })}
            </div>
          </div>
        )}

        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-4 border-2 border-amber-200">
          <div className="text-2xl mb-1">
            {order.status === 'on_the_way' ? '🚚' : order.status === 'ready' ? '✨' : '👨‍🍳'}
          </div>
          <div className="text-xs text-slate-600">Estado</div>
          <div className="font-bold text-amber-700 text-xs">
            {order.status === 'on_the_way' ? 'En camino' : 
             order.status === 'ready' ? 'Listo para entregar' : 
             order.status === 'preparing' ? 'Preparando' : 'En proceso'}
          </div>
        </div>
      </div>

      {/* Mapa */}
      <div className="rounded-2xl overflow-hidden shadow-lg border-4 border-white" style={{ height: '400px' }}>
        <MapContainer
          center={center}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {positions.length > 1 && <MapBounds positions={positions} />}
          {positions.length === 1 && <MapCenterControl center={center} />}

          {/* Marcador del restaurante */}
          <Marker position={restaurantLocation} icon={restaurantIcon}>
            <Popup>
              <div className="text-center">
                <div className="text-2xl mb-1">🍽️</div>
                <div className="font-bold text-slate-800">Restaurante</div>
                <div className="text-xs text-slate-600">Punto de partida</div>
              </div>
            </Popup>
          </Marker>

          {/* Marcador del repartidor */}
          {driverLocation && (
            <Marker position={driverLocation} icon={driverIcon}>
              <Popup>
                <div className="text-center">
                  <div className="text-2xl mb-1">🚗</div>
                  <div className="font-bold text-sky-700">{order.driver_name}</div>
                  <div className="text-xs text-slate-600">Repartidor</div>
                  {distanceToCustomer && (
                    <div className="text-xs text-emerald-600 font-semibold mt-1">
                      📍 {distanceToCustomer} km de ti
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          )}

          {/* Marcador del cliente */}
          {customerLocation && (
            <Marker position={customerLocation} icon={customerIcon}>
              <Popup>
                <div className="text-center">
                  <div className="text-2xl mb-1">🏠</div>
                  <div className="font-bold text-emerald-700">Tu ubicación</div>
                  <div className="text-xs text-slate-600">{order.delivery_address}</div>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Línea de ruta */}
          {deliveryRoute.length === 2 && (
            <Polyline
              positions={deliveryRoute}
              color="#0ea5e9"
              weight={4}
              opacity={0.7}
              dashArray="10, 10"
            />
          )}
        </MapContainer>
      </div>

      {/* Legend */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 border-2 border-slate-200">
        <div className="flex flex-wrap gap-4 justify-center text-xs">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white">
              🍽️
            </div>
            <span className="font-medium text-slate-700">Restaurante</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-sky-500 to-sky-600 flex items-center justify-center text-white">
              🚗
            </div>
            <span className="font-medium text-slate-700">Repartidor</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white">
              🏠
            </div>
            <span className="font-medium text-slate-700">Tu ubicación</span>
          </div>
        </div>
      </div>

      {/* Auto-refresh notice */}
      {order.status === 'on_the_way' && (
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-sky-100 text-sky-700 px-4 py-2 rounded-full text-xs font-semibold">
            <span className="animate-pulse">🔄</span>
            Actualizando ubicación cada 10 segundos
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderTrackingMap;
