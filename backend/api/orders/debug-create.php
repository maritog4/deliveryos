<?php
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, Cache-Control, Pragma, Expires');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Capturar y mostrar todo lo que recibimos
$rawInput = file_get_contents("php://input");
$data = json_decode($rawInput, true);

echo json_encode([
    'success' => true,
    'message' => 'Debug endpoint',
    'raw_input' => $rawInput,
    'decoded_data' => $data,
    'json_error' => json_last_error_msg(),
    'headers' => getallheaders()
], JSON_PRETTY_PRINT);
