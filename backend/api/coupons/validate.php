<?php
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, Cache-Control, Pragma, Expires, Cache-Control, Pragma, Expires');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');

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

$data = json_decode(file_get_contents("php://input"), true);

// Log para debugging
error_log("Coupon validation request: " . json_encode($data));

if (!isset($data['code']) || !isset($data['order_amount'])) {
    http_response_code(400);
    error_log("Missing required fields. Code: " . (isset($data['code']) ? 'yes' : 'no') . ", Amount: " . (isset($data['order_amount']) ? 'yes' : 'no'));
    echo json_encode(['success' => false, 'message' => 'Código de cupón y monto de orden requeridos']);
    exit();
}

try {
    $database = new Database();
    $db = $database->getConnection();
    
    $code = strtoupper(trim($data['code']));
    $orderAmount = floatval($data['order_amount']);
    
    // Buscar cupón
    $query = "SELECT * FROM coupons 
              WHERE code = :code 
              AND is_active = 1 
              AND (valid_from IS NULL OR valid_from <= NOW())
              AND (valid_until IS NULL OR valid_until >= NOW())";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':code', $code);
    $stmt->execute();
    
    $coupon = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$coupon) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Cupón no válido o expirado'
        ]);
        exit();
    }
    
    // Verificar monto mínimo
    if ($orderAmount < $coupon['min_order_amount']) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'El monto mínimo de compra para este cupón es $' . number_format($coupon['min_order_amount'], 2)
        ]);
        exit();
    }
    
    // Verificar límite de uso
    if ($coupon['usage_limit'] !== null && $coupon['usage_count'] >= $coupon['usage_limit']) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Este cupón ha alcanzado su límite de uso'
        ]);
        exit();
    }
    
    // Calcular descuento
    $discountAmount = 0;
    
    if ($coupon['discount_type'] === 'percentage') {
        $discountAmount = ($orderAmount * $coupon['discount_value']) / 100;
        
        // Aplicar descuento máximo si existe
        if ($coupon['max_discount_amount'] !== null && $discountAmount > $coupon['max_discount_amount']) {
            $discountAmount = $coupon['max_discount_amount'];
        }
    } else {
        // Descuento fijo
        $discountAmount = $coupon['discount_value'];
        
        // No puede ser mayor al monto de la orden
        if ($discountAmount > $orderAmount) {
            $discountAmount = $orderAmount;
        }
    }
    
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Cupón aplicado exitosamente',
        'data' => [
            'coupon_id' => $coupon['id'],
            'code' => $coupon['code'],
            'description' => $coupon['description'],
            'discount_type' => $coupon['discount_type'],
            'discount_value' => floatval($coupon['discount_value']),
            'discount_amount' => round($discountAmount, 2),
            'new_total' => round($orderAmount - $discountAmount, 2)
        ]
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error del servidor: ' . $e->getMessage()
    ]);
}
