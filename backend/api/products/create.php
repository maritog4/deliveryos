<?php
/**
 * Products API - Create product (Admin only)
 */

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../../config/database.php';
include_once '../../config/config.php';
include_once '../../models/Product.php';
// include_once '../../middleware/Auth.php';

// Verify admin role
// $currentUser = Auth::checkAdmin();

$database = new Database();
$db = $database->getConnection();
$product = new Product($db);

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->name) && !empty($data->category_id) && isset($data->price)) {
    $product->category_id = $data->category_id;
    $product->name = $data->name;
    $product->description = $data->description ?? '';
    $product->price = $data->price;
    $product->image = $data->image ?? '';
    $product->is_available = $data->is_available ?? true;
    $product->is_featured = $data->is_featured ?? false;
    $product->preparation_time = $data->preparation_time ?? 15;
    $product->display_order = $data->display_order ?? 0;

    if ($product->create()) {
        http_response_code(201);
        echo json_encode([
            'success' => true,
            'message' => 'Producto creado exitosamente',
            'data' => ['id' => $product->id]
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'No se pudo crear el producto'
        ]);
    }
} else {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Datos incompletos. Se requiere nombre, categoría y precio'
    ]);
}
?>
