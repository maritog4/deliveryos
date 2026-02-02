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
require_once '../../models/Category.php';
// require_once '../../middleware/Auth.php';

// Verificar autenticación y rol de admin
// Auth::checkAdmin();

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit();
}

// Obtener el ID de la categoría desde la URL
$id = isset($_GET['id']) ? intval($_GET['id']) : 0;

if ($id <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'ID de categoría inválido']);
    exit();
}

// Obtener los datos del cuerpo de la petición
$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Datos inválidos']);
    exit();
}

// Validar campo requerido
if (empty($data['name'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'El nombre es requerido']);
    exit();
}

try {
    $database = new Database();
    $db = $database->getConnection();
    $category = new Category($db);

    // Actualizar la categoría
    if ($category->update($id, $data)) {
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Categoría actualizada exitosamente'
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error al actualizar la categoría']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error del servidor: ' . $e->getMessage()]);
}
