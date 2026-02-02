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

    // Validar ID
    if (empty($data['id'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'ID del repartidor es obligatorio'
        ]);
        exit();
    }

    // Verificar si el repartidor tiene órdenes asignadas
    $checkOrdersQuery = "SELECT COUNT(*) as count FROM orders WHERE driver_id = :driver_id AND status NOT IN ('delivered', 'cancelled')";
    $checkStmt = $db->prepare($checkOrdersQuery);
    $checkStmt->bindParam(':driver_id', $data['id']);
    $checkStmt->execute();
    $result = $checkStmt->fetch(PDO::FETCH_ASSOC);

    if ($result['count'] > 0) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'No se puede eliminar. El repartidor tiene órdenes activas asignadas.'
        ]);
        exit();
    }

    // Eliminar repartidor
    $query = "DELETE FROM users WHERE id = :id AND role = 'driver'";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $data['id']);
    
    if ($stmt->execute()) {
        if ($stmt->rowCount() > 0) {
            echo json_encode([
                'success' => true,
                'message' => 'Repartidor eliminado exitosamente'
            ]);
        } else {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'message' => 'Repartidor no encontrado'
            ]);
        }
    } else {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error al eliminar el repartidor'
        ]);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error del servidor: ' . $e->getMessage()
    ]);
}
