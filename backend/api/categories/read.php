<?php
/**
 * Categories API - Get all categories
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
include_once '../../models/Category.php';

$database = new Database();
$db = $database->getConnection();
$category = new Category($db);

$status = isset($_GET['status']) ? $_GET['status'] : null;
$categories = $category->getAll($status);

http_response_code(200);
echo json_encode([
    'success' => true,
    'data' => $categories
]);
?>
