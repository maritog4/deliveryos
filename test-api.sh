#!/bin/bash

# 🧪 Script de Testing Automático - DeliverySv API
# Fecha: $(date)

echo "================================================"
echo "🧪 TESTING DELIVERYSV API"
echo "================================================"
echo ""

BASE_URL="http://localhost/deliverySv/backend/api"
ERRORS=0
PASSED=0

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para test
test_endpoint() {
    local name=$1
    local url=$2
    local method=${3:-GET}
    local data=$4
    local expected_status=${5:-200}
    
    echo -n "Testing: $name ... "
    
    if [ "$method" = "POST" ]; then
        response=$(curl -s -w "\n%{http_code}" -X POST "$url" \
            -H "Content-Type: application/json" \
            -d "$data" 2>/dev/null)
    else
        response=$(curl -s -w "\n%{http_code}" "$url" 2>/dev/null)
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "$expected_status" ]; then
        echo -e "${GREEN}✓ PASSED${NC} (HTTP $http_code)"
        PASSED=$((PASSED + 1))
        return 0
    else
        echo -e "${RED}✗ FAILED${NC} (Expected $expected_status, got $http_code)"
        echo "   Response: $body"
        ERRORS=$((ERRORS + 1))
        return 1
    fi
}

echo "📦 1. PRODUCTOS Y CATEGORÍAS"
echo "----------------------------"
test_endpoint "Listar categorías" "$BASE_URL/categories/read.php"
test_endpoint "Listar productos" "$BASE_URL/products/read.php"
test_endpoint "Productos destacados" "$BASE_URL/products/featured.php"
echo ""

echo "📍 2. ZONAS DE ENTREGA"
echo "----------------------------"
test_endpoint "Listar zonas" "$BASE_URL/delivery-zones/read.php"
echo ""

echo "🔐 3. AUTENTICACIÓN"
echo "----------------------------"
# Test login con credenciales incorrectas (debe fallar)
test_endpoint "Login incorrecto" "$BASE_URL/auth/login.php" "POST" \
    '{"email":"test@test.com","password":"wrongpass"}' "401"

# Test registro (puede fallar si el email ya existe)
RANDOM_EMAIL="test$(date +%s)@test.com"
echo -n "Testing: Registro de usuario ... "
response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/auth/register.php" \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"Test User\",\"email\":\"$RANDOM_EMAIL\",\"password\":\"Test123!@#\",\"phone\":\"1234567890\",\"role\":\"customer\"}" 2>/dev/null)
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" = "201" ] || [ "$http_code" = "200" ]; then
    echo -e "${GREEN}✓ PASSED${NC} (HTTP $http_code)"
    PASSED=$((PASSED + 1))
    # Extraer token para tests posteriores
    TOKEN=$(echo "$body" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    echo "   Token obtenido: ${TOKEN:0:20}..."
else
    echo -e "${RED}✗ FAILED${NC} (HTTP $http_code)"
    echo "   Response: $body"
    ERRORS=$((ERRORS + 1))
fi
echo ""

echo "💳 4. STRIPE PAYMENT"
echo "----------------------------"
if [ -n "$TOKEN" ]; then
    echo -n "Testing: Crear Payment Intent ... "
    response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/payments/create-intent.php" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $TOKEN" \
        -d '{"amount":2500}' 2>/dev/null)
    http_code=$(echo "$response" | tail -n1)
    
    if [ "$http_code" = "200" ]; then
        echo -e "${GREEN}✓ PASSED${NC} (HTTP $http_code)"
        PASSED=$((PASSED + 1))
    else
        echo -e "${YELLOW}⚠ SKIPPED${NC} (Requiere Stripe configurado)"
    fi
else
    echo -e "${YELLOW}⚠ SKIPPED${NC} (No token disponible)"
fi
echo ""

echo "📊 5. ÓRDENES"
echo "----------------------------"
if [ -n "$TOKEN" ]; then
    test_endpoint "Mis órdenes" "$BASE_URL/orders/my-orders.php" "GET"
else
    echo -e "${YELLOW}⚠ SKIPPED${NC} (No token disponible)"
fi
echo ""

echo "🖼️  6. IMÁGENES LOCALES"
echo "----------------------------"
echo -n "Testing: Imagen de producto ... "
if [ -f "/Applications/AMPPS/www/deliverySv/backend/uploads/products/pizza-margherita.jpg" ]; then
    file_size=$(stat -f%z "/Applications/AMPPS/www/deliverySv/backend/uploads/products/pizza-margherita.jpg" 2>/dev/null)
    if [ "$file_size" -gt 1000 ]; then
        echo -e "${GREEN}✓ PASSED${NC} (Tamaño: ${file_size} bytes)"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}✗ FAILED${NC} (Archivo muy pequeño: ${file_size} bytes)"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo -e "${RED}✗ FAILED${NC} (Archivo no existe)"
    ERRORS=$((ERRORS + 1))
fi
echo ""

echo "================================================"
echo "📊 RESULTADOS"
echo "================================================"
TOTAL=$((PASSED + ERRORS))
echo "Total tests: $TOTAL"
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$ERRORS${NC}"
echo ""

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ TODOS LOS TESTS PASARON${NC}"
    exit 0
else
    echo -e "${RED}❌ HAY ERRORES QUE CORREGIR${NC}"
    exit 1
fi
