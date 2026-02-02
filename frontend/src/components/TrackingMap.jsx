import { useEffect, useRef } from 'react';
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

// Iconos personalizados
const restaurantIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const driverIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const customerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Componente para ajustar el zoom automáticamente
function MapBounds({ positions }) {
  const map = useMap();
  
  useEffect(() => {
    if (positions && positions.length > 0) {
      const validPositions = positions.filter(pos => pos && pos.lat && pos.lng);
      if (validPositions.length > 0) {
        const bounds = L.latLngBounds(validPositions.map(pos => [pos.lat, pos.lng]));
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [positions, map]);

  return null;
}

function TrackingMap({ order, driverLocation }) {
  const mapRef = useRef(null);

  // Coordenadas del restaurante (puedes configurarlas según tu ubicación)
  const restaurantLocation = {
    lat: 13.6929, // San Salvador, El Salvador (ejemplo)
    lng: -89.2182,
    name: 'Restaurante DeliverySV'
  };

  // Coordenadas del cliente (de la orden)
  const customerLocation = order.delivery_latitude && order.delivery_longitude ? {
    lat: parseFloat(order.delivery_latitude),
    lng: parseFloat(order.delivery_longitude),
    name: order.customer_name,
    address: order.delivery_address
  } : null;

  // Coordenadas del repartidor (simuladas o reales)
  const driverPos = driverLocation || (order.driver_latitude && order.driver_longitude ? {
    lat: parseFloat(order.driver_latitude),
    lng: parseFloat(order.driver_longitude),
    name: order.driver_name || 'Repartidor'
  } : null);

  // Centro del mapa (restaurante por defecto)
  const center = restaurantLocation;

  // Posiciones para el ajuste de bounds
  const positions = [
    restaurantLocation,
    customerLocation,
    driverPos
  ].filter(Boolean);

  // Calcular distancia aproximada
  const calculateDistance = (pos1, pos2) => {
    if (!pos1 || !pos2) return null;
    const R = 6371; // Radio de la Tierra en km
    const dLat = (pos2.lat - pos1.lat) * Math.PI / 180;
    const dLon = (pos2.lng - pos1.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(pos1.lat * Math.PI / 180) * Math.cos(pos2.lat * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(2);
  };

  const distance = driverPos && customerLocation 
    ? calculateDistance(driverPos, customerLocation)
    : null;

  // Ruta (línea entre puntos)
  const routePositions = [];
  if (driverPos && customerLocation) {
    routePositions.push([driverPos.lat, driverPos.lng], [customerLocation.lat, customerLocation.lng]);
  }

  return (
    <div className="space-y-4">
      {/* Información de distancia */}
      {distance && (
        <div className="bg-gradient-to-r from-sky-50 to-cyan-50 border-2 border-sky-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-cyan-600 rounded-full flex items-center justify-center text-white text-xl">
                🚗
              </div>
              <div>
                <p className="text-sm text-sky-600 font-medium">Distancia aproximada</p>
                <p className="text-2xl font-bold text-sky-700">{distance} km</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-sky-600">Tiempo estimado</p>
              <p className="text-xl font-bold text-sky-700">{Math.ceil(distance * 3)} min</p>
            </div>
          </div>
        </div>
      )}

      {/* Mapa */}
      <div className="rounded-xl overflow-hidden shadow-lg border-2 border-sky-200" style={{ height: '400px' }}>
        <MapContainer 
          center={[center.lat, center.lng]} 
          zoom={13} 
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          <MapBounds positions={positions} />

          {/* Marcador del Restaurante */}
          <Marker position={[restaurantLocation.lat, restaurantLocation.lng]} icon={restaurantIcon}>
            <Popup>
              <div className="text-center">
                <p className="font-bold text-red-600">🏪 {restaurantLocation.name}</p>
                <p className="text-xs text-slate-600">Punto de origen</p>
              </div>
            </Popup>
          </Marker>

          {/* Marcador del Cliente */}
          {customerLocation && (
            <Marker position={[customerLocation.lat, customerLocation.lng]} icon={customerIcon}>
              <Popup>
                <div className="text-center">
                  <p className="font-bold text-green-600">📍 {customerLocation.name}</p>
                  <p className="text-xs text-slate-600">{customerLocation.address}</p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Marcador del Repartidor */}
          {driverPos && (
            <Marker position={[driverPos.lat, driverPos.lng]} icon={driverIcon}>
              <Popup>
                <div className="text-center">
                  <p className="font-bold text-blue-600">🚗 {driverPos.name}</p>
                  <p className="text-xs text-slate-600">En camino...</p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Línea de ruta */}
          {routePositions.length > 0 && (
            <Polyline 
              positions={routePositions} 
              color="#0284c7" 
              weight={3}
              dashArray="10, 10"
              opacity={0.7}
            />
          )}
        </MapContainer>
      </div>

      {/* Leyenda */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
          <div className="text-2xl mb-1">🏪</div>
          <p className="text-xs font-semibold text-red-700">Restaurante</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
          <div className="text-2xl mb-1">🚗</div>
          <p className="text-xs font-semibold text-blue-700">Repartidor</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
          <div className="text-2xl mb-1">📍</div>
          <p className="text-xs font-semibold text-green-700">Tu ubicación</p>
        </div>
      </div>
    </div>
  );
}

export default TrackingMap;
