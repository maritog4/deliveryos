<?php
/**
 * Update Driver Location
 * Actualiza la ubicación del repartidor en tiempo real
 */

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST, PUT');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With');

require_once '../../config/database.php';
require_once '../../middleware/auth.php';

// Manejar OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Verificar método
if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'PUT') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit();
}

try {
    // Obtener datos de entrada
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (!isset($data['order_id']) || !isset($data['latitude']) || !isset($data['longitude'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false, 
            'message' => 'Faltan datos requeridos: order_id, latitude, longitude'
        ]);
        exit();
    }

    $database = new Database();
    $db = $database->getConnection();

    // Actualizar ubicación del repartidor en la orden
    $query = "UPDATE orders 
              SET driver_latitude = :latitude,
                  driver_longitude = :longitude,
                  last_location_update = NOW()
              WHERE id = :order_id";

    $stmt = $db->prepare($query);
    $stmt->bindParam(':latitude', $data['latitude']);
    $stmt->bindParam(':longitude', $data['longitude']);
    $stmt->bindParam(':order_id', $data['order_id']);

    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Ubicación actualizada correctamente',
            'data' => [
                'order_id' => $data['order_id'],
                'latitude' => $data['latitude'],
                'longitude' => $data['longitude'],
                'timestamp' => date('Y-m-d H:i:s')
            ]
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error al actualizar ubicación'
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
