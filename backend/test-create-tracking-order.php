<?php
/**
 * Script para crear orden de prueba con rastreo
 */

$conn = new mysqli('localhost', 'root', 'mysql', 'deliverysv');

if ($conn->connect_error) {
    die("Error de conexión: " . $conn->connect_error);
}

// Obtener un usuario cliente
$userResult = $conn->query("SELECT id, name, email, phone FROM users WHERE role='customer' LIMIT 1");
$user = $userResult->fetch_assoc();

if (!$user) {
    die("No hay usuarios tipo 'customer' en la base de datos\n");
}

// Obtener una zona de entrega
$zoneResult = $conn->query("SELECT id, delivery_cost FROM delivery_zones WHERE is_active = 1 LIMIT 1");
$zone = $zoneResult->fetch_assoc();

if (!$zone) {
    die("No hay zonas de entrega activas\n");
}

// Obtener un repartidor
$driverResult = $conn->query("SELECT id, name FROM users WHERE role='driver' LIMIT 1");
$driver = $driverResult->fetch_assoc();

// Datos de la orden
$orderNumber = 'ORD-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -6));
$status = 'on_the_way';
$subtotal = 25.50;
$deliveryCost = $zone['delivery_cost'];
$total = $subtotal + $deliveryCost;

// Ubicaciones en San Salvador (coordenadas reales)
$customerLat = 13.6929;  // Colonia Escalón
$customerLng = -89.2182;
$driverLat = 13.6980;    // Cerca del cliente
$driverLng = -89.2220;

// Productos de ejemplo
$items = json_encode([
    ['id' => 1, 'name' => 'Pizza Margarita', 'price' => 12.50, 'quantity' => 1],
    ['id' => 2, 'name' => 'Refresco', 'price' => 2.00, 'quantity' => 2],
    ['id' => 3, 'name' => 'Papas Fritas', 'price' => 4.50, 'quantity' => 2]
]);

// Insertar la orden
$sql = "INSERT INTO orders (
    order_number, user_id, driver_id, delivery_type, status,
    customer_name, customer_phone, customer_email,
    delivery_address, delivery_reference, delivery_zone_id,
    delivery_latitude, delivery_longitude,
    driver_latitude, driver_longitude, last_location_update,
    payment_method, payment_status,
    subtotal, delivery_cost, discount, total,
    items, customer_notes, created_at
) VALUES (
    ?, ?, ?, 'delivery', ?,
    ?, ?, ?,
    'Colonia Escalón, Calle Principal #123', 'Frente a Pizza Hut, casa blanca', ?,
    ?, ?,
    ?, ?, NOW(),
    'cash', 'pending',
    ?, ?, 0, ?,
    ?, 'Orden de prueba para rastreo en mapa', NOW()
)";

$stmt = $conn->prepare($sql);
$driverId = $driver ? $driver['id'] : null;
$stmt->bind_param(
    'siissssidddddds',
    $orderNumber,
    $user['id'],
    $driverId,
    $status,
    $user['name'],
    $user['phone'],
    $user['email'],
    $zone['id'],
    $customerLat,
    $customerLng,
    $driverLat,
    $driverLng,
    $subtotal,
    $deliveryCost,
    $total,
    $items
);

if ($stmt->execute()) {
    $orderId = $conn->insert_id;
    echo "✅ Orden de prueba creada exitosamente!\n\n";
    echo "📦 Detalles de la orden:\n";
    echo "   ID: $orderId\n";
    echo "   Número: $orderNumber\n";
    echo "   Cliente: {$user['name']}\n";
    echo "   Estado: $status 🚚\n";
    echo "   Total: $$total\n";
    echo "   Ubicación cliente: $customerLat, $customerLng\n";
    echo "   Ubicación repartidor: $driverLat, $driverLng\n";
    if ($driver) {
        echo "   Repartidor: {$driver['name']}\n";
    }
    echo "\n🗺️  Puedes ver el rastreo en http://localhost:5173/my-orders\n";
} else {
    echo "❌ Error al crear la orden: " . $stmt->error . "\n";
}

$conn->close();
?>
