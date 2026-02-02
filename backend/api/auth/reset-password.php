<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../../config/database.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"));

    if (!isset($data->token) || !isset($data->password)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Token y contraseña requeridos']);
        exit();
    }

    if (strlen($data->password) < 6) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'La contraseña debe tener al menos 6 caracteres']);
        exit();
    }

    try {
        $database = new Database();
        $db = $database->getConnection();

        // Verificar token
        $query = "SELECT pr.user_id 
                  FROM password_resets pr
                  WHERE pr.token = :token 
                  AND pr.used = 0 
                  AND pr.expires_at > NOW()
                  LIMIT 1";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':token', $data->token);
        $stmt->execute();

        if ($stmt->rowCount() === 0) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Token inválido o expirado'
            ]);
            exit();
        }

        $reset = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Actualizar contraseña
        $hashedPassword = password_hash($data->password, PASSWORD_BCRYPT);
        $query = "UPDATE users SET password = :password WHERE id = :user_id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':password', $hashedPassword);
        $stmt->bindParam(':user_id', $reset['user_id']);
        
        if ($stmt->execute()) {
            // Marcar token como usado
            $query = "UPDATE password_resets SET used = 1 WHERE token = :token";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':token', $data->token);
            $stmt->execute();
            
            http_response_code(200);
            echo json_encode([
                'success' => true,
                'message' => 'Contraseña actualizada correctamente'
            ]);
        } else {
            throw new Exception('Error al actualizar la contraseña');
        }
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error en el servidor: ' . $e->getMessage()
        ]);
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
}
