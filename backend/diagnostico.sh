#!/bin/bash
echo "=== DIAGNÓSTICO COMPLETO DEL BACKEND ==="
echo ""

echo "1️⃣ Verificando addresses/read.php:"
curl -s http://localhost/deliverySv/backend/api/addresses/read.php | head -c 200
echo ""
echo ""

echo "2️⃣ Verificando orders/create.php con datos de prueba:"
curl -s -X POST http://localhost/deliverySv/backend/api/orders/create.php \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "Test",
    "customer_phone": "1234",
    "customer_email": "test@test.com",
    "delivery_address": "Test",
    "delivery_zone_id": 1,
    "payment_method": "cash",
    "notes": "",
    "items": [{"id": 1, "name": "Pizza", "price": 10.50, "quantity": 1, "special_instructions": ""}]
  }' | head -c 200
echo ""
echo ""

echo "3️⃣ Verificando que el archivo addresses/read.php existe y tiene contenido:"
ls -lh /Applications/AMPPS/www/deliverySv/backend/api/addresses/read.php
echo ""
wc -l /Applications/AMPPS/www/deliverySv/backend/api/addresses/read.php
echo ""

echo "4️⃣ Primeras 10 líneas de addresses/read.php:"
head -10 /Applications/AMPPS/www/deliverySv/backend/api/addresses/read.php
echo ""

echo "✅ Diagnóstico completo"
