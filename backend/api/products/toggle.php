<?php
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, Cache-Control, Pragma, Expires, Cache-Control, Pragma, Expires');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../../config/database.php';
require_once '../../models/Product.php';
// require_once '../../middleware/Auth.php';

// Verificar autenticación y rol de admin
// Auth::checkAdmin();

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit();
}

// Obtener el ID del producto desde la URL
$id = isset($_GET['id']) ? intval($_GET['id']) : 0;

if ($id <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'ID de producto inválido']);
    exit();
}

// Obtener los datos del cuerpo de la petición
$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['available'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Falta el campo available']);
    exit();
}

try {
    $database = new Database();
    $db = $database->getConnection();
    $product = new Product($db);

    // Alternar disponibilidad
    $available = $data['available'] ? 1 : 0;
    
    if ($product->toggleAvailability($id, $available)) {
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Disponibilidad actualizada exitosamente'
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error al actualizar la disponibilidad']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error del servidor: ' . $e->getMessage()]);
}
