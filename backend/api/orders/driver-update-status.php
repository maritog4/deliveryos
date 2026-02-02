<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Authorization, Cache-Control, Pragma, Expires");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->order_id) || !isset($data->status)) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Datos incompletos"
    ]);
    exit();
}

$valid_statuses = ['confirmed', 'preparing', 'ready', 'picked_up', 'on_the_way', 'delivered'];

if (!in_array($data->status, $valid_statuses)) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Estado no válido para repartidor"
    ]);
    exit();
}

try {
    // Si se marca como en tránsito, asignar el repartidor
    if ($data->status === 'on_the_way' && isset($data->driver_id)) {
        $query = "UPDATE orders 
                  SET status = :status,
                      driver_id = :driver_id,
                      updated_at = NOW()
                  WHERE id = :order_id";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':status', $data->status);
        $stmt->bindParam(':driver_id', $data->driver_id);
        $stmt->bindParam(':order_id', $data->order_id);
    } else {
        $query = "UPDATE orders 
                  SET status = :status,
                      updated_at = NOW()
                  WHERE id = :order_id";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':status', $data->status);
        $stmt->bindParam(':order_id', $data->order_id);
    }
    
    if ($stmt->execute()) {
        http_response_code(200);
        echo json_encode([
            "success" => true,
            "message" => "Estado actualizado correctamente"
        ]);
    } else {
        throw new Exception("Error al actualizar el estado");
    }
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Error: " . $e->getMessage()
    ]);
}
