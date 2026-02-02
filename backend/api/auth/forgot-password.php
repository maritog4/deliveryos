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

    if (!isset($data->email)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Email requerido']);
        exit();
    }

    try {
        $database = new Database();
        $db = $database->getConnection();

        // Verificar que el email existe
        $query = "SELECT id, name, email FROM users WHERE email = :email LIMIT 1";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':email', $data->email);
        $stmt->execute();

        if ($stmt->rowCount() === 0) {
            // Por seguridad, no revelamos si el email existe o no
            http_response_code(200);
            echo json_encode([
                'success' => true,
                'message' => 'Si el email existe, recibirás un enlace de recuperación'
            ]);
            exit();
        }

        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        // Generar token único
        $token = bin2hex(random_bytes(32));
        $expiresAt = date('Y-m-d H:i:s', strtotime('+1 hour'));

        // Guardar token en la base de datos
        $query = "INSERT INTO password_resets (user_id, token, expires_at) 
                  VALUES (:user_id, :token, :expires_at)";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':user_id', $user['id']);
        $stmt->bindParam(':token', $token);
        $stmt->bindParam(':expires_at', $expiresAt);
        
        if ($stmt->execute()) {
            // Aquí enviarías el email con el enlace
            $resetLink = "http://localhost:5173/reset-password?token=" . $token;
            
            // Por ahora, solo respondemos con éxito
            // En producción, usarías PHPMailer o similar:
            // $mail->send($user['email'], 'Recuperación de contraseña', ...);
            
            http_response_code(200);
            echo json_encode([
                'success' => true,
                'message' => 'Enlace de recuperación enviado',
                'debug_link' => $resetLink // Solo para desarrollo
            ]);
        } else {
            throw new Exception('Error al generar token');
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
