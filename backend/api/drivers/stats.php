<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, Cache-Control, Pragma, Expires");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../../config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Verificar que se recibió el ID del repartidor
    $driver_id = isset($_GET['driver_id']) ? intval($_GET['driver_id']) : 0;
    
    if ($driver_id <= 0) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "ID de repartidor inválido"
        ]);
        exit();
    }
    
    // Obtener información del repartidor
    $driverQuery = "SELECT 
        id, name, email, phone, vehicle_type, license_plate, status, created_at
        FROM users 
        WHERE id = :driver_id AND role = 'driver'
        LIMIT 1";
    
    $driverStmt = $db->prepare($driverQuery);
    $driverStmt->bindParam(":driver_id", $driver_id);
    $driverStmt->execute();
    $driver = $driverStmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$driver) {
        http_response_code(404);
        echo json_encode([
            "success" => false,
            "message" => "Repartidor no encontrado"
        ]);
        exit();
    }
    
    // Estadísticas generales
    $statsQuery = "SELECT 
        COUNT(*) as total_orders,
        COUNT(CASE WHEN status = 'delivered' THEN 1 END) as completed_orders,
        COUNT(CASE WHEN status = 'on_the_way' THEN 1 END) as in_transit_orders,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders,
        SUM(CASE WHEN status = 'delivered' THEN total ELSE 0 END) as total_revenue,
        AVG(CASE WHEN status = 'delivered' THEN total ELSE NULL END) as avg_order_value
        FROM orders 
        WHERE driver_id = :driver_id";
    
    $statsStmt = $db->prepare($statsQuery);
    $statsStmt->bindParam(":driver_id", $driver_id);
    $statsStmt->execute();
    $stats = $statsStmt->fetch(PDO::FETCH_ASSOC);
    
    // Estadísticas de hoy
    $todayQuery = "SELECT 
        COUNT(*) as today_orders,
        COUNT(CASE WHEN status = 'delivered' THEN 1 END) as today_completed,
        SUM(CASE WHEN status = 'delivered' THEN total ELSE 0 END) as today_revenue
        FROM orders 
        WHERE driver_id = :driver_id 
        AND DATE(created_at) = CURDATE()";
    
    $todayStmt = $db->prepare($todayQuery);
    $todayStmt->bindParam(":driver_id", $driver_id);
    $todayStmt->execute();
    $todayStats = $todayStmt->fetch(PDO::FETCH_ASSOC);
    
    // Estadísticas de esta semana
    $weekQuery = "SELECT 
        COUNT(*) as week_orders,
        COUNT(CASE WHEN status = 'delivered' THEN 1 END) as week_completed,
        SUM(CASE WHEN status = 'delivered' THEN total ELSE 0 END) as week_revenue
        FROM orders 
        WHERE driver_id = :driver_id 
        AND YEARWEEK(created_at, 1) = YEARWEEK(CURDATE(), 1)";
    
    $weekStmt = $db->prepare($weekQuery);
    $weekStmt->bindParam(":driver_id", $driver_id);
    $weekStmt->execute();
    $weekStats = $weekStmt->fetch(PDO::FETCH_ASSOC);
    
    // Órdenes recientes (últimas 15)
    $recentQuery = "SELECT 
        o.id,
        o.order_number,
        o.customer_name,
        o.customer_phone,
        o.delivery_address,
        o.status,
        o.total,
        o.created_at,
        o.updated_at,
        dz.name as zone_name
        FROM orders o
        LEFT JOIN delivery_zones dz ON o.delivery_zone_id = dz.id
        WHERE o.driver_id = :driver_id
        ORDER BY o.created_at DESC
        LIMIT 15";
    
    $recentStmt = $db->prepare($recentQuery);
    $recentStmt->bindParam(":driver_id", $driver_id);
    $recentStmt->execute();
    $recentOrders = $recentStmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Calcular tasa de completación
    $completion_rate = 0;
    if ($stats['total_orders'] > 0) {
        $completion_rate = ($stats['completed_orders'] / $stats['total_orders']) * 100;
    }
    
    // Preparar respuesta
    $response = [
        "success" => true,
        "data" => [
            "driver" => $driver,
            "stats" => [
                "total_orders" => intval($stats['total_orders']),
                "completed_orders" => intval($stats['completed_orders']),
                "in_transit_orders" => intval($stats['in_transit_orders']),
                "cancelled_orders" => intval($stats['cancelled_orders']),
                "total_revenue" => floatval($stats['total_revenue'] ?? 0),
                "avg_order_value" => floatval($stats['avg_order_value'] ?? 0),
                "completion_rate" => round($completion_rate, 2)
            ],
            "today" => [
                "orders" => intval($todayStats['today_orders']),
                "completed" => intval($todayStats['today_completed']),
                "revenue" => floatval($todayStats['today_revenue'] ?? 0)
            ],
            "week" => [
                "orders" => intval($weekStats['week_orders']),
                "completed" => intval($weekStats['week_completed']),
                "revenue" => floatval($weekStats['week_revenue'] ?? 0)
            ],
            "recent_orders" => $recentOrders
        ]
    ];
    
    http_response_code(200);
    echo json_encode($response);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Error del servidor: " . $e->getMessage()
    ]);
}
?>
