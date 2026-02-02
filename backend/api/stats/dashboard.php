<?php
/**
 * Endpoint de Estadísticas del Dashboard
 * Retorna métricas importantes para el admin
 */

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

try {
    // Fecha actual y rangos
    $today = date('Y-m-d');
    $startOfMonth = date('Y-m-01');
    $startOfWeek = date('Y-m-d', strtotime('monday this week'));
    
    // 1. VENTAS DEL DÍA
    $query = "SELECT 
                COUNT(*) as total_orders,
                COALESCE(SUM(total), 0) as total_sales,
                COALESCE(SUM(subtotal), 0) as subtotal,
                COALESCE(SUM(delivery_cost), 0) as delivery_fees
              FROM orders 
              WHERE DATE(created_at) = :today 
              AND status != 'cancelled'";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':today', $today);
    $stmt->execute();
    $todayStats = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // 2. VENTAS DE LA SEMANA
    $query = "SELECT 
                COUNT(*) as total_orders,
                COALESCE(SUM(total), 0) as total_sales
              FROM orders 
              WHERE created_at >= :startOfWeek 
              AND status != 'cancelled'";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':startOfWeek', $startOfWeek);
    $stmt->execute();
    $weekStats = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // 3. VENTAS DEL MES
    $query = "SELECT 
                COUNT(*) as total_orders,
                COALESCE(SUM(total), 0) as total_sales
              FROM orders 
              WHERE created_at >= :startOfMonth 
              AND status != 'cancelled'";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':startOfMonth', $startOfMonth);
    $stmt->execute();
    $monthStats = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // 4. ÓRDENES POR ESTADO
    $query = "SELECT 
                status,
                COUNT(*) as count
              FROM orders 
              WHERE DATE(created_at) = :today
              GROUP BY status";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':today', $today);
    $stmt->execute();
    $ordersByStatus = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // 5. PRODUCTOS MÁS VENDIDOS (HOY)
    $query = "SELECT 
                oi.product_name,
                SUM(oi.quantity) as total_quantity,
                COUNT(DISTINCT oi.order_id) as times_ordered,
                COALESCE(SUM(oi.total_price), 0) as revenue
              FROM order_items oi
              INNER JOIN orders o ON oi.order_id = o.id
              WHERE DATE(o.created_at) = :today 
              AND o.status != 'cancelled'
              GROUP BY oi.product_name
              ORDER BY total_quantity DESC
              LIMIT 5";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':today', $today);
    $stmt->execute();
    $topProducts = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // 6. REPARTIDORES ACTIVOS Y SU PERFORMANCE
    $query = "SELECT 
                u.id,
                u.name,
                COUNT(o.id) as deliveries_today,
                COALESCE(SUM(o.total), 0) as total_delivered
              FROM users u
              LEFT JOIN orders o ON u.id = o.driver_id 
                  AND DATE(o.created_at) = :today
                  AND o.status = 'delivered'
              WHERE u.role = 'driver'
              GROUP BY u.id, u.name
              ORDER BY deliveries_today DESC";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':today', $today);
    $stmt->execute();
    $driversPerformance = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // 7. ÓRDENES RECIENTES (ÚLTIMAS 10)
    $query = "SELECT 
                o.id,
                o.order_number,
                o.customer_name,
                o.total,
                o.status,
                o.payment_method,
                o.created_at,
                u.name as driver_name
              FROM orders o
              LEFT JOIN users u ON o.driver_id = u.id
              ORDER BY o.created_at DESC
              LIMIT 10";
    
    $stmt = $db->prepare($query);
    $stmt->execute();
    $recentOrders = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // 8. PROMEDIO DE ÓRDENES
    $query = "SELECT 
                COALESCE(AVG(total), 0) as avg_order_value,
                COALESCE(AVG(delivery_cost), 0) as avg_delivery_cost
              FROM orders 
              WHERE DATE(created_at) = :today 
              AND status != 'cancelled'";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':today', $today);
    $stmt->execute();
    $averages = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // 9. TOTAL DE PRODUCTOS Y CATEGORÍAS
    $query = "SELECT 
                (SELECT COUNT(*) FROM products WHERE is_available = 1) as total_products,
                (SELECT COUNT(*) FROM categories WHERE status = 'active') as total_categories,
                (SELECT COUNT(*) FROM users WHERE role = 'customer') as total_customers,
                (SELECT COUNT(*) FROM users WHERE role = 'driver') as total_drivers";
    
    $stmt = $db->prepare($query);
    $stmt->execute();
    $counts = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Respuesta consolidada
    http_response_code(200);
    echo json_encode([
        "success" => true,
        "data" => [
            "today" => [
                "orders" => (int)$todayStats['total_orders'],
                "revenue" => (float)$todayStats['total_sales'],
                "subtotal" => (float)$todayStats['subtotal'],
                "delivery_fees" => (float)$todayStats['delivery_fees'],
                "avg_order_value" => (float)$averages['avg_order_value'],
                "avg_delivery_cost" => (float)$averages['avg_delivery_cost']
            ],
            "week" => [
                "orders" => (int)$weekStats['total_orders'],
                "revenue" => (float)$weekStats['total_sales']
            ],
            "month" => [
                "orders" => (int)$monthStats['total_orders'],
                "revenue" => (float)$monthStats['total_sales']
            ],
            "orders_by_status" => $ordersByStatus,
            "top_products" => $topProducts,
            "drivers_performance" => $driversPerformance,
            "recent_orders" => $recentOrders,
            "counts" => [
                "products" => (int)$counts['total_products'],
                "categories" => (int)$counts['total_categories'],
                "customers" => (int)$counts['total_customers'],
                "drivers" => (int)$counts['total_drivers']
            ]
        ],
        "generated_at" => date('Y-m-d H:i:s')
    ]);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Error al obtener estadísticas: " . $e->getMessage()
    ]);
}
