# 🧪 CREDENCIALES DE TESTING - DeliveryOS

## URLs
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost/deliverySv/backend/api

---

## 👥 Usuarios de Prueba (Por Defecto)

### 🔑 ADMIN
```
Email: admin@deliveryos.com
Password: Admin123!@#
```
**Puede:**
- Ver dashboard con estadísticas
- Gestionar productos y categorías
- Ver todas las órdenes
- Asignar drivers
- Configurar zonas de entrega

---

### 🚚 DRIVER  
```
Email: driver@deliveryos.com
Password: Driver123!@#
```
**Puede:**
- Ver órdenes asignadas
- Actualizar estado de entregas
- Ver historial de entregas

---

### 👤 CLIENTE
```
Email: customer@deliveryos.com
Password: Customer123!@#
```
**Puede:**
- Ver menú y productos
- Agregar al carrito
- Hacer pedidos
- Ver historial de órdenes
- Rastrear pedidos

---

## 🆕 Usuario Creado por Test Automático

```
Email: test1769674465@deliveryos.com
Password: Test123!@#
Role: Customer
```

---

## 💳 Tarjetas de Prueba Stripe

Para testing de pagos (modo test):

### Exitosas
```
Número: 4242 4242 4242 4242
Expiración: 12/34 (cualquier fecha futura)
CVC: 123 (cualquier 3 dígitos)
ZIP: 12345 (cualquier 5 dígitos)
```

### Rechazada
```
Número: 4000 0000 0000 0002
```

### Requiere 3D Secure
```
Número: 4000 0025 0000 3155
```

---

## 🧪 FLUJO DE TESTING MANUAL

### 1️⃣ COMO CLIENTE

1. Ir a http://localhost:5173
2. Hacer clic en "Registrarse" (o usar customer@deliveryos.com)
3. Navegar por las categorías
4. Agregar productos al carrito
5. Ir a "Checkout"
6. Llenar dirección de entrega
7. Seleccionar método de pago (Efectivo o Stripe)
8. Confirmar orden
9. Ver orden en "Mis Órdenes"

### 2️⃣ COMO ADMIN

1. Login con admin@deliveryos.com
2. Ver dashboard con estadísticas
3. Ir a "Órdenes" → ver la orden creada
4. Cambiar estado de la orden
5. Asignar un driver
6. Ir a "Productos" → ver que las imágenes cargan (locales)
7. Ir a "Zonas" → configurar zonas de entrega

### 3️⃣ COMO DRIVER

1. Login con driver@deliveryos.com
2. Ver órdenes asignadas
3. Actualizar estado a "En camino"
4. Marcar como "Entregada"

---

## ✅ CHECKLIST DE TESTING

- [ ] Registro de usuario nuevo
- [ ] Login con cada rol
- [ ] Navegación por menú
- [ ] Agregar productos al carrito
- [ ] Incrementar/decrementar cantidad
- [ ] Remover del carrito
- [ ] Ver total calculado
- [ ] Proceso de checkout
- [ ] Pago con Stripe (test card)
- [ ] Pago en efectivo
- [ ] Ver orden creada
- [ ] Admin ve nueva orden
- [ ] Admin asigna driver
- [ ] Driver ve orden asignada
- [ ] Actualizar estado de orden
- [ ] Notificaciones (si WebSocket activo)
- [ ] Imágenes de productos cargan correctamente
- [ ] Responsive en móvil
- [ ] Sin errores en consola

---

## 🐛 ERRORES CONOCIDOS (A REVISAR)

- ⚠️ WebSocket deshabilitado temporalmente
- ⚠️ Algunos endpoints opcionales no implementados (featured.php, my-orders.php)

---

## 📝 NOTAS

- Las imágenes ahora están en `/backend/uploads/products/` (locales)
- Los emails se envían si SendGrid está configurado
- Stripe funciona en modo test
- Rate limiting activo (máx 5 intentos/min en login)

---

## 🆘 PROBLEMAS COMUNES

### No carga la página
- Verificar que Vite esté corriendo: `npm run dev` en `/frontend`
- Verificar Apache esté activo

### API devuelve 404
- Verificar que Apache tenga `mod_rewrite` habilitado
- Revisar `.htaccess` en `/backend/api/`

### No se crean órdenes
- Verificar que MySQL esté corriendo
- Revisar credenciales en `/backend/.env`
- Ver logs de PHP en `/backend/logs/`

### Imágenes no cargan
- Verificar permisos: `chmod 755 backend/uploads/products/`
- Confirmar que las rutas en BD apunten a archivos existentes

---

**Fecha**: 29 Enero 2026
**Estado**: Testing Manual en Progreso 🚧
