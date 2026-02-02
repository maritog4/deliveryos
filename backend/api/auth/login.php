<?php
/**
 * Auth API - Login
 * Protected with rate limiting
 */

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../../config/database.php';
include_once '../../config/config.php';
include_once '../../models/User.php';
include_once '../../middleware/JWT.php';
include_once '../../middleware/RateLimit.php';

// Apply rate limiting: 10 login attempts per hour per IP
RateLimit::apply(null, 10, 3600);

$database = new Database();
$db = $database->getConnection();
$user = new User($db);

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->email) && !empty($data->password)) {
    
    $userRecord = $user->getByEmail($data->email);

    if ($userRecord) {
        // Verify password
        if (password_verify($data->password, $userRecord['password'])) {
            
            // Check if user is active
            if ($userRecord['status'] !== 'active') {
                http_response_code(403);
                echo json_encode([
                    'success' => false,
                    'message' => 'Tu cuenta está inactiva o bloqueada.'
                ]);
                exit();
            }

            // Generate JWT token
            $token = JWT::generateToken($userRecord);

            http_response_code(200);
            echo json_encode([
                'success' => true,
                'message' => 'Login exitoso',
                'data' => [
                    'token' => $token,
                    'user' => [
                        'id' => $userRecord['id'],
                        'name' => $userRecord['name'],
                        'email' => $userRecord['email'],
                        'phone' => $userRecord['phone'],
                        'role' => $userRecord['role'],
                        'avatar' => $userRecord['avatar']
                    ]
                ]
            ]);
        } else {
            http_response_code(401);
            echo json_encode([
                'success' => false,
                'message' => 'Email o contraseña incorrectos'
            ]);
        }
    } else {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Email o contraseña incorrectos'
        ]);
    }
} else {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Email y contraseña son requeridos'
    ]);
}
?>
