# 🧪 TESTING CHECKLIST - DeliverySv

## ✅ COMPLETADO
- [x] Imágenes locales implementadas
- [x] Base de datos actualizada con rutas locales

---

## 🔐 AUTENTICACIÓN Y USUARIOS

### Registro
- [ ] Registrar nuevo cliente
- [ ] Validar que email sea único
- [ ] Validar campos requeridos
- [ ] Verificar que se crea JWT token
- [ ] Verificar que se guarda en localStorage

### Login
- [ ] Login con credenciales correctas
- [ ] Login con credenciales incorrectas (debe fallar)
- [ ] Verificar que se genera JWT
- [ ] Verificar que redirecciona según rol (admin→dashboard, cliente→menu, driver→orders)

### Roles
- [ ] Cliente puede ver menú y hacer pedidos
- [ ] Admin puede ver dashboard y gestionar todo
- [ ] Driver puede ver sus entregas asignadas

---

## 🍕 MENÚ Y PRODUCTOS

### Visualización
- [ ] Ver todas las categorías
- [ ] Ver productos por categoría
- [ ] Productos destacados se muestran primero
- [ ] Imágenes locales cargan correctamente
- [ ] Precios se muestran correctamente
- [ ] Productos no disponibles están marcados

### Carrito
- [ ] Agregar producto al carrito
- [ ] Incrementar cantidad
- [ ] Decrementar cantidad
- [ ] Eliminar producto del carrito
- [ ] Ver total calculado correctamente
- [ ] Carrito persiste en localStorage
- [ ] Carrito se vacía después de orden exitosa

---

## 📍 DIRECCIONES Y ZONAS

### Zonas de Entrega
- [ ] Ver mapa con zonas disponibles
- [ ] Calcular costo de envío según zona
- [ ] Validar que dirección esté en zona disponible

### Direcciones Guardadas (si está implementado)
- [ ] Guardar dirección nueva
- [ ] Ver direcciones guardadas
- [ ] Seleccionar dirección guardada
- [ ] Marcar dirección como predeterminada

---

## 💳 CHECKOUT Y PAGOS

### Proceso de Checkout
- [ ] Ver resumen de orden
- [ ] Ingresar dirección de entrega
- [ ] Seleccionar método de pago
- [ ] Ver total con impuestos y envío

### Stripe Integration
- [ ] Crear Payment Intent
- [ ] Procesar pago con tarjeta de prueba (4242 4242 4242 4242)
- [ ] Ver confirmación de pago exitoso
- [ ] Ver orden creada en dashboard

### Pago en Efectivo
- [ ] Seleccionar "Pago en efectivo"
- [ ] Crear orden sin Stripe
- [ ] Estado inicial: "pending"

---

## 📦 GESTIÓN DE ÓRDENES

### Cliente
- [ ] Ver mis órdenes
- [ ] Ver detalles de orden individual
- [ ] Ver estado de orden en tiempo real
- [ ] Recibir actualizaciones de estado

### Admin
- [ ] Ver todas las órdenes
- [ ] Filtrar por estado (pending, preparing, ready, delivering, delivered)
- [ ] Ver detalles de orden
- [ ] Asignar driver a orden
- [ ] Cambiar estado de orden
- [ ] Ver estadísticas del dashboard

### Driver
- [ ] Ver órdenes asignadas
- [ ] Ver detalles de entrega (dirección, teléfono)
- [ ] Actualizar estado a "en camino"
- [ ] Marcar como entregada
- [ ] Ver mapa con ubicación

---

## 🚚 SISTEMA DE REPARTIDORES

### Gestión de Drivers
- [ ] Admin puede ver lista de drivers
- [ ] Admin puede crear nuevo driver
- [ ] Admin puede activar/desactivar driver
- [ ] Ver órdenes asignadas a cada driver

### Asignación de Órdenes
- [ ] Asignar orden a driver disponible
- [ ] Driver recibe notificación
- [ ] Driver puede ver detalles de entrega

---

## 📧 EMAILS TRANSACCIONALES

### SendGrid Integration
- [ ] Email de confirmación de orden (cliente)
- [ ] Email de nueva orden (admin)
- [ ] Email de orden asignada (driver)
- [ ] Email de cambio de estado
- [ ] Verificar que los templates se ven bien
- [ ] Verificar que los links funcionan

---

## 🔔 NOTIFICACIONES EN TIEMPO REAL

### WebSocket
- [ ] Servidor WebSocket corriendo (puerto 3001)
- [ ] Cliente se conecta al WebSocket
- [ ] Admin recibe notificación de nueva orden
- [ ] Driver recibe notificación de orden asignada
- [ ] Cliente recibe actualización de estado
- [ ] Sonido de notificación funciona
- [ ] Contador de notificaciones no leídas

---

## 🔒 SEGURIDAD

### Autenticación
- [ ] JWT expira correctamente
- [ ] No se puede acceder a rutas protegidas sin token
- [ ] Token se refresca automáticamente

### Rate Limiting
- [ ] Login tiene límite de intentos (5/min)
- [ ] Crear orden tiene límite (10/min)
- [ ] Endpoint de productos tiene límite

### Validación
- [ ] SQL injection prevención
- [ ] XSS prevención
- [ ] CSRF prevención
- [ ] Validación de datos en backend
- [ ] Sanitización de inputs

### CORS
- [ ] CORS configurado correctamente
- [ ] Solo permite orígenes autorizados

---

## 📊 REPORTES Y ESTADÍSTICAS (Admin)

### Dashboard
- [ ] Ver total de órdenes hoy
- [ ] Ver ingresos totales
- [ ] Ver órdenes pendientes
- [ ] Ver gráficas de ventas
- [ ] Ver productos más vendidos
- [ ] Ver drivers activos

---

## 🎨 UI/UX

### Responsive Design
- [ ] Vista móvil (320px - 480px)
- [ ] Tablet (768px - 1024px)
- [ ] Desktop (1280px+)
- [ ] Navegación funciona en todos los tamaños

### Performance
- [ ] Imágenes optimizadas
- [ ] Carga rápida (<3 segundos)
- [ ] Sin errores en consola
- [ ] Sin warnings en consola

### Accesibilidad
- [ ] Contraste de colores adecuado
- [ ] Textos legibles
- [ ] Botones con tamaño táctil adecuado (44x44px mínimo)

---

## 🐛 MANEJO DE ERRORES

### Frontend
- [ ] Mensajes de error claros
- [ ] Loading states visibles
- [ ] Manejo de errores de red
- [ ] Fallbacks para imágenes rotas

### Backend
- [ ] Errores PHP ocultos en producción
- [ ] Logs de errores funcionando
- [ ] Respuestas JSON con errores descriptivos
- [ ] HTTP status codes correctos

---

## 🚀 DEPLOYMENT READINESS

### Configuración
- [ ] .env configurado correctamente
- [ ] Variables sensibles no en código
- [ ] .htaccess configurado
- [ ] Permisos de archivos correctos

### Build
- [ ] Frontend build sin errores (`npm run build`)
- [ ] Archivos estáticos optimizados
- [ ] Service Worker (opcional)

### Base de Datos
- [ ] Migraciones documentadas
- [ ] Datos de ejemplo (seeds)
- [ ] Backup y restore documentado

---

## 📝 DOCUMENTACIÓN

### README.md
- [ ] Descripción del proyecto
- [ ] Requisitos del sistema
- [ ] Instalación paso a paso
- [ ] Configuración
- [ ] Uso básico
- [ ] Screenshots

### API Documentation
- [ ] Endpoints documentados
- [ ] Ejemplos de request/response
- [ ] Códigos de error
- [ ] Autenticación explicada

### User Manual
- [ ] Guía para clientes
- [ ] Guía para admin
- [ ] Guía para drivers
- [ ] FAQ

---

## 🎯 TESTING ESPECÍFICO PARA CODECANYON

### Requirements
- [ ] Código limpio y comentado
- [ ] Sin credenciales hardcodeadas
- [ ] Compatible con PHP 7.4+ y 8.x
- [ ] Compatible con MySQL 5.7+ y 8.x
- [ ] Responsive 100%
- [ ] Cross-browser (Chrome, Firefox, Safari, Edge)

### Demo
- [ ] Demo online funcionando
- [ ] Usuario de prueba para cada rol
- [ ] Datos de ejemplo poblados
- [ ] Video demo (<5 minutos)

### Files
- [ ] Código fuente completo
- [ ] Documentación incluida
- [ ] License incluida
- [ ] Changelog incluido

---

## ✅ RESULTADO FINAL

- **Total de items**: 150+
- **Completados**: ___
- **Pendientes**: ___
- **Críticos bloqueantes**: ___

---

## 📌 PRÓXIMOS PASOS

1. Ejecutar cada test manualmente
2. Documentar bugs encontrados
3. Arreglar bugs críticos
4. Re-testear
5. Preparar para CodeCanyon
