<?php
/**
 * Get Stripe Configuration
 * Returns publishable key for frontend
 */

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../../services/StripeService.php';

try {
    $stripeService = new StripeService();

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'publishable_key' => $stripeService->getPublishableKey()
    ]);

} catch (Exception $e) {
    error_log("Stripe Config Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to load payment configuration'
    ]);
}
