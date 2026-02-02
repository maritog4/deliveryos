<?php
/**
 * Create Stripe Payment Intent
 * Creates a payment intent for processing credit card payments
 */

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../../services/StripeService.php';
require_once '../../middleware/RateLimit.php';

// Apply rate limiting
RateLimit::apply(null, 20, 3600);

try {
    $data = json_decode(file_get_contents("php://input"));

    if (!isset($data->amount) || $data->amount <= 0) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Invalid amount'
        ]);
        exit;
    }

    $stripeService = new StripeService();

    // Prepare metadata
    $metadata = [
        'order_id' => $data->order_id ?? null,
        'customer_email' => $data->customer_email ?? null,
        'customer_name' => $data->customer_name ?? null
    ];

    // Create payment intent
    $result = $stripeService->createPaymentIntent(
        floatval($data->amount),
        $data->currency ?? 'usd',
        $metadata
    );

    if ($result['success']) {
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'client_secret' => $result['client_secret'],
            'payment_intent_id' => $result['payment_intent_id']
        ]);
    } else {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Failed to create payment intent',
            'error' => $result['error']
        ]);
    }

} catch (Exception $e) {
    error_log("Payment Intent Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server error'
    ]);
}
