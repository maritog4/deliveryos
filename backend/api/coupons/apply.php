<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit();
}

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->coupon_id) || !isset($data->order_id)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'ID de cupón y orden requeridos']);
    exit();
}

$coupon_id = intval($data->coupon_id);
$order_id = intval($data->order_id);
$user_id = isset($data->user_id) ? intval($data->user_id) : null;
$discount_amount = isset($data->discount_amount) ? floatval($data->discount_amount) : 0;

try {
    $database = new Database();
    $db = $database->getConnection();
    
    $db->beginTransaction();
    
    // 1. Incrementar usage_count del cupón
    $update_query = "UPDATE coupons SET usage_count = usage_count + 1 WHERE id = :coupon_id";
    $update_stmt = $db->prepare($update_query);
    $update_stmt->bindParam(':coupon_id', $coupon_id);
    
    if (!$update_stmt->execute()) {
        $db->rollBack();
        throw new Exception('Error al actualizar contador de uso del cupón');
    }
    
    // 2. Registrar el uso en coupon_usage
    $usage_query = "INSERT INTO coupon_usage (coupon_id, order_id, user_id, discount_amount, used_at) 
                    VALUES (:coupon_id, :order_id, :user_id, :discount_amount, NOW())";
    $usage_stmt = $db->prepare($usage_query);
    $usage_stmt->bindParam(':coupon_id', $coupon_id);
    $usage_stmt->bindParam(':order_id', $order_id);
    $usage_stmt->bindParam(':user_id', $user_id);
    $usage_stmt->bindParam(':discount_amount', $discount_amount);
    
    if (!$usage_stmt->execute()) {
        $db->rollBack();
        throw new Exception('Error al registrar uso del cupón');
    }
    
    // 3. Actualizar la orden con el cupón aplicado
    $order_update_query = "UPDATE orders SET coupon_code = (SELECT code FROM coupons WHERE id = :coupon_id) WHERE id = :order_id";
    $order_update_stmt = $db->prepare($order_update_query);
    $order_update_stmt->bindParam(':coupon_id', $coupon_id);
    $order_update_stmt->bindParam(':order_id', $order_id);
    
    if (!$order_update_stmt->execute()) {
        $db->rollBack();
        throw new Exception('Error al actualizar orden con cupón');
    }
    
    $db->commit();
    
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Cupón aplicado correctamente',
        'data' => [
            'coupon_id' => $coupon_id,
            'order_id' => $order_id,
            'discount_amount' => $discount_amount
        ]
    ]);
    
} catch(Exception $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error al aplicar cupón: ' . $e->getMessage()
    ]);
}
