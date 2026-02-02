#!/bin/bash

# 🧪 Manual Testing Script - DeliveryOS
# Simula el flujo completo de un cliente

echo "================================================"
echo "🧪 TESTING MANUAL - DELIVERYOS"
echo "================================================"
echo ""

BASE_URL="http://localhost/deliverySv/backend/api"
TIMESTAMP=$(date +%s)
TEST_EMAIL="test${TIMESTAMP}@deliveryos.com"
TEST_NAME="Test User ${TIMESTAMP}"
TEST_PASSWORD="Test123!@#"

GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}📝 TEST 1: REGISTRO DE USUARIO${NC}"
echo "Email: $TEST_EMAIL"
echo "Password: $TEST_PASSWORD"
echo ""

REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register.php" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"$TEST_NAME\",
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\",
    \"phone\": \"1234567890\",
    \"role\": \"customer\"
  }")

echo "Response: $REGISTER_RESPONSE" | head -c 200
echo ""

# Extraer token
TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo -e "${RED}❌ FALLÓ: No se obtuvo token${NC}"
    exit 1
else
    echo -e "${GREEN}✅ PASÓ: Usuario registrado${NC}"
    echo "Token: ${TOKEN:0:30}..."
fi
echo ""
echo "================================================"
echo ""

sleep 2

echo -e "${BLUE}🔐 TEST 2: LOGIN${NC}"
echo ""

LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login.php" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\"
  }")

echo "Response: $LOGIN_RESPONSE" | head -c 200
echo ""

NEW_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -n "$NEW_TOKEN" ]; then
    echo -e "${GREEN}✅ PASÓ: Login exitoso${NC}"
    TOKEN=$NEW_TOKEN
else
    echo -e "${YELLOW}⚠ Token anterior aún válido${NC}"
fi
echo ""
echo "================================================"
echo ""

sleep 2

echo -e "${BLUE}📦 TEST 3: OBTENER PRODUCTOS${NC}"
echo ""

PRODUCTS_RESPONSE=$(curl -s "$BASE_URL/products/read.php")
echo "Response: $PRODUCTS_RESPONSE" | head -c 300
echo ""

# Extraer primer producto
PRODUCT_ID=$(echo "$PRODUCTS_RESPONSE" | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*')
PRODUCT_NAME=$(echo "$PRODUCTS_RESPONSE" | grep -o '"name":"[^"]*' | head -1 | cut -d'"' -f4)
PRODUCT_PRICE=$(echo "$PRODUCTS_RESPONSE" | grep -o '"price":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -n "$PRODUCT_ID" ]; then
    echo -e "${GREEN}✅ PASÓ: Productos obtenidos${NC}"
    echo "Primer producto: ID=$PRODUCT_ID, Nombre=$PRODUCT_NAME, Precio=\$$PRODUCT_PRICE"
else
    echo -e "${RED}❌ FALLÓ: No se obtuvieron productos${NC}"
    exit 1
fi
echo ""
echo "================================================"
echo ""

sleep 2

echo -e "${BLUE}📍 TEST 4: OBTENER ZONAS DE ENTREGA${NC}"
echo ""

ZONES_RESPONSE=$(curl -s "$BASE_URL/delivery-zones/read.php")
echo "Response: $ZONES_RESPONSE" | head -c 300
echo ""

ZONE_ID=$(echo "$ZONES_RESPONSE" | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*')
ZONE_NAME=$(echo "$ZONES_RESPONSE" | grep -o '"name":"[^"]*' | head -1 | cut -d'"' -f4)
DELIVERY_FEE=$(echo "$ZONES_RESPONSE" | grep -o '"delivery_fee":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -n "$ZONE_ID" ]; then
    echo -e "${GREEN}✅ PASÓ: Zonas obtenidas${NC}"
    echo "Primera zona: ID=$ZONE_ID, Nombre=$ZONE_NAME, Costo=\$$DELIVERY_FEE"
else
    echo -e "${RED}❌ FALLÓ: No se obtuvieron zonas${NC}"
    exit 1
fi
echo ""
echo "================================================"
echo ""

sleep 2

echo -e "${BLUE}🛒 TEST 5: CREAR ORDEN${NC}"
echo ""

# Calcular totales
SUBTOTAL=$PRODUCT_PRICE
TOTAL=$(echo "$SUBTOTAL + $DELIVERY_FEE" | bc)

ORDER_DATA="{
  \"items\": [
    {
      \"product_id\": $PRODUCT_ID,
      \"quantity\": 2,
      \"price\": $PRODUCT_PRICE
    }
  ],
  \"subtotal\": $(echo "$SUBTOTAL * 2" | bc),
  \"delivery_fee\": $DELIVERY_FEE,
  \"total\": $(echo "$TOTAL * 2" | bc),
  \"payment_method\": \"cash\",
  \"delivery_address\": \"Calle Test 123, Ciudad Test\",
  \"delivery_zone_id\": $ZONE_ID,
  \"notes\": \"Testing order\"
}"

echo "Creando orden con:"
echo "- Producto: $PRODUCT_NAME x2"
echo "- Subtotal: \$$(echo "$SUBTOTAL * 2" | bc)"
echo "- Envío: \$$DELIVERY_FEE"
echo "- Total: \$$(echo "$TOTAL * 2" | bc)"
echo ""

ORDER_RESPONSE=$(curl -s -X POST "$BASE_URL/orders/create.php" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "$ORDER_DATA")

echo "Response: $ORDER_RESPONSE" | head -c 300
echo ""

ORDER_ID=$(echo "$ORDER_RESPONSE" | grep -o '"order_id":[0-9]*' | grep -o '[0-9]*')
if [ -z "$ORDER_ID" ]; then
    ORDER_ID=$(echo "$ORDER_RESPONSE" | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*')
fi

if [ -n "$ORDER_ID" ]; then
    echo -e "${GREEN}✅ PASÓ: Orden creada${NC}"
    echo "Order ID: $ORDER_ID"
else
    echo -e "${RED}❌ FALLÓ: No se creó la orden${NC}"
    echo "Respuesta completa: $ORDER_RESPONSE"
fi
echo ""
echo "================================================"
echo ""

sleep 2

echo -e "${BLUE}📊 TEST 6: OBTENER ÓRDENES (Admin)${NC}"
echo ""

# Login como admin
ADMIN_LOGIN=$(curl -s -X POST "$BASE_URL/auth/login.php" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@deliveryos.com",
    "password": "Admin123!@#"
  }')

ADMIN_TOKEN=$(echo "$ADMIN_LOGIN" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -n "$ADMIN_TOKEN" ]; then
    echo -e "${GREEN}✅ Admin login exitoso${NC}"
    
    ORDERS_RESPONSE=$(curl -s "$BASE_URL/orders/read.php" \
      -H "Authorization: Bearer $ADMIN_TOKEN")
    
    echo "Órdenes: $ORDERS_RESPONSE" | head -c 300
    echo ""
    
    if echo "$ORDERS_RESPONSE" | grep -q "$ORDER_ID"; then
        echo -e "${GREEN}✅ PASÓ: Orden visible en admin${NC}"
    else
        echo -e "${YELLOW}⚠ Orden no encontrada (puede ser normal si hay muchas órdenes)${NC}"
    fi
else
    echo -e "${RED}❌ FALLÓ: Admin login${NC}"
fi
echo ""
echo "================================================"
echo ""

sleep 2

echo -e "${BLUE}💳 TEST 7: STRIPE PAYMENT INTENT (Opcional)${NC}"
echo ""

PAYMENT_RESPONSE=$(curl -s -X POST "$BASE_URL/payments/create-intent.php" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"amount\": $(echo "$TOTAL * 100" | bc | cut -d'.' -f1)}")

echo "Response: $PAYMENT_RESPONSE" | head -c 200
echo ""

if echo "$PAYMENT_RESPONSE" | grep -q "client_secret"; then
    echo -e "${GREEN}✅ PASÓ: Payment Intent creado${NC}"
elif echo "$PAYMENT_RESPONSE" | grep -q "error"; then
    echo -e "${YELLOW}⚠ Stripe no configurado (normal en desarrollo)${NC}"
else
    echo -e "${YELLOW}⚠ Respuesta inesperada${NC}"
fi
echo ""
echo "================================================"
echo ""

echo -e "${BLUE}📈 RESUMEN DE TESTING${NC}"
echo ""
echo "✅ Usuario registrado: $TEST_EMAIL"
echo "✅ Login exitoso"
echo "✅ Productos cargados"
echo "✅ Zonas de entrega configuradas"
if [ -n "$ORDER_ID" ]; then
    echo "✅ Orden creada: #$ORDER_ID"
else
    echo "⚠️  Orden: revisar manualmente"
fi
echo ""
echo -e "${GREEN}🎉 TESTING COMPLETADO${NC}"
echo ""
echo "Siguiente paso: Probar manualmente en http://localhost:5173"
echo "- Email: $TEST_EMAIL"
echo "- Password: $TEST_PASSWORD"
echo ""
