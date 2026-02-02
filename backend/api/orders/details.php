<?php
/**
 * Endpoint de Detalles de Orden
 * Retorna información completa de una orden incluyendo items, cliente, repartidor, etc.
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

$order_id = isset($_GET['id']) ? intval($_GET['id']) : 0;

if ($order_id <= 0) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "ID de orden requerido"
    ]);
    exit();
}

try {
    // Obtener información de la orden
    $query = "SELECT 
                o.*,
                dz.name as zone_name,
                dz.delivery_cost as zone_delivery_cost,
                u.name as driver_name,
                u.phone as driver_phone,
                u.email as driver_email
              FROM orders o
              LEFT JOIN delivery_zones dz ON o.delivery_zone_id = dz.id
              LEFT JOIN users u ON o.driver_id = u.id
              WHERE o.id = :order_id";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':order_id', $order_id);
    $stmt->execute();
    
    $order = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$order) {
        http_response_code(404);
        echo json_encode([
            "success" => false,
            "message" => "Orden no encontrada"
        ]);
        exit();
    }
    
    // Obtener items de la orden
    $query = "SELECT 
                oi.id,
                oi.product_id,
                oi.product_name,
                oi.unit_price,
                oi.quantity,
                oi.special_instructions,
                oi.total_price as subtotal,
                p.image,
                p.description
              FROM order_items oi
              LEFT JOIN products p ON oi.product_id = p.id
              WHERE oi.order_id = :order_id
              ORDER BY oi.id";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':order_id', $order_id);
    $stmt->execute();
    
    $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Calcular totales de items
    $items_total = 0;
    $items_count = 0;
    foreach ($items as $item) {
        $items_total += $item['subtotal'];
        $items_count += $item['quantity'];
    }
    
    // Historial de cambios de estado (si existe tabla de logs)
    $statusHistory = [];
    $historyFields = [
        'confirmed_at' => 'confirmed',
        'preparing_at' => 'preparing',
        'ready_at' => 'ready',
        'picked_up_at' => 'picked_up',
        'delivered_at' => 'delivered',
        'cancelled_at' => 'cancelled'
    ];
    
    foreach ($historyFields as $field => $status) {
        if (!empty($order[$field])) {
            $statusHistory[] = [
                'status' => $status,
                'timestamp' => $order[$field],
                'time_ago' => time_ago($order[$field])
            ];
        }
    }
    
    // Respuesta completa
    http_response_code(200);
    echo json_encode([
        "success" => true,
        "order" => [
            "id" => $order['id'],
            "order_number" => $order['order_number'],
            "status" => $order['status'],
            "delivery_type" => $order['delivery_type'],
            
            // Información del cliente
            "customer" => [
                "name" => $order['customer_name'],
                "phone" => $order['customer_phone'],
                "email" => $order['customer_email']
            ],
            
            // Información de entrega
            "delivery" => [
                "address" => $order['delivery_address'],
                "reference" => $order['address_reference'],
                "zone" => $order['zone_name'],
                "latitude" => $order['delivery_latitude'],
                "longitude" => $order['delivery_longitude']
            ],
            
            // Información del repartidor
            "driver" => $order['driver_id'] ? [
                "id" => $order['driver_id'],
                "name" => $order['driver_name'],
                "phone" => $order['driver_phone'],
                "email" => $order['driver_email'],
                "current_location" => [
                    "latitude" => $order['driver_latitude'],
                    "longitude" => $order['driver_longitude'],
                    "last_update" => $order['last_location_update']
                ]
            ] : null,
            
            // Información de pago
            "payment" => [
                "method" => $order['payment_method'],
                "status" => $order['payment_status'],
                "subtotal" => (float)$order['subtotal'],
                "delivery_cost" => (float)$order['delivery_cost'],
                "discount" => (float)$order['discount'],
                "total" => (float)$order['total']
            ],
            
            // Items de la orden
            "items" => $items,
            "items_summary" => [
                "count" => $items_count,
                "total" => $items_total
            ],
            
            // Notas
            "notes" => [
                "customer" => $order['customer_notes'],
                "admin" => $order['admin_notes']
            ],
            
            // Tiempos estimados
            "timing" => [
                "preparation_time" => $order['estimated_preparation_time'],
                "delivery_time" => $order['estimated_delivery_time']
            ],
            
            // Historial de estado
            "status_history" => $statusHistory,
            
            // Información de cancelación
            "cancellation" => $order['cancelled_at'] ? [
                "cancelled_at" => $order['cancelled_at'],
                "reason" => $order['cancellation_reason']
            ] : null,
            
            // Timestamps
            "created_at" => $order['created_at'],
            "updated_at" => $order['updated_at']
        ]
    ]);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Error al obtener detalles de la orden: " . $e->getMessage()
    ]);
}

/**
 * Calcula el tiempo transcurrido desde una fecha
 */
function time_ago($datetime) {
    $time = strtotime($datetime);
    $diff = time() - $time;
    
    if ($diff < 60) return "$diff segundos";
    if ($diff < 3600) return floor($diff / 60) . " minutos";
    if ($diff < 86400) return floor($diff / 3600) . " horas";
    return floor($diff / 86400) . " días";
}
