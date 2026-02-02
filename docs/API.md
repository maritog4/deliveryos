# 📡 API Documentation - DeliveryOS

Complete REST API documentation for the DeliveryOS backend.

**Base URL**: `http://yourdomain.com/backend/api`  
**Version**: 1.0.0  
**Authentication**: JWT Bearer Token

---

## 📋 Table of Contents

1. [Authentication](#authentication)
2. [Products](#products)
3. [Categories](#categories)
4. [Orders](#orders)
5. [Payments](#payments)
6. [Delivery Zones](#delivery-zones)
7. [Users](#users)
8. [Error Handling](#error-handling)
9. [Rate Limiting](#rate-limiting)

---

## 🔐 Authentication

All endpoints marked with 🔒 require authentication via JWT token.

### Header Format
```http
Authorization: Bearer <your-jwt-token>
```

---

### Register User

**POST** `/auth/register.php`

Create a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "phone": "1234567890",
  "role": "customer"
}
```

**Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | ✅ | Full name (3-100 chars) |
| email | string | ✅ | Valid email address (unique) |
| password | string | ✅ | Password (min 6 chars) |
| phone | string | ✅ | Phone number |
| role | string | ⚠️ | `customer`, `admin`, `driver` (default: `customer`) |

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "data": {
    "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "user": {
      "id": 15,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "customer"
    }
  }
}
```

**Error (400 Bad Request):**
```json
{
  "success": false,
  "message": "Email ya está registrado"
}
```

---

### Login

**POST** `/auth/login.php`

Authenticate a user and receive JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "user": {
      "id": 15,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "customer"
    }
  }
}
```

**Error (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Credenciales inválidas"
}
```

**Rate Limit**: 5 requests per minute per IP

---

### Validate Token 🔒

**GET** `/auth/validate.php`

Validate JWT token and get current user info.

**Headers:**
```http
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 15,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer"
  }
}
```

**Error (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Token inválido o expirado"
}
```

---

## 🍕 Products

### Get All Products

**GET** `/products/read.php`

Get list of all available products.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| category_id | integer | ❌ | Filter by category ID |
| search | string | ❌ | Search by product name |
| featured | boolean | ❌ | Filter featured products |

**Example:**
```http
GET /products/read.php?category_id=1&featured=true
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "category_id": 1,
      "name": "Pizza Margherita",
      "description": "Pizza clásica con salsa de tomate, mozzarella fresca y albahaca",
      "price": "8.99",
      "image": "/backend/uploads/products/pizza-margherita.jpg",
      "is_available": 1,
      "is_featured": 1,
      "preparation_time": 20,
      "created_at": "2026-01-22 01:01:45"
    }
  ]
}
```

---

### Get Product by ID

**GET** `/products/read-one.php?id=1`

Get details of a specific product.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "category_id": 1,
    "category_name": "Pizzas",
    "name": "Pizza Margherita",
    "description": "Pizza clásica con salsa de tomate, mozzarella fresca y albahaca",
    "price": "8.99",
    "image": "/backend/uploads/products/pizza-margherita.jpg",
    "is_available": 1,
    "is_featured": 1,
    "preparation_time": 20
  }
}
```

---

### Create Product 🔒

**POST** `/products/create.php`

Create a new product (Admin only).

**Headers:**
```http
Authorization: Bearer <admin-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "category_id": 1,
  "name": "Pizza BBQ",
  "description": "Pizza with BBQ sauce and chicken",
  "price": 12.99,
  "image": "/backend/uploads/products/pizza-bbq.jpg",
  "is_available": true,
  "is_featured": false,
  "preparation_time": 25
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Producto creado exitosamente",
  "data": {
    "id": 25
  }
}
```

**Rate Limit**: 10 requests per minute

---

### Update Product 🔒

**PUT** `/products/update.php`

Update existing product (Admin only).

**Request Body:**
```json
{
  "id": 25,
  "name": "Pizza BBQ Premium",
  "price": 14.99,
  "is_available": true
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Producto actualizado exitosamente"
}
```

---

### Delete Product 🔒

**DELETE** `/products/delete.php?id=25`

Delete a product (Admin only).

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Producto eliminado exitosamente"
}
```

---

## 📂 Categories

### Get All Categories

**GET** `/categories/read.php`

Get list of all product categories.

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Pizzas",
      "description": "Deliciosas pizzas artesanales",
      "icon": "🍕",
      "display_order": 1,
      "is_active": 1
    },
    {
      "id": 2,
      "name": "Hamburguesas",
      "description": "Hamburguesas jugosas",
      "icon": "🍔",
      "display_order": 2,
      "is_active": 1
    }
  ]
}
```

---

### Create Category 🔒

**POST** `/categories/create.php`

Create new category (Admin only).

**Request Body:**
```json
{
  "name": "Bebidas",
  "description": "Bebidas refrescantes",
  "icon": "🥤",
  "display_order": 5,
  "is_active": true
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Categoría creada exitosamente",
  "data": {
    "id": 8
  }
}
```

---

## 📦 Orders

### Create Order 🔒

**POST** `/orders/create.php`

Create a new order (Customer only).

**Request Body:**
```json
{
  "items": [
    {
      "product_id": 1,
      "quantity": 2,
      "price": 8.99
    },
    {
      "product_id": 5,
      "quantity": 1,
      "price": 10.99
    }
  ],
  "subtotal": 28.97,
  "delivery_fee": 2.50,
  "total": 31.47,
  "payment_method": "cash",
  "delivery_address": "123 Main St, City",
  "delivery_zone_id": 1,
  "notes": "Ring doorbell twice",
  "payment_intent_id": null
}
```

**Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| items | array | ✅ | Array of order items |
| subtotal | decimal | ✅ | Sum of item prices |
| delivery_fee | decimal | ✅ | Delivery cost |
| total | decimal | ✅ | Subtotal + delivery_fee |
| payment_method | string | ✅ | `cash` or `stripe` |
| delivery_address | string | ✅ | Full delivery address |
| delivery_zone_id | integer | ✅ | Delivery zone ID |
| notes | string | ❌ | Special instructions |
| payment_intent_id | string | ⚠️ | Required if payment_method=stripe |

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Orden creada exitosamente",
  "data": {
    "order_id": 145,
    "order_number": "ORD-145-20260129",
    "status": "pending",
    "estimated_delivery": "45 minutes"
  }
}
```

**Rate Limit**: 10 orders per hour per user

---

### Get All Orders 🔒

**GET** `/orders/read.php`

Get orders (role-based access).

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| status | string | Filter by status |
| driver_id | integer | Filter by driver (admin) |
| date | string | Filter by date (YYYY-MM-DD) |

**Access:**
- **Customer**: Only their orders
- **Driver**: Only assigned orders
- **Admin**: All orders

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 145,
      "order_number": "ORD-145-20260129",
      "user_id": 15,
      "customer_name": "John Doe",
      "customer_phone": "1234567890",
      "status": "pending",
      "subtotal": "28.97",
      "delivery_fee": "2.50",
      "total": "31.47",
      "payment_method": "cash",
      "delivery_address": "123 Main St, City",
      "delivery_zone_id": 1,
      "zone_name": "Centro",
      "driver_id": null,
      "driver_name": null,
      "notes": "Ring doorbell twice",
      "created_at": "2026-01-29 10:30:00",
      "items": [
        {
          "product_name": "Pizza Margherita",
          "quantity": 2,
          "price": "8.99"
        }
      ]
    }
  ]
}
```

---

### Update Order Status 🔒

**PUT** `/orders/update-status.php`

Update order status (Admin/Driver).

**Request Body:**
```json
{
  "order_id": 145,
  "status": "preparing"
}
```

**Status Values:**
- `pending` - Order received
- `preparing` - Being prepared
- `ready` - Ready for pickup
- `delivering` - Out for delivery
- `delivered` - Completed
- `cancelled` - Cancelled

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Estado actualizado exitosamente"
}
```

---

### Assign Driver 🔒

**PUT** `/orders/assign-driver.php`

Assign driver to order (Admin only).

**Request Body:**
```json
{
  "order_id": 145,
  "driver_id": 8
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Driver asignado exitosamente"
}
```

---

## 💳 Payments

### Create Payment Intent 🔒

**POST** `/payments/create-intent.php`

Create Stripe Payment Intent.

**Request Body:**
```json
{
  "amount": 3147
}
```

Note: Amount in cents (31.47 USD = 3147 cents)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "client_secret": "pi_3Abc123..._secret_xyz789",
    "payment_intent_id": "pi_3Abc123..."
  }
}
```

**Error (500):**
```json
{
  "success": false,
  "message": "Error creating payment intent",
  "error": "Invalid API Key"
}
```

---

### Confirm Payment 🔒

**POST** `/payments/confirm.php`

Confirm payment was successful.

**Request Body:**
```json
{
  "payment_intent_id": "pi_3Abc123...",
  "order_id": 145
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Pago confirmado"
}
```

---

## 📍 Delivery Zones

### Get All Zones

**GET** `/delivery-zones/read.php`

Get all active delivery zones.

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Centro de San Salvador",
      "city": "San Salvador",
      "delivery_cost": "2.00",
      "min_order_amount": "5.00",
      "estimated_time": 30,
      "is_active": 1
    }
  ]
}
```

---

### Create Zone 🔒

**POST** `/delivery-zones/create.php`

Create delivery zone (Admin only).

**Request Body:**
```json
{
  "name": "Zona Norte",
  "city": "San Salvador",
  "delivery_cost": 3.50,
  "min_order_amount": 10.00,
  "estimated_time": 45,
  "is_active": true
}
```

---

## 👥 Users

### Get All Users 🔒

**GET** `/users/read.php`

Get all users (Admin only).

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| role | string | Filter by role |
| active | boolean | Filter active users |

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 15,
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "1234567890",
      "role": "customer",
      "is_active": 1,
      "created_at": "2026-01-29 10:00:00"
    }
  ]
}
```

---

### Update User 🔒

**PUT** `/users/update.php`

Update user info (Self or Admin).

**Request Body:**
```json
{
  "id": 15,
  "name": "John Smith",
  "phone": "9876543210"
}
```

---

## ❌ Error Handling

### Standard Error Response

```json
{
  "success": false,
  "message": "Error description",
  "error": "Technical error details (dev mode only)"
}
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 429 | Too Many Requests |
| 500 | Server Error |

---

## 🚦 Rate Limiting

Rate limits per endpoint:

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/auth/login.php` | 5 requests | 1 minute |
| `/auth/register.php` | 3 requests | 1 minute |
| `/orders/create.php` | 10 requests | 1 hour |
| All other endpoints | 60 requests | 1 minute |

**Rate Limit Headers:**
```http
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 3
X-RateLimit-Reset: 1738234567
```

**Error (429 Too Many Requests):**
```json
{
  "success": false,
  "message": "Demasiadas solicitudes. Intenta nuevamente en 60 segundos."
}
```

---

## 🔧 Testing

### Test with cURL

**Register:**
```bash
curl -X POST http://localhost/deliverySv/backend/api/auth/register.php \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"Test123!","phone":"123456","role":"customer"}'
```

**Login:**
```bash
curl -X POST http://localhost/deliverySv/backend/api/auth/login.php \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!"}'
```

**Get Products:**
```bash
curl http://localhost/deliverySv/backend/api/products/read.php
```

**Create Order (with token):**
```bash
curl -X POST http://localhost/deliverySv/backend/api/orders/create.php \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"items":[{"product_id":1,"quantity":2,"price":8.99}],"subtotal":17.98,"delivery_fee":2.50,"total":20.48,"payment_method":"cash","delivery_address":"Test St 123","delivery_zone_id":1}'
```

---

## 📚 Additional Resources

- **Postman Collection**: Import from `/docs/postman_collection.json`
- **OpenAPI Spec**: See `/docs/openapi.yaml`
- **Testing Script**: Run `bash test-api.sh`

---

**API Version**: 1.0.0  
**Last Updated**: January 29, 2026  
**Support**: support@deliveryos.com
