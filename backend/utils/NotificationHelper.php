<?php
/**
 * Helper para enviar notificaciones en tiempo real vía WebSocket
 * 
 * Uso:
 * require_once '../utils/NotificationHelper.php';
 * NotificationHelper::notifyNewOrder($orderData);
 */

class NotificationHelper {
    private static $wsUrl = 'http://localhost:3001';
    
    /**
     * Notificar nueva orden a admins
     */
    public static function notifyNewOrder($order) {
        $payload = [
            'event' => 'new_order',
            'data' => [
                'order_id' => $order['id'],
                'order_number' => $order['order_number'],
                'customer_name' => $order['customer_name'],
                'customer_email' => $order['customer_email'],
                'total' => $order['total'],
                'payment_method' => $order['payment_method'],
                'delivery_address' => $order['delivery_address']
            ]
        ];
        
        self::sendToWebSocket($payload);
    }
    
    /**
     * Notificar asignación de orden a repartidor
     */
    public static function notifyOrderAssigned($orderId, $orderNumber, $driverId, $customerName) {
        $payload = [
            'event' => 'order_assigned',
            'data' => [
                'orderId' => $orderId,
                'orderNumber' => $orderNumber,
                'driverId' => $driverId,
                'customerName' => $customerName
            ]
        ];
        
        self::sendToWebSocket($payload);
    }
    
    /**
     * Notificar cambio de estado a cliente
     */
    public static function notifyOrderStatusChanged($orderId, $orderNumber, $status, $customerId, $customerEmail = null) {
        $payload = [
            'event' => 'order_status_changed',
            'data' => [
                'orderId' => $orderId,
                'orderNumber' => $orderNumber,
                'status' => $status,
                'customerId' => $customerId,
                'customerEmail' => $customerEmail
            ]
        ];
        
        self::sendToWebSocket($payload);
    }
    
    /**
     * Enviar evento al servidor WebSocket
     */
    private static function sendToWebSocket($payload) {
        try {
            $ch = curl_init(self::$wsUrl . '/emit');
            curl_setopt($ch, CURLOPT_POST, 1);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
            curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 2); // Timeout corto para no bloquear
            
            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            
            curl_close($ch);
            
            if ($httpCode !== 200) {
                error_log("NotificationHelper: Error enviando notificación (HTTP $httpCode)");
            }
        } catch (Exception $e) {
            error_log("NotificationHelper: " . $e->getMessage());
        }
    }
}
