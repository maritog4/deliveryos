<?php
/**
 * Confirm Stripe Payment
 * Confirms a payment intent and updates order status
 */

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../../config/database.php';
require_once '../../services/StripeService.php';

try {
    $data = json_decode(file_get_contents("php://input"));

    if (!isset($data->payment_intent_id)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Payment intent ID required'
        ]);
        exit;
    }

    $stripeService = new StripeService();

    // Get payment intent status from Stripe
    $paymentIntent = $stripeService->getPaymentIntent($data->payment_intent_id);

    if (!$paymentIntent['success']) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Failed to verify payment',
            'error' => $paymentIntent['error']
        ]);
        exit;
    }

    // Check if payment was successful
    if ($paymentIntent['status'] !== 'succeeded') {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Payment not completed',
            'status' => $paymentIntent['status']
        ]);
        exit;
    }

    // Update order with payment information
    if (isset($data->order_id)) {
        $database = new Database();
        $db = $database->getConnection();

        $query = "UPDATE orders 
                  SET payment_intent_id = :payment_intent_id,
                      payment_status = 'paid',
                      paid_at = NOW()
                  WHERE id = :order_id";

        $stmt = $db->prepare($query);
        $stmt->bindParam(':payment_intent_id', $data->payment_intent_id);
        $stmt->bindParam(':order_id', $data->order_id);
        $stmt->execute();
    }

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Payment confirmed successfully',
        'payment_status' => $paymentIntent['status'],
        'amount' => $paymentIntent['amount']
    ]);

} catch (Exception $e) {
    error_log("Confirm Payment Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server error'
    ]);
}
