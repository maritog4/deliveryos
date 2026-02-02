// Archivo de configuración para Railway
// INSTRUCCIONES: Copia config.example.php a config.php y actualiza con tus datos

<?php
// Configuración de la base de datos
define('DB_HOST', getenv('MYSQLHOST') ?: 'localhost');
define('DB_PORT', getenv('MYSQLPORT') ?: '3306');
define('DB_NAME', getenv('MYSQLDATABASE') ?: 'deliverysv');
define('DB_USER', getenv('MYSQLUSER') ?: 'root');
define('DB_PASS', getenv('MYSQLPASSWORD') ?: '');

// Clave secreta para JWT (¡CAMBIA ESTO!)
define('JWT_SECRET_KEY', getenv('JWT_SECRET_KEY') ?: 'CAMBIA_ESTA_CLAVE_SECRETA_POR_UNA_MUY_SEGURA');

// URL base de la API (ajusta según tu dominio)
define('API_BASE_URL', getenv('API_BASE_URL') ?: 'http://localhost/deliverySv/backend/api');

// URL base del frontend
define('FRONTEND_URL', getenv('FRONTEND_URL') ?: 'http://localhost:5173');

// Configuración de CORS
define('CORS_ORIGIN', getenv('CORS_ORIGIN') ?: '*');

// Zona horaria
date_default_timezone_set('America/El_Salvador');

// Configuración de errores
error_reporting(E_ALL);
ini_set('display_errors', getenv('RAILWAY_ENVIRONMENT') ? '0' : '1');

// Headers CORS
header('Access-Control-Allow-Origin: ' . CORS_ORIGIN);
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

// Manejar preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
?>
