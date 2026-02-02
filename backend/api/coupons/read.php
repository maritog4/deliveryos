<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
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

    // Query para obtener todos los cupones
    $query = "SELECT 
                id,
                code,
                discount_type,
                discount_value,
                min_order_amount,
                max_discount,
                usage_count,
                usage_limit,
                valid_from,
                valid_until,
                is_active,
                description,
                created_at
              FROM coupons 
              ORDER BY created_at DESC";
    
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $coupons = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $coupons[] = [
            'id' => (int)$row['id'],
            'code' => $row['code'],
            'discount_type' => $row['discount_type'],
            'discount_value' => (float)$row['discount_value'],
            'min_order_amount' => (float)$row['min_order_amount'],
            'max_discount' => $row['max_discount'] ? (float)$row['max_discount'] : null,
            'usage_count' => (int)$row['usage_count'],
            'usage_limit' => $row['usage_limit'] ? (int)$row['usage_limit'] : null,
            'valid_from' => $row['valid_from'],
            'valid_until' => $row['valid_until'],
            'is_active' => (bool)$row['is_active'],
            'description' => $row['description'],
            'created_at' => $row['created_at']
        ];
    }
    
    echo json_encode([
        'success' => true,
        'data' => $coupons,
        'count' => count($coupons)
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error del servidor: ' . $e->getMessage()
    ]);
}
