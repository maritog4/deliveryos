<?php
/**
 * Email Service
 * Handles all transactional emails using SendGrid or SMTP
 */

require_once __DIR__ . '/../config/Environment.php';
Environment::load();

class EmailService {
    private $apiKey;
    private $fromEmail;
    private $fromName;
    private $enabled;

    public function __construct() {
        $this->apiKey = Environment::get('SENDGRID_API_KEY');
        $this->fromEmail = Environment::get('EMAIL_FROM', 'noreply@tudominio.com');
        $this->fromName = Environment::get('EMAIL_FROM_NAME', 'Delivery System');
        $this->enabled = !empty($this->apiKey);
    }

    /**
     * Send email using SendGrid API
     */
    private function sendViaAPI($to, $subject, $htmlContent, $textContent = null) {
        if (!$this->enabled) {
            error_log("Email not sent: SendGrid API key not configured");
            return false;
        }

        $data = [
            'personalizations' => [[
                'to' => [['email' => $to]],
                'subject' => $subject
            ]],
            'from' => [
                'email' => $this->fromEmail,
                'name' => $this->fromName
            ],
            'content' => [
                [
                    'type' => 'text/html',
                    'value' => $htmlContent
                ]
            ]
        ];

        if ($textContent) {
            $data['content'][] = [
                'type' => 'text/plain',
                'value' => $textContent
            ];
        }

        $ch = curl_init('https://api.sendgrid.com/v3/mail/send');
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $this->apiKey,
            'Content-Type: application/json'
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode >= 200 && $httpCode < 300) {
            error_log("Email sent successfully to: $to");
            return true;
        } else {
            error_log("Email send failed: HTTP $httpCode - $response");
            return false;
        }
    }

    /**
     * Send order confirmation email
     */
    public function sendOrderConfirmation($order, $customer) {
        $subject = "Pedido #{$order['order_number']} confirmado";
        
        $html = $this->getOrderConfirmationTemplate($order, $customer);
        
        return $this->sendViaAPI($customer['email'], $subject, $html);
    }

    /**
     * Send order status update email
     */
    public function sendOrderStatusUpdate($order, $customer, $newStatus) {
        $statusMessages = [
            'confirmed' => 'Tu pedido ha sido confirmado',
            'preparing' => 'Tu pedido está siendo preparado',
            'ready' => 'Tu pedido está listo',
            'picked_up' => 'El repartidor ha recogido tu pedido',
            'on_the_way' => 'Tu pedido está en camino',
            'delivered' => '¡Tu pedido ha sido entregado!',
            'cancelled' => 'Tu pedido ha sido cancelado'
        ];

        $subject = $statusMessages[$newStatus] ?? "Actualización de pedido #{$order['order_number']}";
        
        $html = $this->getStatusUpdateTemplate($order, $customer, $newStatus, $statusMessages[$newStatus]);
        
        return $this->sendViaAPI($customer['email'], $subject, $html);
    }

    /**
     * Send password reset email
     */
    public function sendPasswordReset($user, $resetToken) {
        $subject = "Restablecer contraseña";
        $resetUrl = Environment::get('APP_URL') . "/reset-password?token=" . $resetToken;
        
        $html = $this->getPasswordResetTemplate($user, $resetUrl);
        
        return $this->sendViaAPI($user['email'], $subject, $html);
    }

    /**
     * Send new order notification to admin
     */
    public function notifyAdminNewOrder($order, $adminEmail) {
        $subject = "Nueva orden recibida - #{$order['order_number']}";
        
        $html = $this->getAdminOrderNotificationTemplate($order);
        
        return $this->sendViaAPI($adminEmail, $subject, $html);
    }

    /**
     * Send order assignment notification to driver
     */
    public function notifyDriverAssignment($order, $driver) {
        $subject = "Nueva orden asignada - #{$order['order_number']}";
        
        $html = $this->getDriverAssignmentTemplate($order, $driver);
        
        return $this->sendViaAPI($driver['email'], $subject, $html);
    }

    /**
     * Order Confirmation Email Template
     */
    private function getOrderConfirmationTemplate($order, $customer) {
        $appUrl = Environment::get('APP_URL', 'http://localhost:5173');
        
        return "
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='UTF-8'>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
                .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
                .item { padding: 10px 0; border-bottom: 1px solid #e2e8f0; }
                .total { font-size: 1.5em; font-weight: bold; color: #0ea5e9; margin-top: 20px; }
                .button { display: inline-block; background: #0ea5e9; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
                .footer { text-align: center; color: #64748b; font-size: 0.9em; margin-top: 30px; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h1>🎉 ¡Pedido Confirmado!</h1>
                </div>
                <div class='content'>
                    <p>Hola <strong>{$customer['name']}</strong>,</p>
                    <p>Hemos recibido tu pedido y está siendo procesado.</p>
                    
                    <div class='order-details'>
                        <h2>Orden #{$order['order_number']}</h2>
                        <p><strong>Estado:</strong> Confirmado</p>
                        <p><strong>Total:</strong> <span class='total'>\${$order['total']}</span></p>
                        <p><strong>Dirección de entrega:</strong><br>{$order['delivery_address']}</p>
                        <p><strong>Método de pago:</strong> " . ucfirst($order['payment_method']) . "</p>
                    </div>
                    
                    <p>Te notificaremos cuando tu pedido esté listo y en camino.</p>
                    
                    <center>
                        <a href='{$appUrl}/my-orders' class='button'>Ver mi pedido</a>
                    </center>
                    
                    <div class='footer'>
                        <p>Gracias por tu preferencia</p>
                        <p>Si tienes alguna pregunta, contáctanos</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
        ";
    }

    /**
     * Status Update Email Template
     */
    private function getStatusUpdateTemplate($order, $customer, $status, $message) {
        $appUrl = Environment::get('APP_URL', 'http://localhost:5173');
        
        $statusEmojis = [
            'confirmed' => '✅',
            'preparing' => '👨‍🍳',
            'ready' => '🎉',
            'picked_up' => '📦',
            'on_the_way' => '🚚',
            'delivered' => '✨',
            'cancelled' => '❌'
        ];

        $emoji = $statusEmojis[$status] ?? '📦';
        
        return "
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='UTF-8'>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
                .status-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
                .button { display: inline-block; background: #0ea5e9; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h1>$emoji $message</h1>
                </div>
                <div class='content'>
                    <p>Hola <strong>{$customer['name']}</strong>,</p>
                    
                    <div class='status-box'>
                        <h2>Orden #{$order['order_number']}</h2>
                        <p style='font-size: 1.2em; color: #0ea5e9;'><strong>$message</strong></p>
                    </div>
                    
                    " . ($status === 'on_the_way' ? "<p>Puedes rastrear tu pedido en tiempo real usando el mapa en nuestra app.</p>" : "") . "
                    
                    <center>
                        <a href='{$appUrl}/my-orders' class='button'>Ver mi pedido</a>
                    </center>
                </div>
            </div>
        </body>
        </html>
        ";
    }

    /**
     * Password Reset Email Template
     */
    private function getPasswordResetTemplate($user, $resetUrl) {
        return "
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='UTF-8'>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
                .button { display: inline-block; background: #0ea5e9; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
                .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h1>🔐 Restablecer Contraseña</h1>
                </div>
                <div class='content'>
                    <p>Hola <strong>{$user['name']}</strong>,</p>
                    <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta.</p>
                    
                    <center>
                        <a href='$resetUrl' class='button'>Restablecer Contraseña</a>
                    </center>
                    
                    <div class='warning'>
                        <p><strong>⚠️ Importante:</strong></p>
                        <ul>
                            <li>Este enlace expira en 1 hora</li>
                            <li>Si no solicitaste este cambio, ignora este email</li>
                            <li>Nunca compartas este enlace con nadie</li>
                        </ul>
                    </div>
                </div>
            </div>
        </body>
        </html>
        ";
    }

    /**
     * Admin Order Notification Template
     */
    private function getAdminOrderNotificationTemplate($order) {
        $appUrl = Environment::get('APP_URL', 'http://localhost:5173');
        
        return "
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='UTF-8'>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #10b981; color: white; padding: 20px; text-align: center; }
                .content { background: #f8fafc; padding: 20px; }
                .order-info { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #10b981; }
                .button { display: inline-block; background: #10b981; color: white; padding: 10px 25px; text-decoration: none; border-radius: 5px; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h2>🔔 Nueva Orden Recibida</h2>
                </div>
                <div class='content'>
                    <div class='order-info'>
                        <h3>Orden #{$order['order_number']}</h3>
                        <p><strong>Cliente:</strong> {$order['customer_name']}</p>
                        <p><strong>Teléfono:</strong> {$order['customer_phone']}</p>
                        <p><strong>Total:</strong> \${$order['total']}</p>
                        <p><strong>Pago:</strong> " . ucfirst($order['payment_method']) . "</p>
                    </div>
                    <center>
                        <a href='{$appUrl}/admin' class='button'>Ver en Panel Admin</a>
                    </center>
                </div>
            </div>
        </body>
        </html>
        ";
    }

    /**
     * Driver Assignment Notification Template
     */
    private function getDriverAssignmentTemplate($order, $driver) {
        $appUrl = Environment::get('APP_URL', 'http://localhost:5173');
        
        return "
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='UTF-8'>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #8b5cf6; color: white; padding: 20px; text-align: center; }
                .content { background: #f8fafc; padding: 20px; }
                .order-info { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #8b5cf6; }
                .button { display: inline-block; background: #8b5cf6; color: white; padding: 10px 25px; text-decoration: none; border-radius: 5px; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h2>🚚 Nueva Orden Asignada</h2>
                </div>
                <div class='content'>
                    <p>Hola <strong>{$driver['name']}</strong>,</p>
                    <p>Se te ha asignado una nueva orden para entregar:</p>
                    
                    <div class='order-info'>
                        <h3>Orden #{$order['order_number']}</h3>
                        <p><strong>Cliente:</strong> {$order['customer_name']}</p>
                        <p><strong>Teléfono:</strong> {$order['customer_phone']}</p>
                        <p><strong>Dirección:</strong> {$order['delivery_address']}</p>
                        <p><strong>Total:</strong> \${$order['total']}</p>
                    </div>
                    
                    <center>
                        <a href='{$appUrl}/driver' class='button'>Ver Detalles</a>
                    </center>
                </div>
            </div>
        </body>
        </html>
        ";
    }
}
