<?php
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, Cache-Control, Pragma, Expires, Cache-Control, Pragma, Expires');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../../config/database.php';
require_once '../../models/Order.php';
// require_once '../../middleware/Auth.php';

// Auth::checkAdmin();

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit();
}

$id = isset($_GET['id']) ? intval($_GET['id']) : 0;

if ($id <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'ID de orden inválido']);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['status'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Estado requerido']);
    exit();
}

$validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'assigned', 'picked_up', 'on_the_way', 'delivered', 'cancelled'];
if (!in_array($data['status'], $validStatuses)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Estado inválido']);
    exit();
}

try {
    $database = new Database();
    $db = $database->getConnection();
    $order = new Order($db);
    
    // Obtener datos de la orden antes de actualizar
    $orderQuery = "SELECT o.order_number, o.user_id, o.customer_email, o.id 
                   FROM orders o 
                   WHERE o.id = :id";
    $orderStmt = $db->prepare($orderQuery);
    $orderStmt->bindParam(':id', $id);
    $orderStmt->execute();
    $orderData = $orderStmt->fetch(PDO::FETCH_ASSOC);
    
    if ($order->updateStatus($id, $data['status'])) {
        
        // 🔔 NOTIFICACIÓN EN TIEMPO REAL - Estado actualizado al cliente
        try {
            require_once '../../utils/NotificationHelper.php';
            NotificationHelper::notifyOrderStatusChanged(
                $id,
                $orderData['order_number'],
                $data['status'],
                $orderData['user_id'],
                $orderData['customer_email']
            );
        } catch (Exception $notifError) {
            error_log("Notification send failed: " . $notifError->getMessage());
        }
        
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Estado actualizado exitosamente'
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error al actualizar el estado']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error del servidor: ' . $e->getMessage()]);
}
