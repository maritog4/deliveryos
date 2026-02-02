<?php
/**
 * JWT Helper - JSON Web Token handler
 */

class JWT {
    
    /**
     * Encode JWT token
     */
    public static function encode($payload) {
        $header = json_encode(['typ' => 'JWT', 'alg' => JWT_ALGORITHM]);
        $payload = json_encode($payload);
        
        $base64UrlHeader = self::base64UrlEncode($header);
        $base64UrlPayload = self::base64UrlEncode($payload);
        
        $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, JWT_SECRET_KEY, true);
        $base64UrlSignature = self::base64UrlEncode($signature);
        
        return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
    }
    
    /**
     * Decode JWT token
     */
    public static function decode($jwt) {
        if (!$jwt) {
            return false;
        }
        
        $tokenParts = explode('.', $jwt);
        if (count($tokenParts) != 3) {
            return false;
        }
        
        $header = base64_decode($tokenParts[0]);
        $payload = base64_decode($tokenParts[1]);
        $signatureProvided = $tokenParts[2];
        
        // Verify signature
        $base64UrlHeader = self::base64UrlEncode($header);
        $base64UrlPayload = self::base64UrlEncode($payload);
        $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, JWT_SECRET_KEY, true);
        $base64UrlSignature = self::base64UrlEncode($signature);
        
        if ($base64UrlSignature !== $signatureProvided) {
            return false;
        }
        
        $payload = json_decode($payload, true);
        
        // Check expiration
        if (isset($payload['exp']) && $payload['exp'] < time()) {
            return false;
        }
        
        return $payload;
    }
    
    /**
     * Base64 URL encode
     */
    private static function base64UrlEncode($text) {
        return str_replace(
            ['+', '/', '='],
            ['-', '_', ''],
            base64_encode($text)
        );
    }
    
    /**
     * Generate token for user
     */
    public static function generateToken($user) {
        $payload = [
            'iat' => time(),
            'exp' => time() + (60 * 60 * 24 * 7), // 7 days
            'user_id' => $user['id'],
            'email' => $user['email'],
            'role' => $user['role']
        ];
        
        return self::encode($payload);
    }
    
    /**
     * Get user data from Authorization header
     */
    public static function getUserFromToken() {
        $headers = getallheaders();
        $authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : 
                     (isset($headers['authorization']) ? $headers['authorization'] : '');
        
        if (!$authHeader) {
            return false;
        }
        
        $arr = explode(" ", $authHeader);
        if (count($arr) != 2 || $arr[0] != 'Bearer') {
            return false;
        }
        
        $jwt = $arr[1];
        return self::decode($jwt);
    }
}
?>
