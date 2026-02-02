<?php
/**
 * Products API - Get all products
 */

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Authorization, Cache-Control, Pragma, Expires");

// Manejar preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once '../../config/database.php';
include_once '../../config/config.php';
include_once '../../models/Product.php';

$database = new Database();
$db = $database->getConnection();
$product = new Product($db);

$category_id = isset($_GET['category_id']) ? $_GET['category_id'] : null;
$featured = isset($_GET['featured']) ? (bool)$_GET['featured'] : null;
$available = isset($_GET['available']) ? (bool)$_GET['available'] : null;

$products = $product->getAll($category_id, $featured, $available);

http_response_code(200);
echo json_encode([
    'success' => true,
    'data' => $products
]);
?>
