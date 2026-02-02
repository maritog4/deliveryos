<?php
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, Cache-Control, Pragma, Expires');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../../config/config.php';
require_once '../../config/database.php';
require_once '../../middleware/Auth.php';

// Verificar autenticación
$user = Auth::user();

if (!$user) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'No autenticado']);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);

// Validar campos requeridos
if (empty($data['address']) || empty($data['zone_id'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Dirección y zona son requeridos']);
    exit();
}

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Si es la primera dirección, marcarla como predeterminada
    $countQuery = "SELECT COUNT(*) as total FROM user_addresses WHERE user_id = :user_id";
    $countStmt = $db->prepare($countQuery);
    $countStmt->bindParam(':user_id', $user['id']);
    $countStmt->execute();
    $count = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    $isDefault = $count == 0 ? 1 : 0;
    
    $query = "INSERT INTO user_addresses (user_id, address, reference, zone_id, is_default, created_at) 
              VALUES (:user_id, :address, :reference, :zone_id, :is_default, NOW())";
    
    $stmt = $db->prepare($query);
    
    $stmt->bindParam(':user_id', $user['id']);
    $stmt->bindParam(':address', $data['address']);
    $stmt->bindParam(':reference', $data['reference']);
    $stmt->bindParam(':zone_id', $data['zone_id']);
    $stmt->bindParam(':is_default', $isDefault);
    
    if ($stmt->execute()) {
        $addressId = $db->lastInsertId();
        
        http_response_code(201);
        echo json_encode([
            'success' => true,
            'message' => 'Dirección guardada exitosamente',
            'data' => [
                'id' => $addressId
            ]
        ]);
    } else {
        throw new Exception('Error al guardar la dirección');
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error del servidor: ' . $e->getMessage()
    ]);
}
