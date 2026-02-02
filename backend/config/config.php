<?php
/**
 * General Configuration
 */

// CORS Headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Timezone
date_default_timezone_set('America/El_Salvador');

// JWT Secret Key (Change this in production!)
define('JWT_SECRET_KEY', 'your_secret_key_here_change_in_production');
define('JWT_ALGORITHM', 'HS256');

// Upload paths
define('UPLOAD_DIR', dirname(__DIR__) . '/uploads/');
define('PRODUCTS_UPLOAD_DIR', UPLOAD_DIR . 'products/');
define('RESTAURANT_UPLOAD_DIR', UPLOAD_DIR . 'restaurant/');

// Base URL (adjust according to your setup)
define('BASE_URL', 'http://localhost/deliverySv/backend/');
define('UPLOADS_URL', BASE_URL . 'uploads/');

// App settings
define('ITEMS_PER_PAGE', 20);
define('DELIVERY_BASE_COST', 2.00); // USD

// Order statuses
define('ORDER_STATUS_PENDING', 'pending');
define('ORDER_STATUS_CONFIRMED', 'confirmed');
define('ORDER_STATUS_PREPARING', 'preparing');
define('ORDER_STATUS_READY', 'ready');
define('ORDER_STATUS_PICKED_UP', 'picked_up');
define('ORDER_STATUS_ON_THE_WAY', 'on_the_way');
define('ORDER_STATUS_DELIVERED', 'delivered');
define('ORDER_STATUS_CANCELLED', 'cancelled');

// User roles
define('ROLE_ADMIN', 'admin');
define('ROLE_CUSTOMER', 'customer');
define('ROLE_DRIVER', 'driver');

// Payment methods
define('PAYMENT_CASH', 'cash');
define('PAYMENT_CARD', 'card');
define('PAYMENT_TRANSFER', 'transfer');

// Error reporting (disable in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);
?>
