# 🚀 DeliverySV - Sistema de Delivery para Restaurantes

Sistema completo de pedidos online para restaurantes con React + PHP.

## 📋 Tecnologías

- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: PHP 8.2 + Apache
- **Base de Datos**: MySQL 8.0
- **Containerización**: Docker + Docker Compose

## 🐳 Instalación con Docker

### Prerequisitos
- Docker Desktop instalado
- Docker Compose instalado

### Pasos

1. **Clonar o navegar al proyecto**
```bash
cd /Applications/AMPPS/www/deliverySv
```

2. **Levantar los contenedores**
```bash
docker-compose up -d
```

Esto creará automáticamente:
- ✅ Base de datos MySQL (puerto 3306)
- ✅ Backend PHP con Apache (puerto 8080)
- ✅ phpMyAdmin (puerto 8081)
- ✅ Importará el schema SQL automáticamente

3. **Verificar que los contenedores estén corriendo**
```bash
docker-compose ps
```

4. **Acceder a los servicios**
- 🌐 Backend API: http://localhost:8080
- 💾 phpMyAdmin: http://localhost:8081
  - Usuario: `root`
  - Password: `mysql`

## 🔐 Usuario Admin por Defecto

- **Email**: admin@deliverysv.com
- **Password**: admin123

## 📡 Endpoints API Disponibles

### Autenticación
- `POST /api/auth/login.php` - Login
- `POST /api/auth/register.php` - Registro de clientes
- `GET /api/auth/me.php` - Perfil del usuario (requiere token)

### Ejemplo de uso (Login)
```bash
curl -X POST http://localhost:8080/api/auth/login.php \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@deliverysv.com",
    "password": "admin123"
  }'
```

## 🛠️ Comandos Docker Útiles

### Ver logs
```bash
docker-compose logs -f backend
docker-compose logs -f db
```

### Detener los contenedores
```bash
docker-compose down
```

### Reiniciar los contenedores
```bash
docker-compose restart
```

### Limpiar todo (incluyendo volúmenes)
```bash
docker-compose down -v
```

### Reconstruir los contenedores
```bash
docker-compose up -d --build
```

### Entrar al contenedor de backend
```bash
docker exec -it deliverysv_backend bash
```

### Entrar al contenedor de MySQL
```bash
docker exec -it deliverysv_db mysql -u root -pmysql deliverysv
```

## 📁 Estructura del Proyecto

```
deliverySv/
├── backend/
│   ├── api/
│   │   ├── auth/           # Endpoints de autenticación
│   │   ├── products/       # (próximamente)
│   │   ├── orders/         # (próximamente)
│   │   └── admin/          # (próximamente)
│   ├── config/
│   │   ├── database.php    # Conexión DB
│   │   └── config.php      # Configuración general
│   ├── models/
│   │   ├── User.php
│   │   ├── Product.php
│   │   ├── Category.php
│   │   └── Order.php
│   ├── middleware/
│   │   ├── JWT.php         # Manejo de tokens
│   │   └── Auth.php        # Autenticación
│   ├── uploads/            # Imágenes subidas
│   ├── Dockerfile
│   └── apache.conf
│
├── frontend/               # (próximamente)
│   └── React App
│
├── database/
│   └── schema.sql          # Schema de la base de datos
│
└── docker-compose.yml      # Configuración Docker
```

## 🗄️ Estructura de la Base de Datos

### Tablas Principales
- `users` - Usuarios (admin, clientes, repartidores)
- `categories` - Categorías de productos
- `products` - Productos/menú del restaurante
- `orders` - Pedidos
- `order_items` - Items de cada pedido
- `delivery_zones` - Zonas de entrega
- `coupons` - Cupones de descuento
- `reviews` - Calificaciones
- `notifications` - Notificaciones
- `settings` - Configuración del restaurante

## 🚧 Estado del Desarrollo

### ✅ Completado
- [x] Estructura del proyecto
- [x] Base de datos MySQL completa
- [x] Configuración Docker
- [x] Modelos PHP (User, Product, Category, Order)
- [x] Middleware JWT y Auth
- [x] API de autenticación (login, register, profile)

### 🔨 En Desarrollo
- [ ] API REST completa (productos, pedidos, zonas)
- [ ] Frontend React con Vite
- [ ] Panel de administración
- [ ] Sistema de pedidos
- [ ] App de repartidores

### 📅 Próximamente
- [ ] Seguimiento en tiempo real
- [ ] Notificaciones push
- [ ] Integración con mapas
- [ ] Sistema de reportes
- [ ] Cupones y promociones

## 🐛 Troubleshooting

### El puerto 8080 está ocupado
Cambiar el puerto en `docker-compose.yml`:
```yaml
backend:
  ports:
    - "8000:80"  # Cambiar 8080 por otro puerto
```

### La base de datos no se importa
```bash
# Reiniciar solo el contenedor de la base de datos
docker-compose down
docker volume rm deliverysv_db_data
docker-compose up -d
```

### Permisos de archivos
```bash
docker exec -it deliverysv_backend chown -R www-data:www-data /var/www/html
docker exec -it deliverysv_backend chmod -R 755 /var/www/html/uploads
```

## 📝 Notas

- Este proyecto está en desarrollo activo
- Las APIs se están creando progresivamente
- El frontend React se iniciará próximamente

## 👨‍💻 Desarrollador

Sistema desarrollado para restaurantes en El Salvador.

---

¿Necesitas ayuda? Revisa los logs con `docker-compose logs -f`
