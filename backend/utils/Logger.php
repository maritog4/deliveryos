<?php
/**
 * Sistema de Logging
 * Registra actividades importantes del sistema
 */

class Logger {
    private static $logFile = __DIR__ . '/../logs/app.log';
    private static $errorFile = __DIR__ . '/../logs/errors.log';
    
    /**
     * Niveles de log
     */
    const INFO = 'INFO';
    const WARNING = 'WARNING';
    const ERROR = 'ERROR';
    const DEBUG = 'DEBUG';
    const SECURITY = 'SECURITY';
    
    /**
     * Registra un mensaje en el log
     */
    public static function log($message, $level = self::INFO, $context = []) {
        $logDir = dirname(self::$logFile);
        if (!is_dir($logDir)) {
            mkdir($logDir, 0777, true);
        }
        
        $timestamp = date('Y-m-d H:i:s');
        $contextStr = !empty($context) ? json_encode($context) : '';
        $logMessage = "[$timestamp] [$level] $message $contextStr" . PHP_EOL;
        
        $file = ($level === self::ERROR) ? self::$errorFile : self::$logFile;
        file_put_contents($file, $logMessage, FILE_APPEND);
    }
    
    /**
     * Log de información
     */
    public static function info($message, $context = []) {
        self::log($message, self::INFO, $context);
    }
    
    /**
     * Log de advertencia
     */
    public static function warning($message, $context = []) {
        self::log($message, self::WARNING, $context);
    }
    
    /**
     * Log de error
     */
    public static function error($message, $context = []) {
        self::log($message, self::ERROR, $context);
    }
    
    /**
     * Log de debug
     */
    public static function debug($message, $context = []) {
        self::log($message, self::DEBUG, $context);
    }
    
    /**
     * Log de seguridad
     */
    public static function security($message, $context = []) {
        self::log($message, self::SECURITY, $context);
    }
    
    /**
     * Registra actividad de usuario
     */
    public static function userActivity($userId, $action, $details = []) {
        self::info("Usuario $userId: $action", $details);
    }
    
    /**
     * Registra intento de acceso no autorizado
     */
    public static function unauthorizedAccess($ip, $endpoint, $details = []) {
        self::security("Acceso no autorizado desde $ip a $endpoint", $details);
    }
}
