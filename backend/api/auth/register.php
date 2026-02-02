<?php
/**
 * Auth API - Register (Customer)
 */

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../../config/database.php';
include_once '../../config/config.php';
include_once '../../models/User.php';
include_once '../../middleware/JWT.php';

$database = new Database();
$db = $database->getConnection();
$user = new User($db);

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->name) && !empty($data->email) && !empty($data->password)) {
    
    // Check if email already exists
    if ($user->emailExists($data->email)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'El email ya está registrado'
        ]);
        exit();
    }

    // Validate email format
    if (!filter_var($data->email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Email inválido'
        ]);
        exit();
    }

    // Validate password length
    if (strlen($data->password) < 6) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'La contraseña debe tener al menos 6 caracteres'
        ]);
        exit();
    }

    $user->name = $data->name;
    $user->email = $data->email;
    $user->phone = $data->phone ?? '';
    $user->password = $data->password;
    $user->role = ROLE_CUSTOMER; // Always customer for public registration
    $user->status = 'active';

    if ($user->create()) {
        
        $userRecord = $user->getByEmail($data->email);
        $token = JWT::generateToken($userRecord);

        http_response_code(201);
        echo json_encode([
            'success' => true,
            'message' => 'Usuario registrado exitosamente',
            'data' => [
                'token' => $token,
                'user' => [
                    'id' => $userRecord['id'],
                    'name' => $userRecord['name'],
                    'email' => $userRecord['email'],
                    'phone' => $userRecord['phone'],
                    'role' => $userRecord['role']
                ]
            ]
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'No se pudo crear el usuario'
        ]);
    }
} else {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Datos incompletos. Nombre, email y contraseña son requeridos'
    ]);
}
?>
