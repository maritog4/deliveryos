<?php
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, Cache-Control, Pragma, Expires, Cache-Control, Pragma, Expires');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Temporalmente devolver datos sin autenticación para debugging
require_once '../../config/database.php';
require_once '../../models/Order.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    $order = new Order($db);
    
    // Obtener parámetros de filtrado
    $filters = [];
    
    // Filtro por fecha (por defecto: solo hoy)
    $date_filter = isset($_GET['date_filter']) ? $_GET['date_filter'] : 'today';
    $filters['date_filter'] = $date_filter;
    
    // Otros filtros
    if (isset($_GET['status']) && !empty($_GET['status'])) {
        $filters['status'] = $_GET['status'];
    }
    
    if (isset($_GET['limit'])) {
        $filters['limit'] = intval($_GET['limit']);
    } else {
        $filters['limit'] = 50;
    }
    
    $orders = $order->getAll($filters);
    
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'data' => $orders
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'Error del servidor: ' . $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ]);
}

