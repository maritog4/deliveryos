<?php
/**
 * Auth Middleware
 * Verify JWT token and user authentication
 */

require_once __DIR__ . '/JWT.php';

class Auth {
    
    /**
     * Verify if user is authenticated
     */
    public static function check() {
        $user = JWT::getUserFromToken();
        
        if (!$user) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'No autorizado. Token inválido o expirado.']);
            exit();
        }
        
        return $user;
    }
    
    /**
     * Verify if user has specific role
     */
    public static function checkRole($allowedRoles = []) {
        $user = self::check();
        
        if (!in_array($user['role'], $allowedRoles)) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'No tienes permiso para acceder a este recurso.']);
            exit();
        }
        
        return $user;
    }
    
    /**
     * Verify admin role
     */
    public static function checkAdmin() {
        return self::checkRole([ROLE_ADMIN]);
    }
    
    /**
     * Verify customer role
     */
    public static function checkCustomer() {
        return self::checkRole([ROLE_CUSTOMER]);
    }
    
    /**
     * Verify driver role
     */
    public static function checkDriver() {
        return self::checkRole([ROLE_DRIVER]);
    }
    
    /**
     * Get current authenticated user (optional - doesn't fail if not auth)
     */
    public static function user() {
        return JWT::getUserFromToken();
    }
}
?>
