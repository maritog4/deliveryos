<?php
/**
 * Stripe Payment Service
 * Handles payment processing with Stripe
 */

require_once __DIR__ . '/../config/Environment.php';
require_once __DIR__ . '/../vendor/stripe/init.php';

Environment::load();

class StripeService {
    private $stripe;
    private $secretKey;
    private $publishableKey;

    public function __construct() {
        $this->secretKey = Environment::get('STRIPE_SECRET_KEY');
        $this->publishableKey = Environment::get('STRIPE_PUBLISHABLE_KEY');
        
        if (empty($this->secretKey)) {
            throw new Exception("Stripe secret key not configured");
        }

        \Stripe\Stripe::setApiKey($this->secretKey);
    }

    /**
     * Create a payment intent
     * 
     * @param float $amount Amount in dollars
     * @param string $currency Currency code (default: usd)
     * @param array $metadata Additional metadata
     * @return array Payment intent data
     */
    public function createPaymentIntent($amount, $currency = 'usd', $metadata = []) {
        try {
            // Convert amount to cents
            $amountInCents = intval($amount * 100);

            $intent = \Stripe\PaymentIntent::create([
                'amount' => $amountInCents,
                'currency' => $currency,
                'metadata' => $metadata,
                'automatic_payment_methods' => [
                    'enabled' => true,
                ],
            ]);

            return [
                'success' => true,
                'client_secret' => $intent->client_secret,
                'payment_intent_id' => $intent->id,
                'amount' => $amount,
                'currency' => $currency
            ];

        } catch (\Stripe\Exception\ApiErrorException $e) {
            error_log("Stripe Payment Intent Error: " . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Retrieve payment intent status
     * 
     * @param string $paymentIntentId Payment Intent ID
     * @return array Payment intent data
     */
    public function getPaymentIntent($paymentIntentId) {
        try {
            $intent = \Stripe\PaymentIntent::retrieve($paymentIntentId);

            return [
                'success' => true,
                'id' => $intent->id,
                'status' => $intent->status,
                'amount' => $intent->amount / 100, // Convert from cents
                'currency' => $intent->currency,
                'payment_method' => $intent->payment_method,
                'created' => $intent->created
            ];

        } catch (\Stripe\Exception\ApiErrorException $e) {
            error_log("Stripe Retrieve Intent Error: " . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Confirm a payment intent
     * 
     * @param string $paymentIntentId Payment Intent ID
     * @param string $paymentMethodId Payment Method ID
     * @return array Confirmation result
     */
    public function confirmPayment($paymentIntentId, $paymentMethodId) {
        try {
            $intent = \Stripe\PaymentIntent::retrieve($paymentIntentId);

            if ($intent->status === 'requires_payment_method') {
                $intent->confirm([
                    'payment_method' => $paymentMethodId
                ]);
            }

            return [
                'success' => true,
                'status' => $intent->status,
                'payment_intent_id' => $intent->id
            ];

        } catch (\Stripe\Exception\ApiErrorException $e) {
            error_log("Stripe Confirm Payment Error: " . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Cancel a payment intent
     * 
     * @param string $paymentIntentId Payment Intent ID
     * @return array Cancellation result
     */
    public function cancelPayment($paymentIntentId) {
        try {
            $intent = \Stripe\PaymentIntent::retrieve($paymentIntentId);
            
            if (in_array($intent->status, ['requires_payment_method', 'requires_confirmation', 'requires_action'])) {
                $intent->cancel();
                
                return [
                    'success' => true,
                    'message' => 'Payment cancelled successfully'
                ];
            }

            return [
                'success' => false,
                'error' => 'Payment cannot be cancelled in current status: ' . $intent->status
            ];

        } catch (\Stripe\Exception\ApiErrorException $e) {
            error_log("Stripe Cancel Payment Error: " . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Create a refund
     * 
     * @param string $paymentIntentId Payment Intent ID
     * @param float $amount Amount to refund (null for full refund)
     * @return array Refund result
     */
    public function createRefund($paymentIntentId, $amount = null) {
        try {
            $refundData = [
                'payment_intent' => $paymentIntentId
            ];

            if ($amount !== null) {
                $refundData['amount'] = intval($amount * 100); // Convert to cents
            }

            $refund = \Stripe\Refund::create($refundData);

            return [
                'success' => true,
                'refund_id' => $refund->id,
                'status' => $refund->status,
                'amount' => $refund->amount / 100
            ];

        } catch (\Stripe\Exception\ApiErrorException $e) {
            error_log("Stripe Refund Error: " . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Verify webhook signature
     * 
     * @param string $payload Webhook payload
     * @param string $signature Stripe signature header
     * @return object|false Event object or false on failure
     */
    public function verifyWebhook($payload, $signature) {
        $webhookSecret = Environment::get('STRIPE_WEBHOOK_SECRET');
        
        if (empty($webhookSecret)) {
            error_log("Stripe webhook secret not configured");
            return false;
        }

        try {
            $event = \Stripe\Webhook::constructEvent(
                $payload,
                $signature,
                $webhookSecret
            );

            return $event;

        } catch (\UnexpectedValueException $e) {
            error_log("Stripe Webhook Invalid Payload: " . $e->getMessage());
            return false;
        } catch (\Stripe\Exception\SignatureVerificationException $e) {
            error_log("Stripe Webhook Invalid Signature: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Get publishable key for frontend
     * 
     * @return string Publishable key
     */
    public function getPublishableKey() {
        return $this->publishableKey;
    }
}
