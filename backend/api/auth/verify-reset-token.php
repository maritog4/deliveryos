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

    if (!isset($data->token)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Token requerido']);
        exit();
    }

    try {
        $database = new Database();
        $db = $database->getConnection();

        // Verificar token
        $query = "SELECT pr.*, u.email 
                  FROM password_resets pr
                  JOIN users u ON pr.user_id = u.id
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

        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Token válido'
        ]);
        
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
