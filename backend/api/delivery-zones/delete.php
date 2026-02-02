<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: DELETE');
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
    if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Método no permitido']);
        exit();
    }

    // Obtener datos
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (empty($data['id'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false, 
            'message' => 'ID de zona requerido'
        ]);
        exit();
    }

    // Crear conexión
    $database = new Database();
    $db = $database->getConnection();

    // Verificar si hay órdenes asociadas
    $checkQuery = "SELECT COUNT(*) as count FROM orders WHERE delivery_zone_id = :id";
    $checkStmt = $db->prepare($checkQuery);
    $checkStmt->bindParam(':id', $data['id']);
    $checkStmt->execute();
    $result = $checkStmt->fetch(PDO::FETCH_ASSOC);

    if ($result['count'] > 0) {
        // Si hay órdenes, solo desactivar en lugar de eliminar
        $updateQuery = "UPDATE delivery_zones SET is_active = 0 WHERE id = :id";
        $updateStmt = $db->prepare($updateQuery);
        $updateStmt->bindParam(':id', $data['id']);
        
        if ($updateStmt->execute()) {
            http_response_code(200);
            echo json_encode([
                'success' => true,
                'message' => 'Zona desactivada (tiene órdenes asociadas)'
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error al desactivar la zona'
            ]);
        }
        exit();
    }

    // Si no hay órdenes, eliminar completamente
    $deleteQuery = "DELETE FROM delivery_zones WHERE id = :id";
    $deleteStmt = $db->prepare($deleteQuery);
    $deleteStmt->bindParam(':id', $data['id']);

    if ($deleteStmt->execute()) {
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Zona eliminada exitosamente'
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error al eliminar la zona'
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
