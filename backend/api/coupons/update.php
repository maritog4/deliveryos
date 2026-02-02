<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, Cache-Control, Pragma, Expires');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../../config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    $data = json_decode(file_get_contents("php://input"), true);

    // Validar ID
    if (empty($data['id'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'ID del cupón es obligatorio'
        ]);
        exit();
    }

    // Construir query de actualización dinámica
    $updateFields = [];
    $params = [':id' => $data['id']];

    if (isset($data['code']) && !empty($data['code'])) {
        // Verificar si el código ya existe en otro cupón
        $checkQuery = "SELECT id FROM coupons WHERE code = :code AND id != :id";
        $checkStmt = $db->prepare($checkQuery);
        $code = strtoupper(trim($data['code']));
        $checkStmt->bindParam(':code', $code);
        $checkStmt->bindParam(':id', $data['id']);
        $checkStmt->execute();

        if ($checkStmt->fetch()) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'El código del cupón ya existe en otro cupón'
            ]);
            exit();
        }

        $updateFields[] = "code = :code";
        $params[':code'] = $code;
    }

    if (isset($data['discount_type'])) {
        if (!in_array($data['discount_type'], ['percentage', 'fixed'])) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Tipo de descuento inválido'
            ]);
            exit();
        }
        $updateFields[] = "discount_type = :discount_type";
        $params[':discount_type'] = $data['discount_type'];
    }

    if (isset($data['discount_value'])) {
        if ($data['discount_value'] <= 0) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'El valor del descuento debe ser mayor a 0'
            ]);
            exit();
        }
        $updateFields[] = "discount_value = :discount_value";
        $params[':discount_value'] = $data['discount_value'];
    }

    if (isset($data['min_order_amount'])) {
        $updateFields[] = "min_order_amount = :min_order_amount";
        $params[':min_order_amount'] = $data['min_order_amount'] !== '' ? (float)$data['min_order_amount'] : 0;
    }

    if (isset($data['max_discount'])) {
        $updateFields[] = "max_discount = :max_discount";
        $params[':max_discount'] = $data['max_discount'] !== '' ? (float)$data['max_discount'] : null;
    }

    if (isset($data['usage_limit'])) {
        $updateFields[] = "usage_limit = :usage_limit";
        $params[':usage_limit'] = $data['usage_limit'] !== '' ? (int)$data['usage_limit'] : null;
    }

    if (isset($data['valid_from'])) {
        $updateFields[] = "valid_from = :valid_from";
        $params[':valid_from'] = $data['valid_from'] !== '' ? $data['valid_from'] : null;
    }

    if (isset($data['valid_until'])) {
        $updateFields[] = "valid_until = :valid_until";
        $params[':valid_until'] = $data['valid_until'] !== '' ? $data['valid_until'] : null;
    }

    if (isset($data['is_active'])) {
        $updateFields[] = "is_active = :is_active";
        $params[':is_active'] = $data['is_active'] ? 1 : 0;
    }

    if (isset($data['description'])) {
        $updateFields[] = "description = :description";
        $params[':description'] = trim($data['description']);
    }

    if (empty($updateFields)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'No hay campos para actualizar'
        ]);
        exit();
    }

    // Actualizar cupón
    $query = "UPDATE coupons SET " . implode(', ', $updateFields) . " WHERE id = :id";
    $stmt = $db->prepare($query);
    
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    
    if ($stmt->execute()) {
        if ($stmt->rowCount() > 0) {
            echo json_encode([
                'success' => true,
                'message' => 'Cupón actualizado exitosamente'
            ]);
        } else {
            // Verificar si el cupón existe
            $checkStmt = $db->prepare("SELECT id FROM coupons WHERE id = :id");
            $checkStmt->bindParam(':id', $data['id']);
            $checkStmt->execute();
            
            if ($checkStmt->fetch()) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Sin cambios en el cupón'
                ]);
            } else {
                http_response_code(404);
                echo json_encode([
                    'success' => false,
                    'message' => 'Cupón no encontrado'
                ]);
            }
        }
    } else {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error al actualizar el cupón'
        ]);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error del servidor: ' . $e->getMessage()
    ]);
}
