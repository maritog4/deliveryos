<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

require_once '../../config/database.php';
require_once '../../models/Order.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    $order = new Order($db);
    
    $filters = ['limit' => 10];
    $orders = $order->getAll($filters);
    
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'data' => $orders,
        'count' => count($orders)
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ]);
}
