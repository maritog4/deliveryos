<?php
// Suprimir warnings en producción
error_reporting(E_ERROR | E_PARSE);
ini_set('display_errors', '0');

header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, Cache-Control, Pragma, Expires');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Rate limiting: 20 orders per hour per IP
require_once '../../middleware/RateLimit.php';
RateLimit::apply(null, 20, 3600);

// Capturar TODOS los errores
try {

require_once '../../config/config.php';
require_once '../../config/database.php';
require_once '../../models/Order.php';
require_once '../../middleware/Auth.php';

// Verificar autenticación (opcional para clientes)
$user = null;
try {
    $user = Auth::user();
} catch (Exception $e) {
    // Si no está autenticado, continuamos como invitado
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit();
}

$rawInput = file_get_contents("php://input");
$data = json_decode($rawInput, true);

// Log temporal para debug
error_log("=== DEBUG ORDERS CREATE ===");
error_log("Raw Input: " . $rawInput);
error_log("Decoded Data: " . print_r($data, true));

if (!$data) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Datos inválidos', 'raw' => $rawInput]);
    exit();
}

// Validar campos requeridos
$required = ['customer_name', 'customer_phone', 'customer_email', 'delivery_address', 'delivery_zone_id', 'payment_method', 'items'];
foreach ($required as $field) {
    if (empty($data[$field])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => "Campo requerido: $field"]);
        exit();
    }
}

if (empty($data['items']) || !is_array($data['items'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Debe incluir al menos un producto']);
    exit();
}

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Iniciar transacción
    $db->beginTransaction();
    
    $order = new Order($db);
    
    // Calcular totales
    $subtotal = 0;
    foreach ($data['items'] as $item) {
        $subtotal += floatval($item['price']) * intval($item['quantity']);
    }
    
    // Obtener tarifa de delivery de la zona
    $zoneQuery = "SELECT delivery_cost FROM delivery_zones WHERE id = :id";
    $zoneStmt = $db->prepare($zoneQuery);
    $zoneStmt->bindParam(':id', $data['delivery_zone_id']);
    $zoneStmt->execute();
    $zone = $zoneStmt->fetch(PDO::FETCH_ASSOC);
    
    $deliveryFee = $zone ? floatval($zone['delivery_cost']) : 2.00;
    
    // Validar y aplicar cupón si se proporciona
    $discount = 0;
    $coupon_id = null;
    $coupon_code = null;
    
    if (!empty($data['coupon_code'])) {
        $couponCode = strtoupper(trim($data['coupon_code']));
        
        // Buscar y validar cupón
        $couponQuery = "SELECT * FROM coupons 
                        WHERE code = :code 
                        AND is_active = 1 
                        AND (valid_from IS NULL OR valid_from <= NOW())
                        AND (valid_until IS NULL OR valid_until >= NOW())";
        $couponStmt = $db->prepare($couponQuery);
        $couponStmt->bindParam(':code', $couponCode);
        $couponStmt->execute();
        $coupon = $couponStmt->fetch(PDO::FETCH_ASSOC);
        
        if ($coupon) {
            // Verificar límite de uso
            $canUse = true;
            if ($coupon['usage_limit'] && $coupon['usage_count'] >= $coupon['usage_limit']) {
                $canUse = false;
            }
            
            // Verificar monto mínimo
            if ($coupon['min_order_amount'] && $subtotal < $coupon['min_order_amount']) {
                $canUse = false;
            }
            
            if ($canUse) {
                // Calcular descuento
                if ($coupon['discount_type'] === 'percentage') {
                    $discount = ($subtotal * $coupon['discount_value']) / 100;
                    
                    // Aplicar descuento máximo si existe
                    if ($coupon['max_discount'] && $discount > $coupon['max_discount']) {
                        $discount = floatval($coupon['max_discount']);
                    }
                } else if ($coupon['discount_type'] === 'fixed') {
                    $discount = floatval($coupon['discount_value']);
                    
                    // El descuento no puede ser mayor al subtotal
                    if ($discount > $subtotal) {
                        $discount = $subtotal;
                    }
                }
                
                $coupon_id = $coupon['id'];
                $coupon_code = $coupon['code'];
            }
        }
    }
    
    $total = $subtotal + $deliveryFee - $discount;
    
    // Crear orden
    $order->user_id = ($user && isset($user['id'])) ? $user['id'] : null;
    $order->delivery_zone_id = $data['delivery_zone_id'];
    $order->order_number = $order->generateOrderNumber();
    $order->delivery_type = 'delivery';
    $order->status = 'pending';
    $order->subtotal = $subtotal;
    $order->delivery_cost = $deliveryFee;
    $order->discount = $discount;
    $order->total = $total;
    $order->customer_name = $data['customer_name'];
    $order->customer_phone = $data['customer_phone'];
    $order->customer_email = $data['customer_email'];
    $order->delivery_address = $data['delivery_address'];
    $order->delivery_reference = $data['address_reference'] ?? '';
    $order->delivery_latitude = null;
    $order->delivery_longitude = null;
    $order->payment_method = $data['payment_method'];
    $order->payment_status = 'pending';
    $order->customer_notes = $data['notes'] ?? '';
    $order->coupon_code = $coupon_code;
    
    if (!$order->create()) {
        throw new Exception('Error al crear la orden');
    }
    
    // Si se usó un cupón válido, registrar el uso
    if ($coupon_id && $discount > 0) {
        // Incrementar contador de uso del cupón
        $updateCouponQuery = "UPDATE coupons SET usage_count = usage_count + 1 WHERE id = :coupon_id";
        $updateCouponStmt = $db->prepare($updateCouponQuery);
        $updateCouponStmt->bindParam(':coupon_id', $coupon_id);
        $updateCouponStmt->execute();
        
        // Registrar el uso en coupon_usage
        $user_id_for_coupon = ($user && isset($user['id'])) ? $user['id'] : null;
        $usageQuery = "INSERT INTO coupon_usage (coupon_id, order_id, user_id, discount_amount, used_at) 
                       VALUES (:coupon_id, :order_id, :user_id, :discount_amount, NOW())";
        $usageStmt = $db->prepare($usageQuery);
        $usageStmt->bindParam(':coupon_id', $coupon_id);
        $usageStmt->bindParam(':order_id', $order->id);
        $usageStmt->bindParam(':user_id', $user_id_for_coupon);
        $usageStmt->bindParam(':discount_amount', $discount);
        $usageStmt->execute();
    }
    
    // Insertar items de la orden
    $itemQuery = "INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, total_price, special_instructions)
                  VALUES (:order_id, :product_id, :product_name, :quantity, :unit_price, :total_price, :special_instructions)";
    $itemStmt = $db->prepare($itemQuery);
    
    foreach ($data['items'] as $item) {
        $itemTotal = floatval($item['price']) * intval($item['quantity']);
        
        // Aceptar tanto 'id' como 'product_id', y 'name' como 'product_name'
        $productId = $item['product_id'] ?? $item['id'] ?? null;
        $productName = $item['product_name'] ?? $item['name'] ?? '';
        
        $itemStmt->execute([
            ':order_id' => $order->id,
            ':product_id' => $productId,
            ':product_name' => $productName,
            ':quantity' => $item['quantity'],
            ':unit_price' => $item['price'],
            ':total_price' => $itemTotal,
            ':special_instructions' => $item['notes'] ?? $item['special_instructions'] ?? ''
        ]);
    }
    
    // Confirmar transacción
    $db->commit();
    
    // Enviar email de confirmación al cliente
    try {
        require_once '../../services/EmailService.php';
        $emailService = new EmailService();
        
        $orderData = [
            'order_number' => $order->order_number,
            'total' => $total,
            'delivery_address' => $data['delivery_address'],
            'payment_method' => $data['payment_method']
        ];
        
        $customerData = [
            'name' => $data['customer_name'],
            'email' => $data['customer_email']
        ];
        
        $emailService->sendOrderConfirmation($orderData, $customerData);
        
    } catch (Exception $emailError) {
        // Log error but don't fail the order
        error_log("Email send failed: " . $emailError->getMessage());
    }
    
    // 🔔 NOTIFICACIÓN EN TIEMPO REAL - Nueva orden a todos los admins
    try {
        require_once '../../utils/NotificationHelper.php';
        NotificationHelper::notifyNewOrder([
            'id' => $order->id,
            'order_number' => $order->order_number,
            'customer_name' => $data['customer_name'],
            'customer_email' => $data['customer_email'],
            'total' => $total,
            'payment_method' => $data['payment_method'],
            'delivery_address' => $data['delivery_address']
        ]);
    } catch (Exception $notifError) {
        // Log error but don't fail the order
        error_log("Notification send failed: " . $notifError->getMessage());
    }
    
    http_response_code(201);
    echo json_encode([
        'success' => true,
        'message' => 'Orden creada exitosamente',
        'data' => [
            'order_id' => $order->id,
            'order_number' => $order->order_number,
            'subtotal' => $subtotal,
            'delivery_cost' => $deliveryFee,
            'discount' => $discount,
            'total' => $total,
            'coupon_applied' => $coupon_code ? true : false,
            'coupon_code' => $coupon_code
        ]
    ]);
    
} catch (Exception $e) {
    if (isset($db)) {
        $db->rollBack();
    }
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'Error del servidor: ' . $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine(),
        'trace' => $e->getTraceAsString(),
        'data_received' => $data ?? null
    ]);
}

// Capturar errores GLOBALES al inicio del archivo
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'ERROR FATAL: ' . $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine(),
        'trace' => $e->getTraceAsString(),
        'type' => get_class($e)
    ]);
}
?>