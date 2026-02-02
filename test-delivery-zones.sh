#!/bin/bash

# Test Delivery Zones CRUD endpoints

API_URL="http://localhost/deliverySv/backend/api"
ADMIN_TOKEN=""

echo "=== TESTING DELIVERY ZONES CRUD ==="
echo ""

# 1. Login como admin
echo "1️⃣ Autenticación Admin..."
LOGIN_RESPONSE=$(curl -s -X POST ${API_URL}/auth/login.php \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@deliverysv.com","password":"admin123"}')

ADMIN_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | sed 's/"token":"//')

if [ -z "$ADMIN_TOKEN" ]; then
    echo "❌ Error: No se pudo obtener token de admin"
    echo "Response: $LOGIN_RESPONSE"
    exit 1
fi

echo "✅ Token obtenido: ${ADMIN_TOKEN:0:20}..."
echo ""

# 2. Listar zonas actuales
echo "2️⃣ Listar Zonas Existentes..."
ZONES=$(curl -s ${API_URL}/delivery-zones/read.php)
echo "$ZONES" | head -5
echo ""

# 3. Crear nueva zona
echo "3️⃣ Crear Nueva Zona..."
CREATE_RESPONSE=$(curl -s -X POST ${API_URL}/delivery-zones/create.php \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "name": "Zona Test",
    "description": "Zona de prueba para testing",
    "delivery_cost": 4.99,
    "min_order_amount": 15.00,
    "estimated_time": 35,
    "is_active": true
  }')

echo "$CREATE_RESPONSE"

NEW_ZONE_ID=$(echo $CREATE_RESPONSE | grep -o '"id":[0-9]*' | sed 's/"id"://')

if [ -z "$NEW_ZONE_ID" ]; then
    echo "❌ Error: No se pudo crear la zona"
    exit 1
fi

echo "✅ Zona creada con ID: $NEW_ZONE_ID"
echo ""

# 4. Actualizar zona
echo "4️⃣ Actualizar Zona..."
UPDATE_RESPONSE=$(curl -s -X PUT ${API_URL}/delivery-zones/update.php \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d "{
    \"id\": $NEW_ZONE_ID,
    \"name\": \"Zona Test Actualizada\",
    \"description\": \"Descripción actualizada\",
    \"delivery_cost\": 5.99,
    \"min_order_amount\": 20.00,
    \"estimated_time\": 40,
    \"is_active\": true
  }")

echo "$UPDATE_RESPONSE"
echo ""

# 5. Toggle estado
echo "5️⃣ Desactivar Zona..."
TOGGLE_RESPONSE=$(curl -s -X PUT ${API_URL}/delivery-zones/toggle.php \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d "{
    \"id\": $NEW_ZONE_ID,
    \"is_active\": false
  }")

echo "$TOGGLE_RESPONSE"
echo ""

# 6. Eliminar zona
echo "6️⃣ Eliminar Zona..."
DELETE_RESPONSE=$(curl -s -X DELETE ${API_URL}/delivery-zones/delete.php \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d "{
    \"id\": $NEW_ZONE_ID
  }")

echo "$DELETE_RESPONSE"
echo ""

# 7. Verificar eliminación
echo "7️⃣ Verificar Eliminación..."
FINAL_ZONES=$(curl -s ${API_URL}/delivery-zones/read.php)
echo "$FINAL_ZONES" | head -5
echo ""

echo "================================"
echo "✅ Testing de Zonas Completado"
echo "================================"
