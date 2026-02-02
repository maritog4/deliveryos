<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, Cache-Control, Pragma, Expires');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../../config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    $data = json_decode(file_get_contents("php://input"), true);

    // Validar campos requeridos
    if (empty($data['code']) || empty($data['discount_type']) || !isset($data['discount_value'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Código, tipo de descuento y valor son obligatorios'
        ]);
        exit();
    }

    // Verificar si el código ya existe
    $checkQuery = "SELECT id FROM coupons WHERE code = :code";
    $checkStmt = $db->prepare($checkQuery);
    $checkStmt->bindParam(':code', $data['code']);
    $checkStmt->execute();

    if ($checkStmt->fetch()) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'El código del cupón ya existe'
        ]);
        exit();
    }

    // Validar tipo de descuento
    if (!in_array($data['discount_type'], ['percentage', 'fixed'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Tipo de descuento inválido'
        ]);
        exit();
    }

    // Validar valor de descuento
    if ($data['discount_value'] <= 0) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'El valor del descuento debe ser mayor a 0'
        ]);
        exit();
    }

    // Si es porcentaje, validar que no sea mayor a 100
    if ($data['discount_type'] === 'percentage' && $data['discount_value'] > 100) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'El porcentaje de descuento no puede ser mayor a 100'
        ]);
        exit();
    }

    // Insertar cupón
    $query = "INSERT INTO coupons (
                code, 
                discount_type, 
                discount_value, 
                min_order_amount, 
                max_discount, 
                usage_limit, 
                valid_from, 
                valid_until, 
                is_active, 
                description,
                created_at
              ) VALUES (
                :code, 
                :discount_type, 
                :discount_value, 
                :min_order_amount, 
                :max_discount, 
                :usage_limit, 
                :valid_from, 
                :valid_until, 
                :is_active, 
                :description,
                NOW()
              )";
    
    $stmt = $db->prepare($query);
    
    $code = strtoupper(trim($data['code']));
    $is_active = isset($data['is_active']) ? ($data['is_active'] ? 1 : 0) : 1;
    $min_order_amount = isset($data['min_order_amount']) && $data['min_order_amount'] !== '' 
        ? (float)$data['min_order_amount'] : 0;
    $max_discount = isset($data['max_discount']) && $data['max_discount'] !== '' 
        ? (float)$data['max_discount'] : null;
    $usage_limit = isset($data['usage_limit']) && $data['usage_limit'] !== '' 
        ? (int)$data['usage_limit'] : null;
    $valid_from = isset($data['valid_from']) && $data['valid_from'] !== '' 
        ? $data['valid_from'] : null;
    $valid_until = isset($data['valid_until']) && $data['valid_until'] !== '' 
        ? $data['valid_until'] : null;
    $description = isset($data['description']) ? trim($data['description']) : null;
    
    $stmt->bindParam(':code', $code);
    $stmt->bindParam(':discount_type', $data['discount_type']);
    $stmt->bindParam(':discount_value', $data['discount_value']);
    $stmt->bindParam(':min_order_amount', $min_order_amount);
    $stmt->bindParam(':max_discount', $max_discount);
    $stmt->bindParam(':usage_limit', $usage_limit);
    $stmt->bindParam(':valid_from', $valid_from);
    $stmt->bindParam(':valid_until', $valid_until);
    $stmt->bindParam(':is_active', $is_active);
    $stmt->bindParam(':description', $description);
    
    if ($stmt->execute()) {
        $newCouponId = $db->lastInsertId();
        
        echo json_encode([
            'success' => true,
            'message' => 'Cupón creado exitosamente',
            'data' => [
                'id' => $newCouponId,
                'code' => $code
            ]
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error al crear el cupón'
        ]);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error del servidor: ' . $e->getMessage()
    ]);
}
