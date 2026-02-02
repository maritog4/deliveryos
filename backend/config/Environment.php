<?php
/**
 * Environment Configuration Loader
 * Loads and manages environment variables from .env file
 */
class Environment {
    private static $loaded = false;
    private static $config = [];

    /**
     * Load environment variables from .env file
     */
    public static function load($path = null) {
        if (self::$loaded) {
            return;
        }

        if ($path === null) {
            $path = __DIR__ . '/../.env';
        }

        if (!file_exists($path)) {
            throw new Exception(".env file not found at: $path");
        }

        $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        
        foreach ($lines as $line) {
            // Skip comments
            if (strpos(trim($line), '#') === 0) {
                continue;
            }

            // Parse KEY=VALUE
            if (strpos($line, '=') !== false) {
                list($key, $value) = explode('=', $line, 2);
                $key = trim($key);
                $value = trim($value);

                // Remove quotes if present
                $value = trim($value, '"\'');

                // Store in config array
                self::$config[$key] = $value;

                // Set as environment variable
                putenv("$key=$value");
                $_ENV[$key] = $value;
                $_SERVER[$key] = $value;
            }
        }

        self::$loaded = true;
    }

    /**
     * Get environment variable value
     */
    public static function get($key, $default = null) {
        if (!self::$loaded) {
            self::load();
        }

        if (isset(self::$config[$key])) {
            return self::$config[$key];
        }

        $value = getenv($key);
        if ($value !== false) {
            return $value;
        }

        return $default;
    }

    /**
     * Check if environment is production
     */
    public static function isProduction() {
        return self::get('APP_ENV', 'development') === 'production';
    }

    /**
     * Check if debug mode is enabled
     */
    public static function isDebug() {
        return self::get('APP_DEBUG', 'false') === 'true';
    }

    /**
     * Get all environment variables
     */
    public static function all() {
        if (!self::$loaded) {
            self::load();
        }
        return self::$config;
    }
}
