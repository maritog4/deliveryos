<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Authorization, Cache-Control, Pragma, Expires");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$driver_id = isset($_GET['driver_id']) ? intval($_GET['driver_id']) : 0;

if ($driver_id <= 0) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "ID de repartidor requerido"
    ]);
    exit();
}

try {
    // Obtener órdenes asignadas al repartidor
    $query = "SELECT 
                o.id,
                o.order_number,
                o.customer_name,
                o.customer_phone,
                o.customer_email,
                o.delivery_address,
                o.address_reference,
                o.payment_method,
                o.status,
                o.subtotal,
                o.delivery_cost,
                o.discount,
                o.total,
                o.delivery_latitude,
                o.delivery_longitude,
                o.driver_latitude,
                o.driver_longitude,
                o.last_location_update,
                o.created_at,
                dz.name as zone_name
              FROM orders o
              LEFT JOIN delivery_zones dz ON o.delivery_zone_id = dz.id
              WHERE o.driver_id = :driver_id 
              AND o.status IN ('pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'on_the_way', 'delivered')
              ORDER BY 
                CASE o.status
                  WHEN 'on_the_way' THEN 1
                  WHEN 'picked_up' THEN 2
                  WHEN 'ready' THEN 3
                  WHEN 'preparing' THEN 4
                  WHEN 'confirmed' THEN 5
                  WHEN 'pending' THEN 6
                  WHEN 'delivered' THEN 7
                END,
                o.created_at DESC";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':driver_id', $driver_id);
    $stmt->execute();
    
    $orders = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $orders[] = [
            'id' => $row['id'],
            'order_number' => $row['order_number'],
            'customer_name' => $row['customer_name'],
            'customer_phone' => $row['customer_phone'],
            'customer_email' => $row['customer_email'],
            'delivery_address' => $row['delivery_address'],
            'address_reference' => $row['address_reference'],
            'payment_method' => $row['payment_method'],
            'status' => $row['status'],
            'subtotal' => $row['subtotal'],
            'delivery_cost' => $row['delivery_cost'],
            'discount' => $row['discount'],
            'total' => $row['total'],
            'delivery_latitude' => $row['delivery_latitude'],
            'delivery_longitude' => $row['delivery_longitude'],
            'driver_latitude' => $row['driver_latitude'],
            'driver_longitude' => $row['driver_longitude'],
            'last_location_update' => $row['last_location_update'],
            'zone_name' => $row['zone_name'],
            'created_at' => $row['created_at']
        ];
    }
    
    http_response_code(200);
    echo json_encode([
        "success" => true,
        "orders" => $orders,
        "total" => count($orders)
    ]);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Error al obtener órdenes: " . $e->getMessage()
    ]);
}
