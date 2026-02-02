<?php
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');

echo json_encode([
    'success' => true,
    'message' => 'Test endpoint works',
    'headers' => getallheaders(),
    'method' => $_SERVER['REQUEST_METHOD']
]);
