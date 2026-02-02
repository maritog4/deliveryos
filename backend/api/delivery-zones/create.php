<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../../config/database.php';
require_once '../../middleware/AuthMiddleware.php';
require_once '../../middleware/RoleMiddleware.php';

try {
    // Verificar autenticación y rol admin
    $headers = getallheaders();
    $token = isset($headers['Authorization']) ? str_replace('Bearer ', '', $headers['Authorization']) : null;
    
    if (!$token) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Token no proporcionado']);
        exit();
    }

    $authMiddleware = new AuthMiddleware();
    $user = $authMiddleware->validateToken($token);
    
    if (!$user) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Token inválido']);
        exit();
    }

    // Verificar que sea admin
    if ($user['role'] !== 'admin') {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Acceso denegado']);
        exit();
    }

    // Método permitido
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Método no permitido']);
        exit();
    }

    // Obtener datos
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Validar datos requeridos
    if (empty($data['name']) || empty($data['delivery_cost']) || 
        empty($data['min_order_amount']) || empty($data['estimated_time'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false, 
            'message' => 'Faltan datos requeridos'
        ]);
        exit();
    }

    // Crear conexión
    $database = new Database();
    $db = $database->getConnection();

    // Insertar zona
    $query = "INSERT INTO delivery_zones 
              (name, description, delivery_cost, min_order_amount, estimated_time, is_active) 
              VALUES (:name, :description, :delivery_cost, :min_order_amount, :estimated_time, :is_active)";
    
    $stmt = $db->prepare($query);
    
    $stmt->bindParam(':name', $data['name']);
    $stmt->bindParam(':description', $data['description']);
    $stmt->bindParam(':delivery_cost', $data['delivery_cost']);
    $stmt->bindParam(':min_order_amount', $data['min_order_amount']);
    $stmt->bindParam(':estimated_time', $data['estimated_time']);
    
    $is_active = isset($data['is_active']) ? ($data['is_active'] ? 1 : 0) : 1;
    $stmt->bindParam(':is_active', $is_active);

    if ($stmt->execute()) {
        $zone_id = $db->lastInsertId();
        
        http_response_code(201);
        echo json_encode([
            'success' => true,
            'message' => 'Zona creada exitosamente',
            'data' => ['id' => $zone_id]
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error al crear la zona'
        ]);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error del servidor: ' . $e->getMessage()
    ]);
}
?>
