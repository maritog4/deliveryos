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

if (!isset($data->order_id) || !isset($data->latitude) || !isset($data->longitude)) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Datos incompletos"
    ]);
    exit();
}

try {
    $query = "UPDATE orders 
              SET driver_latitude = :latitude,
                  driver_longitude = :longitude,
                  last_location_update = NOW()
              WHERE id = :order_id";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':latitude', $data->latitude);
    $stmt->bindParam(':longitude', $data->longitude);
    $stmt->bindParam(':order_id', $data->order_id);
    
    if ($stmt->execute()) {
        http_response_code(200);
        echo json_encode([
            "success" => true,
            "message" => "Ubicación actualizada correctamente"
        ]);
    } else {
        throw new Exception("Error al actualizar la ubicación");
    }
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Error: " . $e->getMessage()
    ]);
}
