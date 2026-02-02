<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: PUT');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../../config/database.php';
require_once '../../middleware/AuthMiddleware.php';

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
    
    if (!$user || $user['role'] !== 'admin') {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Acceso denegado']);
        exit();
    }

    // Método permitido
    if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Método no permitido']);
        exit();
    }

    // Obtener datos
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Validar datos requeridos
    if (empty($data['id']) || empty($data['name']) || 
        !isset($data['delivery_cost']) || !isset($data['min_order_amount']) || 
        !isset($data['estimated_time'])) {
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

    // Actualizar zona
    $query = "UPDATE delivery_zones 
              SET name = :name,
                  description = :description,
                  delivery_cost = :delivery_cost,
                  min_order_amount = :min_order_amount,
                  estimated_time = :estimated_time,
                  is_active = :is_active,
                  updated_at = CURRENT_TIMESTAMP
              WHERE id = :id";
    
    $stmt = $db->prepare($query);
    
    $stmt->bindParam(':id', $data['id']);
    $stmt->bindParam(':name', $data['name']);
    $stmt->bindParam(':description', $data['description']);
    $stmt->bindParam(':delivery_cost', $data['delivery_cost']);
    $stmt->bindParam(':min_order_amount', $data['min_order_amount']);
    $stmt->bindParam(':estimated_time', $data['estimated_time']);
    
    $is_active = isset($data['is_active']) ? ($data['is_active'] ? 1 : 0) : 1;
    $stmt->bindParam(':is_active', $is_active);

    if ($stmt->execute()) {
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Zona actualizada exitosamente'
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error al actualizar la zona'
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
