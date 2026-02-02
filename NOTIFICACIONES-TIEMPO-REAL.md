# 🔔 Sistema de Notificaciones en Tiempo Real

## 📋 Resumen

Sistema de notificaciones push implementado con WebSocket (Socket.IO) que permite:

- **Nueva orden** → Notifica a todos los admins
- **Orden asignada** → Notifica al repartidor específico
- **Estado cambiado** → Notifica al cliente específico

---

## 🚀 Inicio Rápido

### 1. Iniciar el servidor WebSocket

```bash
cd /Applications/AMPPS/www/deliverySv/backend
npm start
```

El servidor corre en: `http://localhost:3001`

### 2. El frontend se conecta automáticamente

El `NotificationProvider` en `App.jsx` conecta automáticamente cuando el usuario hace login.

---

## 📡 Uso en Backend PHP

### En `api/orders/create.php` (Después de crear orden):

```php
// Al final del archivo, después de crear la orden
require_once '../utils/NotificationHelper.php';

NotificationHelper::notifyNewOrder([
    'id' => $orderId,
    'order_number' => $orderNumber,
    'customer_name' => $customer_name,
    'customer_email' => $customer_email,
    'total' => $total,
    'payment_method' => $payment_method,
    'delivery_address' => $delivery_address
]);
```

### En `api/orders/assign-driver.php` (Cuando se asigna repartidor):

```php
require_once '../utils/NotificationHelper.php';

NotificationHelper::notifyOrderAssigned(
    $orderId,          // ID de la orden
    $orderNumber,      // Número de orden
    $driverId,         // ID del repartidor
    $customerName      // Nombre del cliente
);
```

### En `api/orders/update-status.php` (Cuando cambia el estado):

```php
require_once '../utils/NotificationHelper.php';

NotificationHelper::notifyOrderStatusChanged(
    $orderId,          // ID de la orden
    $orderNumber,      // Número de orden
    $newStatus,        // Nuevo estado
    $customerId        // ID del cliente
);
```

---

## 🎨 Componente de Notificaciones

El componente `NotificationBell` se puede agregar a cualquier header:

```jsx
import NotificationBell from '../components/NotificationBell';

function Header() {
  return (
    <header>
      <nav>
        {/* ... otros elementos ... */}
        <NotificationBell />
      </nav>
    </header>
  );
}
```

---

## 📱 Eventos del Frontend

### Escuchar notificaciones manualmente:

```jsx
import { useNotifications } from '../context/NotificationContext';

function MyComponent() {
  const { notifications, unreadCount, isConnected } = useNotifications();
  
  return (
    <div>
      <p>Notificaciones: {unreadCount}</p>
      <p>Estado: {isConnected ? 'Conectado' : 'Desconectado'}</p>
    </div>
  );
}
```

### Emitir eventos desde el frontend:

```jsx
const { notifyNewOrder, notifyOrderAssigned } = useNotifications();

// Después de crear orden
notifyNewOrder(orderData);

// Después de asignar repartidor
notifyOrderAssigned({ orderId, driverId, orderNumber, customerName });
```

---

## 🔧 Configuración

### Variables de entorno (opcional):

```bash
# En backend/.env
WS_PORT=3001
```

### Cambiar URL del WebSocket:

En `frontend/src/context/NotificationContext.jsx` línea 49:
```jsx
socketRef.current = io('http://localhost:3001', {
  // cambiar por tu dominio en producción
});
```

---

## ✅ Checklist de Integración

- [x] Servidor WebSocket instalado y corriendo
- [x] Frontend conecta automáticamente al login
- [x] Componente NotificationBell creado
- [ ] Agregar NotificationBell al header de admin
- [ ] Agregar NotificationBell al header de driver
- [ ] Agregar NotificationBell al header de cliente
- [ ] Integrar en create.php (nueva orden)
- [ ] Integrar en assign-driver.php (asignación)
- [ ] Integrar en update-status.php (cambio estado)

---

## 🧪 Probar las Notificaciones

### 1. Iniciar servidor WebSocket:
```bash
cd /Applications/AMPPS/www/deliverySv/backend
npm start
```

### 2. Abrir 3 pestañas del navegador:

**Pestaña 1 - Admin:**
```
http://localhost:5173/login
Login: mariorene6@msn.com
```

**Pestaña 2 - Repartidor:**
```
http://localhost:5173/admin-login
Login: carlos.driver@delivery.com
```

**Pestaña 3 - Cliente:**
```
http://localhost:5173/menu
(Hacer orden como invitado)
```

### 3. Flujo de prueba:

1. **Cliente crea orden** → Admin recibe notificación 🔔
2. **Admin asigna orden a Carlos** → Carlos recibe notificación 🔔
3. **Carlos cambia estado a "preparing"** → Cliente recibe notificación 🔔

---

## 📊 Monitorear Conexiones

```bash
# Ver estado del servidor
curl http://localhost:3001/health

# Respuesta:
{
  "status": "ok",
  "connections": {
    "admins": 1,
    "drivers": 2,
    "customers": 5
  }
}
```

---

## 🐛 Troubleshooting

### El servidor WebSocket no inicia:
```bash
# Verificar que el puerto 3001 esté libre
lsof -ti:3001 | xargs kill -9
npm start
```

### Las notificaciones no llegan:
1. Verificar que el servidor WebSocket esté corriendo
2. Abrir consola del navegador (F12) y buscar: `✅ Conectado a WebSocket`
3. Verificar que el usuario haya hecho login

### No se reproduce el sonido:
- Los navegadores bloquean audio automático
- El usuario debe interactuar con la página primero (hacer clic)

---

## 🚀 Producción

Para producción, usar PM2 para mantener el servidor corriendo:

```bash
npm install -g pm2

# Iniciar con PM2
cd /Applications/AMPPS/www/deliverySv/backend
pm2 start websocket-server.js --name "websocket"

# Ver logs
pm2 logs websocket

# Reiniciar
pm2 restart websocket
```

---

## 📝 Próximos Pasos

1. ✅ Agregar NotificationBell a todos los headers
2. ✅ Integrar en los 3 endpoints principales
3. ✅ Probar flujo completo
4. ⏳ Configurar para producción con dominio real
5. ⏳ Agregar persistencia de notificaciones en DB

---

**¡Sistema de notificaciones listo para usar! 🎉**
