<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type, Authorization, Cache-Control, Pragma, Expires, Cache-Control, Pragma, Expires');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../../config/database.php';
// require_once '../../middleware/Auth.php';

// TODO: Re-enable authentication when Auth middleware is fixed
// Auth::check();
// Auth::checkAdmin();

try {
    $database = new Database();
    $db = $database->getConnection();

    $role = isset($_GET['role']) ? $_GET['role'] : null;

    $query = "SELECT id, name, email, phone, role, status, created_at 
              FROM users 
              WHERE 1=1";

    if ($role) {
        $query .= " AND role = :role";
    }

    $query .= " ORDER BY name ASC";

    $stmt = $db->prepare($query);

    if ($role) {
        $stmt->bindParam(':role', $role);
    }

    $stmt->execute();
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'data' => $users
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error al obtener usuarios: ' . $e->getMessage()
    ]);
}
?>
