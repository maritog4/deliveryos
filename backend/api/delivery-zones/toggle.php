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
    
    if (empty($data['id']) || !isset($data['is_active'])) {
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

    // Cambiar estado
    $query = "UPDATE delivery_zones SET is_active = :is_active WHERE id = :id";
    $stmt = $db->prepare($query);
    
    $is_active = $data['is_active'] ? 1 : 0;
    $stmt->bindParam(':is_active', $is_active);
    $stmt->bindParam(':id', $data['id']);

    if ($stmt->execute()) {
        $status = $is_active ? 'activada' : 'desactivada';
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => "Zona {$status} exitosamente"
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error al cambiar el estado'
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
