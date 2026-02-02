# Panel de Repartidores - DeliverySv

## 🚚 Características del Panel de Repartidores

El panel de repartidores permite:

- ✅ Ver órdenes asignadas en tiempo real
- ✅ Iniciar entrega (cambiar estado de "ready" a "in_transit")
- ✅ Actualizar ubicación GPS en tiempo real
- ✅ Marcar órdenes como entregadas
- ✅ Ver información del cliente (dirección, teléfono)
- ✅ Abrir Google Maps para navegación
- ✅ Ver detalles de pago y totales

## 👤 Credenciales de Repartidores

### Repartidor 1: Carlos Ramirez
- **Email:** carlos.driver@delivery.com
- **Password:** driver123
- **Teléfono:** 7000-0001

### Repartidor 2: Ana Martinez
- **Email:** ana.driver@delivery.com
- **Password:** driver123
- **Teléfono:** 7000-0002

### Repartidor 3: Luis Hernandez
- **Email:** luis.driver@delivery.com
- **Password:** driver123
- **Teléfono:** 7000-0003

## 🔗 Acceso

**URL:** http://localhost:5174/driver

## 📱 Flujo de Trabajo del Repartidor

### 1. Iniciar Sesión
- Ingresar con credenciales de repartidor
- El sistema redirige automáticamente a `/driver`

### 2. Ver Órdenes Asignadas
El dashboard muestra:
- **Pendientes:** Órdenes listas para recoger (status: "ready")
- **En Tránsito:** Órdenes que estás entregando actualmente
- **Entregadas Hoy:** Órdenes completadas

### 3. Iniciar Entrega
- Hacer clic en "Iniciar Entrega" en una orden con status "ready"
- El status cambia a "in_transit"
- El repartidor queda asignado a la orden

### 4. Durante la Entrega
- **Actualizar Ubicación:** Envía tu ubicación GPS actual al servidor
- **Ver en Mapa:** Abre Google Maps con la dirección del cliente
- **Llamar al Cliente:** Click en el teléfono para llamar

### 5. Completar Entrega
- Hacer clic en "Marcar como Entregado"
- El status cambia a "delivered"
- La orden desaparece de las pendientes

## 🗺️ Funcionalidad de Ubicación GPS

### Actualizar Ubicación
```javascript
// El sistema usa la API de Geolocalización del navegador
navigator.geolocation.getCurrentPosition()
```

**Permisos requeridos:**
- El navegador solicitará permiso para acceder a tu ubicación
- Debes aceptar para poder actualizar tu posición

**Cuándo actualizar:**
- Cada vez que cambies de ubicación significativamente
- Al iniciar una entrega
- Periódicamente durante la entrega

### Ver Ruta en Google Maps
- Click en "Ver en Mapa"
- Se abre Google Maps con navegación hacia el cliente
- URL: `https://www.google.com/maps/dir/?api=1&destination=LAT,LNG`

## 📊 Estados de Órdenes

| Estado | Descripción | Acciones Disponibles |
|--------|-------------|---------------------|
| `ready` | Lista para recoger | Iniciar Entrega |
| `in_transit` | En camino al cliente | Actualizar Ubicación, Marcar Entregado |
| `delivered` | Entregada exitosamente | Solo vista |

## 🔄 Actualización Automática

El dashboard se actualiza automáticamente cada **30 segundos** para mostrar nuevas órdenes asignadas.

## 💾 Base de Datos

### Tabla: orders
Columnas relacionadas con repartidores:
- `driver_id` - ID del repartidor asignado
- `driver_latitude` - Latitud actual del repartidor
- `driver_longitude` - Longitud actual del repartidor
- `last_location_update` - Timestamp de última actualización

### Tabla: users
Repartidores:
- `role = 'driver'`
- `status = 'active'`

## 🛠️ Endpoints API

### GET `/api/orders/driver-orders.php`
**Parámetros:** `driver_id`
**Retorna:** Lista de órdenes asignadas al repartidor

### POST `/api/orders/driver-update-status.php`
**Body:**
```json
{
  "order_id": 123,
  "status": "in_transit",
  "driver_id": 5
}
```

### POST `/api/orders/update-location.php`
**Body:**
```json
{
  "order_id": 123,
  "latitude": 13.6929,
  "longitude": -89.2182
}
```

## 🧪 Probar el Panel

### 1. Asignar Orden a Repartidor
```bash
php -r "
\$conn = new mysqli('localhost', 'root', 'mysql', 'deliverysv');
\$conn->query('UPDATE orders SET driver_id = 5, status = \"ready\" WHERE id = 1');
echo 'Orden asignada a Carlos Ramirez';
"
```

### 2. Iniciar Sesión
1. Ir a http://localhost:5174/login
2. Email: carlos.driver@delivery.com
3. Password: driver123

### 3. Usar el Panel
- Verás la orden asignada
- Haz click en "Iniciar Entrega"
- Actualiza tu ubicación
- Marca como entregado

## 📱 Responsive Design

El panel está optimizado para:
- ✅ Desktop
- ✅ Tablet
- ✅ Mobile (ideal para usar en el teléfono durante entregas)

## 🔐 Seguridad

- Solo usuarios con `role = 'driver'` pueden acceder
- Cada repartidor solo ve sus órdenes asignadas
- Token de autenticación requerido para todas las operaciones

## 🎨 Colores del Panel

- **Primary:** Sky (celeste) - `bg-sky-600`
- **Success:** Green - `bg-green-600`
- **Warning:** Yellow - `bg-yellow-600`
- **Info:** Blue - `bg-blue-600`

## 📞 Información de Contacto Visible

Para cada orden, el repartidor puede ver:
- Nombre del cliente
- Teléfono (con link para llamar)
- Dirección completa
- Referencia de ubicación
- Total a cobrar (si es efectivo)
- Método de pago

---

**Nota:** Para crear más repartidores, usar el mismo script SQL o agregar usuarios con `role = 'driver'` en la base de datos.
