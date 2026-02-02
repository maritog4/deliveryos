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

    // Validar campos requeridos
    if (empty($data['name']) || empty($data['email']) || empty($data['password'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Nombre, email y contraseña son obligatorios'
        ]);
        exit();
    }

    // Verificar si el email ya existe
    $checkQuery = "SELECT id FROM users WHERE email = :email";
    $checkStmt = $db->prepare($checkQuery);
    $checkStmt->bindParam(':email', $data['email']);
    $checkStmt->execute();

    if ($checkStmt->fetch()) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'El email ya está registrado'
        ]);
        exit();
    }

    // Insertar nuevo repartidor
    $query = "INSERT INTO users (name, email, password, phone, role, vehicle_type, license_plate, status, created_at) 
              VALUES (:name, :email, :password, :phone, 'driver', :vehicle_type, :license_plate, :status, NOW())";
    
    $stmt = $db->prepare($query);
    
    $hashedPassword = password_hash($data['password'], PASSWORD_BCRYPT);
    $status = isset($data['status']) ? $data['status'] : 'active';
    
    $stmt->bindParam(':name', $data['name']);
    $stmt->bindParam(':email', $data['email']);
    $stmt->bindParam(':password', $hashedPassword);
    $stmt->bindParam(':phone', $data['phone']);
    $stmt->bindParam(':vehicle_type', $data['vehicle_type']);
    $stmt->bindParam(':license_plate', $data['license_plate']);
    $stmt->bindParam(':status', $status);
    
    if ($stmt->execute()) {
        $newDriverId = $db->lastInsertId();
        
        echo json_encode([
            'success' => true,
            'message' => 'Repartidor creado exitosamente',
            'data' => [
                'id' => $newDriverId,
                'name' => $data['name'],
                'email' => $data['email']
            ]
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error al crear el repartidor'
        ]);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error del servidor: ' . $e->getMessage()
    ]);
}
