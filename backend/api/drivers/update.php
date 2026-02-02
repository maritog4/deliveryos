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

    // Construir query de actualización dinámica
    $updateFields = [];
    $params = [':id' => $data['id']];

    if (isset($data['name']) && !empty($data['name'])) {
        $updateFields[] = "name = :name";
        $params[':name'] = $data['name'];
    }

    if (isset($data['email']) && !empty($data['email'])) {
        // Verificar si el email ya existe en otro usuario
        $checkQuery = "SELECT id FROM users WHERE email = :email AND id != :id";
        $checkStmt = $db->prepare($checkQuery);
        $checkStmt->bindParam(':email', $data['email']);
        $checkStmt->bindParam(':id', $data['id']);
        $checkStmt->execute();

        if ($checkStmt->fetch()) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'El email ya está registrado por otro usuario'
            ]);
            exit();
        }

        $updateFields[] = "email = :email";
        $params[':email'] = $data['email'];
    }

    if (isset($data['phone'])) {
        $updateFields[] = "phone = :phone";
        $params[':phone'] = $data['phone'];
    }

    if (isset($data['password']) && !empty($data['password'])) {
        $updateFields[] = "password = :password";
        $params[':password'] = password_hash($data['password'], PASSWORD_BCRYPT);
    }

    if (isset($data['vehicle_type'])) {
        $updateFields[] = "vehicle_type = :vehicle_type";
        $params[':vehicle_type'] = $data['vehicle_type'];
    }

    if (isset($data['license_plate'])) {
        $updateFields[] = "license_plate = :license_plate";
        $params[':license_plate'] = $data['license_plate'];
    }

    if (isset($data['status'])) {
        $updateFields[] = "status = :status";
        $params[':status'] = $data['status'];
    }

    if (empty($updateFields)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'No hay campos para actualizar'
        ]);
        exit();
    }

    // Actualizar repartidor
    $query = "UPDATE users SET " . implode(', ', $updateFields) . " WHERE id = :id AND role = 'driver'";
    $stmt = $db->prepare($query);
    
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    
    if ($stmt->execute()) {
        if ($stmt->rowCount() > 0) {
            echo json_encode([
                'success' => true,
                'message' => 'Repartidor actualizado exitosamente'
            ]);
        } else {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'message' => 'Repartidor no encontrado o sin cambios'
            ]);
        }
    } else {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error al actualizar el repartidor'
        ]);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error del servidor: ' . $e->getMessage()
    ]);
}
