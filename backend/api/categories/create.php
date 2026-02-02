<?php
/**
 * Categories API - Create category (Admin only)
 */

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../../config/database.php';
include_once '../../config/config.php';
include_once '../../models/Category.php';
// include_once '../../middleware/Auth.php';

// Verify admin role
// $currentUser = Auth::checkAdmin();

$database = new Database();
$db = $database->getConnection();
$category = new Category($db);

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->name)) {
    $category->name = $data->name;
    $category->description = $data->description ?? '';
    $category->image = $data->image ?? '';
    $category->display_order = $data->display_order ?? 0;
    $category->status = $data->status ?? 'active';

    if ($category->create()) {
        http_response_code(201);
        echo json_encode([
            'success' => true,
            'message' => 'Categoría creada exitosamente',
            'data' => ['id' => $category->id]
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'No se pudo crear la categoría'
        ]);
    }
} else {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Datos incompletos'
    ]);
}
?>
