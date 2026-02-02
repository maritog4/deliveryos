# 🚀 Delivery System - Configuración de Producción

## 📋 Resumen de Mejoras Implementadas

Se han implementado **3 mejoras críticas** para preparar el sistema para producción:

### 1. 🔒 SEGURIDAD
- ✅ Archivo `.env` para credenciales seguras
- ✅ Usuario de base de datos con contraseña segura generada
- ✅ Rate Limiting para prevenir DDoS
- ✅ `.htaccess` con configuración de seguridad
- ✅ Ocultación de errores PHP en producción
- ✅ Protección de archivos sensibles

### 2. 📧 EMAILS TRANSACCIONALES
- ✅ Servicio de emails con SendGrid
- ✅ Templates HTML profesionales
- ✅ Confirmación de pedido
- ✅ Actualizaciones de estado
- ✅ Reset de contraseña
- ✅ Notificaciones para admin y repartidores

### 3. 💳 PAGOS CON STRIPE
- ✅ SDK de Stripe integrado
- ✅ Endpoints de Payment Intent
- ✅ Confirmación de pagos
- ✅ Campos de pago en base de datos
- ✅ Paquetes de Stripe instalados en frontend

---

## 🔧 Configuración Inicial

### Paso 1: Configurar Variables de Entorno

1. **Edita el archivo `.env`** en `/backend/.env`:

```bash
cd /Applications/AMPPS/www/deliverySv/backend
nano .env
```

2. **Actualiza las siguientes variables:**

```env
# Database - YA CONFIGURADO AUTOMÁTICAMENTE
DB_HOST=localhost
DB_USER=deliverysv_user
DB_PASS=HJ1y09Uo9He6qu9EU8Sxi3Wf  # ← Generada automáticamente
DB_NAME=deliverysv
DB_PORT=3306

# JWT - YA CONFIGURADO AUTOMÁTICAMENTE
JWT_SECRET=eUb7UQlXNwsh0V90q2lPt4j3kL3evfy5HzlCytzCirdVpHqap2bEgH4kFeJT27A  # ← Generado automáticamente

# SendGrid - REQUIERE CONFIGURACIÓN
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxx  # ← Obtén esto de SendGrid
EMAIL_FROM=noreply@tudominio.com                # ← Tu email
EMAIL_FROM_NAME=Tu Nombre de Negocio             # ← Nombre de tu negocio

# Stripe - REQUIERE CONFIGURACIÓN
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxx     # ← Obtén de Stripe Dashboard
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxx        # ← Obtén de Stripe Dashboard
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxx    # ← Configura webhook en Stripe

# Application
APP_ENV=production
APP_DEBUG=false
APP_URL=https://tudominio.com                    # ← Tu URL de producción

# Rate Limiting
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=3600
```

### Paso 2: Configurar SendGrid (Emails)

1. **Crea una cuenta en SendGrid:**
   - Ve a: https://sendgrid.com/
   - Regístrate (tiene plan gratuito: 100 emails/día)

2. **Obtén tu API Key:**
   - Dashboard → Settings → API Keys
   - Click "Create API Key"
   - Nombre: "DeliverySystem"
   - Permisos: "Full Access"
   - Copia la key y pégala en `.env`

3. **Verifica tu dominio (opcional pero recomendado):**
   - Settings → Sender Authentication
   - Sigue las instrucciones para verificar tu dominio
   - Esto mejora la entregabilidad de emails

### Paso 3: Configurar Stripe (Pagos)

1. **Crea una cuenta en Stripe:**
   - Ve a: https://stripe.com/
   - Regístrate (gratis, sin costos iniciales)

2. **Obtén tus Keys de prueba:**
   - Dashboard → Developers → API Keys
   - Copia "Publishable key" y "Secret key"
   - Pégalas en `.env`

3. **Configura Webhook (para notificaciones):**
   - Developers → Webhooks → Add endpoint
   - URL: `https://tudominio.com/backend/api/payments/webhook.php`
   - Eventos: `payment_intent.succeeded`, `payment_intent.payment_failed`
   - Copia el "Signing secret" y pégalo en `.env`

4. **Para producción:**
   - Completa la verificación de tu negocio
   - Activa tu cuenta
   - Cambia a keys de producción (en lugar de `sk_test_` usa `sk_live_`)

---

## 🗄️ Base de Datos

### Credenciales Generadas Automáticamente

```
Usuario: deliverysv_user
Contraseña: HJ1y09Uo9He6qu9EU8Sxi3Wf
```

**⚠️ IMPORTANTE:** Estas credenciales ya están configuradas y funcionando. El script de seguridad creó:
- Un nuevo usuario MySQL con contraseña segura
- Permisos completos sobre la base de datos `deliverysv`
- Configuración en el archivo `.env`

### Campos Agregados a `orders`

```sql
payment_intent_id VARCHAR(255)     -- ID del pago de Stripe
payment_status ENUM(...)           -- Estado: pending/paid/failed/refunded
paid_at TIMESTAMP                  -- Fecha de pago
```

---

## 🔒 Seguridad Implementada

### Rate Limiting

Límites configurados por IP:

| Endpoint | Límite | Ventana |
|----------|--------|---------|
| `/api/auth/login.php` | 10 intentos | 1 hora |
| `/api/orders/create.php` | 20 órdenes | 1 hora |
| `/api/payments/*` | 20 intentos | 1 hora |

### Archivos Protegidos

El `.htaccess` protege:
- ✅ Archivo `.env` (no accesible vía web)
- ✅ Archivos `.json`, `.md`, `.log`
- ✅ Logs de errores
- ✅ Archivos de configuración

### Headers de Seguridad

```
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
```

---

## 📧 Sistema de Emails

### Emails Implementados

| Email | Trigger | Destinatario |
|-------|---------|--------------|
| **Confirmación de orden** | Orden creada | Cliente |
| **Actualización de estado** | Estado cambia | Cliente |
| **Orden lista** | Estado = ready | Cliente |
| **En camino** | Estado = on_the_way | Cliente |
| **Entregado** | Estado = delivered | Cliente |
| **Cancelado** | Estado = cancelled | Cliente |
| **Reset password** | Solicitud de reset | Usuario |
| **Nueva orden (Admin)** | Orden creada | Admin |
| **Asignación (Driver)** | Orden asignada | Repartidor |

### Personalizar Templates

Edita los templates en: `/backend/services/EmailService.php`

Métodos disponibles:
```php
$emailService = new EmailService();

// Cliente
$emailService->sendOrderConfirmation($order, $customer);
$emailService->sendOrderStatusUpdate($order, $customer, $status);

// Admin
$emailService->notifyAdminNewOrder($order, 'admin@tudominio.com');

// Repartidor
$emailService->notifyDriverAssignment($order, $driver);

// Password
$emailService->sendPasswordReset($user, $token);
```

---

## 💳 Pagos con Stripe

### Endpoints Disponibles

#### 1. Obtener Configuración
```bash
GET /api/payments/config.php
```
Respuesta:
```json
{
  "success": true,
  "publishable_key": "pk_test_..."
}
```

#### 2. Crear Payment Intent
```bash
POST /api/payments/create-intent.php
Content-Type: application/json

{
  "amount": 25.50,
  "currency": "usd",
  "order_id": 123,
  "customer_email": "customer@email.com",
  "customer_name": "John Doe"
}
```

Respuesta:
```json
{
  "success": true,
  "client_secret": "pi_xxx_secret_xxx",
  "payment_intent_id": "pi_xxxxx"
}
```

#### 3. Confirmar Pago
```bash
POST /api/payments/confirm-payment.php
Content-Type: application/json

{
  "payment_intent_id": "pi_xxxxx",
  "order_id": 123
}
```

Respuesta:
```json
{
  "success": true,
  "message": "Payment confirmed successfully",
  "payment_status": "succeeded",
  "amount": 25.50
}
```

### Integración en Frontend

**Instalado:**
```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

**Uso básico:**
```jsx
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Cargar Stripe
const stripePromise = loadStripe('pk_test_...');

function PaymentForm() {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Crear Payment Intent
    const intentResponse = await fetch('/api/payments/create-intent.php', {
      method: 'POST',
      body: JSON.stringify({ amount: total })
    });
    const { client_secret } = await intentResponse.json();

    // 2. Confirmar pago
    const result = await stripe.confirmCardPayment(client_secret, {
      payment_method: {
        card: elements.getElement(CardElement)
      }
    });

    if (result.error) {
      alert('Error en el pago');
    } else {
      // 3. Confirmar en backend
      await fetch('/api/payments/confirm-payment.php', {
        method: 'POST',
        body: JSON.stringify({
          payment_intent_id: result.paymentIntent.id,
          order_id: orderId
        })
      });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      <button type="submit" disabled={!stripe}>Pagar</button>
    </form>
  );
}

// Wrapper
function Checkout() {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm />
    </Elements>
  );
}
```

---

## 🧪 Testing

### 1. Probar Rate Limiting

```bash
# Hacer más de 10 intentos de login en menos de 1 hora
for i in {1..12}; do
  curl -X POST http://localhost/deliverySv/backend/api/auth/login.php \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}'
  echo ""
done

# Debe retornar 429 (Too Many Requests) después del intento 10
```

### 2. Probar Emails (Modo Debug)

Mientras SendGrid no esté configurado, los emails solo se loguearán:

```bash
# Ver logs de emails
tail -f /Applications/AMPPS/www/deliverySv/backend/logs/php_errors.log
```

### 3. Probar Stripe (Modo Test)

Usa tarjetas de prueba:

| Tarjeta | Resultado |
|---------|-----------|
| 4242 4242 4242 4242 | ✅ Pago exitoso |
| 4000 0000 0000 0002 | ❌ Pago declinado |
| 4000 0025 0000 3155 | ⏳ Requiere autenticación 3D Secure |

Cualquier CVV futuro y cualquier ZIP code funcionan.

---

## 📦 Archivos Creados

### Backend

```
backend/
├── .env                          # Credenciales (NO subir a Git)
├── .env.example                  # Template de .env
├── .htaccess                     # Configuración de seguridad
├── .gitignore                    # Archivos a ignorar
├── config/
│   └── Environment.php           # Loader de variables de entorno
├── middleware/
│   └── RateLimit.php             # Rate limiting
├── services/
│   ├── EmailService.php          # Servicio de emails
│   └── StripeService.php         # Servicio de Stripe
├── api/
│   └── payments/
│       ├── config.php            # Config de Stripe
│       ├── create-intent.php    # Crear payment intent
│       └── confirm-payment.php  # Confirmar pago
├── scripts/
│   └── setup-security.sh         # Script de configuración
└── vendor/
    └── stripe/                   # SDK de Stripe
```

### Frontend

```
frontend/
├── package.json                  # Incluye @stripe/stripe-js
└── node_modules/
    ├── @stripe/stripe-js/
    └── @stripe/react-stripe-js/
```

---

## ⚙️ Configuración de Producción

### 1. Cambiar a Modo Producción

En `.env`:
```env
APP_ENV=production
APP_DEBUG=false
```

### 2. Configurar URL Real

```env
APP_URL=https://tudominio.com
```

### 3. Actualizar CORS

En todos los archivos PHP de `/api/`, cambiar:
```php
header("Access-Control-Allow-Origin: http://localhost:5173");
```

Por:
```php
header("Access-Control-Allow-Origin: https://tudominio.com");
```

O usar:
```php
$allowedOrigins = ['https://tudominio.com', 'https://www.tudominio.com'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
}
```

### 4. Configurar HTTPS

En tu servidor web, configura certificado SSL:
- **Gratuito:** Let's Encrypt (certbot)
- **Cloudflare:** SSL gratis + CDN + protección DDoS

### 5. Cambiar Keys de Stripe a Producción

En Stripe Dashboard:
- Activa tu cuenta
- Ve a Developers → API Keys
- Usa las keys que empiezan con `sk_live_` y `pk_live_`

---

## 🚨 Checklist Pre-Lanzamiento

- [ ] `.env` configurado con credenciales reales
- [ ] SendGrid API key configurada y verificada
- [ ] Stripe keys de producción configuradas
- [ ] Dominio verificado en SendGrid
- [ ] Webhook de Stripe configurado
- [ ] HTTPS/SSL configurado
- [ ] CORS configurado para dominio real
- [ ] APP_URL actualizada
- [ ] Cambiar contraseña de root de MySQL
- [ ] Probar flujo completo: registro → orden → pago → email
- [ ] Verificar rate limiting funciona
- [ ] Probar pago con tarjeta real
- [ ] Probar emails llegan correctamente
- [ ] Configurar backup automático
- [ ] Documentación de usuario lista
- [ ] Términos y Privacidad personalizados

---

## 🆘 Soporte y Troubleshooting

### Emails no se envían

1. **Verificar API key:** `cat backend/.env | grep SENDGRID`
2. **Ver logs:** `tail -f backend/logs/php_errors.log`
3. **Probar API key:**
```bash
curl -X POST https://api.sendgrid.com/v3/mail/send \
  -H "Authorization: Bearer TU_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{...}'
```

### Pagos no funcionan

1. **Verificar Stripe keys:** `cat backend/.env | grep STRIPE`
2. **Modo test vs producción:** Las keys `sk_test_` solo funcionan con tarjetas de prueba
3. **Ver errores:** `tail -f backend/logs/php_errors.log`

### Rate limiting muy agresivo

Ajustar en `.env`:
```env
RATE_LIMIT_REQUESTS=200      # Más requests
RATE_LIMIT_WINDOW=3600       # Misma ventana
```

### Base de datos no conecta

1. **Verificar credenciales:** `cat backend/.env | grep DB_`
2. **Probar conexión:**
```bash
/Applications/AMPPS/apps/mysql/bin/mysql -u deliverysv_user -p deliverysv
# Usar password del .env
```

---

## 📞 Contacto

Para soporte adicional, consulta la documentación oficial:

- **Stripe:** https://stripe.com/docs
- **SendGrid:** https://docs.sendgrid.com/
- **PHP PDO:** https://www.php.net/manual/en/book.pdo.php

---

## 🎉 ¡Sistema Listo para Producción!

Has implementado con éxito:
- ✅ Seguridad robusta
- ✅ Sistema de emails profesional  
- ✅ Pagos con tarjeta

**Próximos pasos:**
1. Obtener API keys reales (SendGrid + Stripe)
2. Completar el testing end-to-end
3. ¡Lanzar! 🚀

---

**Versión:** 1.0.0  
**Fecha:** 25 de enero de 2026
