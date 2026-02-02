<?php
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Test endpoint para verificar configuración
echo json_encode([
    'success' => true,
    'message' => 'API funcionando correctamente',
    'timestamp' => date('Y-m-d H:i:s'),
    'php_version' => phpversion(),
    'mysql_available' => extension_loaded('mysqli')
]);
?>
