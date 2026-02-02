<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../../config/database.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"));

    if (!isset($data->name) || !isset($data->email) || !isset($data->message)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Faltan datos requeridos']);
        exit();
    }

    // Validar email
    if (!filter_var($data->email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Email inválido']);
        exit();
    }

    try {
        $database = new Database();
        $db = $database->getConnection();

        // Guardar en base de datos
        $query = "INSERT INTO contact_messages (name, email, subject, message, created_at) 
                  VALUES (:name, :email, :subject, :message, NOW())";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':name', $data->name);
        $stmt->bindParam(':email', $data->email);
        $stmt->bindParam(':subject', $data->subject);
        $stmt->bindParam(':message', $data->message);
        
        if ($stmt->execute()) {
            // Aquí podrías enviar un email al administrador
            // mail('admin@deliverysv.com', 'Nuevo mensaje de contacto', ...);
            
            http_response_code(200);
            echo json_encode([
                'success' => true,
                'message' => 'Mensaje enviado correctamente'
            ]);
        } else {
            throw new Exception('Error al guardar el mensaje');
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
