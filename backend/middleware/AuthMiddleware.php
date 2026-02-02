<?php
/**
 * Middleware de Autenticación JWT
 * Valida tokens JWT y protege endpoints
 */

require_once __DIR__ . '/../vendor/autoload.php';
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class AuthMiddleware {
    private static $secret_key = "tu_clave_secreta_super_segura_2024";
    private static $algorithm = 'HS256';
    
    /**
     * Verifica si el usuario está autenticado
     * @return object|false Datos del usuario o false si no está autenticado
     */
    public static function authenticate() {
        $headers = getallheaders();
        
        if (!isset($headers['Authorization'])) {
            return false;
        }
        
        $authHeader = $headers['Authorization'];
        $arr = explode(" ", $authHeader);
        
        if (count($arr) !== 2 || $arr[0] !== 'Bearer') {
            return false;
        }
        
        $jwt = $arr[1];
        
        try {
            $decoded = JWT::decode($jwt, new Key(self::$secret_key, self::$algorithm));
            return $decoded;
        } catch (Exception $e) {
            return false;
        }
    }
    
    /**
     * Verifica si el usuario tiene el rol requerido
     * @param array $allowedRoles Roles permitidos
     * @return object|null Datos del usuario o null si no tiene permiso
     */
    public static function checkRole($allowedRoles = []) {
        $user = self::authenticate();
        
        if (!$user) {
            http_response_code(401);
            echo json_encode([
                "success" => false,
                "message" => "No autorizado. Token inválido o expirado."
            ]);
            exit();
        }
        
        if (!empty($allowedRoles) && !in_array($user->role, $allowedRoles)) {
            http_response_code(403);
            echo json_encode([
                "success" => false,
                "message" => "Acceso denegado. No tienes permisos suficientes."
            ]);
            exit();
        }
        
        return $user;
    }
    
    /**
     * Genera un nuevo token JWT
     * @param array $userData Datos del usuario
     * @return string Token JWT
     */
    public static function generateToken($userData) {
        $issuedAt = time();
        $expirationTime = $issuedAt + (60 * 60 * 24 * 7); // 7 días
        
        $payload = [
            'iat' => $issuedAt,
            'exp' => $expirationTime,
            'id' => $userData['id'],
            'email' => $userData['email'],
            'name' => $userData['name'],
            'role' => $userData['role']
        ];
        
        return JWT::encode($payload, self::$secret_key, self::$algorithm);
    }
}
