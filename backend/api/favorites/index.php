<?php
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, Cache-Control, Pragma, Expires, Cache-Control, Pragma, Expires');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../../config/config.php';
require_once '../../config/database.php';
require_once '../../middleware/Auth.php';

$database = new Database();
$db = $database->getConnection();

// GET: Obtener favoritos del usuario
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $user = Auth::user();
        
        if (!$user) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'No autenticado']);
            exit();
        }

        $query = "SELECT f.*, p.name, p.description, p.price, p.image, p.category_id
                  FROM favorites f
                  INNER JOIN products p ON f.product_id = p.id
                  WHERE f.user_id = :user_id
                  ORDER BY f.created_at DESC";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':user_id', $user['id']);
        $stmt->execute();
        
        $favorites = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'data' => $favorites
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error al obtener favoritos: ' . $e->getMessage()
        ]);
    }
}

// POST: Agregar a favoritos
else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $user = Auth::user();
        
        if (!$user) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'No autenticado']);
            exit();
        }

        $data = json_decode(file_get_contents("php://input"), true);
        
        if (!isset($data['product_id'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'product_id requerido']);
            exit();
        }

        $query = "INSERT INTO favorites (user_id, product_id) VALUES (:user_id, :product_id)";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':user_id', $user['id']);
        $stmt->bindParam(':product_id', $data['product_id']);
        
        if ($stmt->execute()) {
            echo json_encode([
                'success' => true,
                'message' => 'Agregado a favoritos',
                'data' => ['id' => $db->lastInsertId()]
            ]);
        } else {
            throw new Exception('Error al agregar a favoritos');
        }
    } catch (PDOException $e) {
        if ($e->getCode() == 23000) { // Duplicate entry
            echo json_encode([
                'success' => false,
                'message' => 'Ya está en favoritos'
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ]);
        }
    }
}

// DELETE: Eliminar de favoritos
else if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    try {
        $user = Auth::user();
        
        if (!$user) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'No autenticado']);
            exit();
        }

        $product_id = $_GET['product_id'] ?? null;
        
        if (!$product_id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'product_id requerido']);
            exit();
        }

        $query = "DELETE FROM favorites WHERE user_id = :user_id AND product_id = :product_id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':user_id', $user['id']);
        $stmt->bindParam(':product_id', $product_id);
        
        if ($stmt->execute()) {
            echo json_encode([
                'success' => true,
                'message' => 'Eliminado de favoritos'
            ]);
        } else {
            throw new Exception('Error al eliminar de favoritos');
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error: ' . $e->getMessage()
        ]);
    }
}

else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
}
?>
