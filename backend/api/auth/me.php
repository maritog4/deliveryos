<?php
/**
 * Auth API - Get current user profile
 */

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../../config/database.php';
include_once '../../config/config.php';
include_once '../../models/User.php';
include_once '../../middleware/Auth.php';

// Verify authentication
$currentUser = Auth::check();

$database = new Database();
$db = $database->getConnection();
$user = new User($db);

$userRecord = $user->getById($currentUser['user_id']);

if ($userRecord) {
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'data' => [
            'id' => $userRecord['id'],
            'name' => $userRecord['name'],
            'email' => $userRecord['email'],
            'phone' => $userRecord['phone'],
            'role' => $userRecord['role'],
            'status' => $userRecord['status'],
            'avatar' => $userRecord['avatar'],
            'created_at' => $userRecord['created_at']
        ]
    ]);
} else {
    http_response_code(404);
    echo json_encode([
        'success' => false,
        'message' => 'Usuario no encontrado'
    ]);
}
?>
