<?php
/**
 * Health Check Endpoint para Railway.app
 * Verifica que el servidor esté funcionando correctamente
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$health = [
    'status' => 'healthy',
    'timestamp' => date('Y-m-d H:i:s'),
    'service' => 'DeliveryOS API',
    'version' => '1.0.0'
];

// Verificar conexión a base de datos
try {
    require_once '../config/database.php';
    $database = new Database();
    $db = $database->getConnection();
    
    if ($db) {
        $health['database'] = 'connected';
    } else {
        $health['database'] = 'disconnected';
        $health['status'] = 'unhealthy';
    }
} catch (Exception $e) {
    $health['database'] = 'error';
    $health['database_error'] = $e->getMessage();
    $health['status'] = 'unhealthy';
}

// Verificar permisos de escritura
$uploadDir = '../uploads/';
if (is_writable($uploadDir)) {
    $health['uploads'] = 'writable';
} else {
    $health['uploads'] = 'read-only';
}

// Verificar PHP versión
$health['php_version'] = PHP_VERSION;

// Response status code
http_response_code($health['status'] === 'healthy' ? 200 : 503);

echo json_encode($health, JSON_PRETTY_PRINT);
