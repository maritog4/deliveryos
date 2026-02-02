<?php
/**
 * Rate Limiting Middleware
 * Prevents DDoS attacks and abuse by limiting requests per IP
 */
class RateLimit {
    private static $storage = [];
    private static $storageFile = null;

    /**
     * Initialize rate limiter
     */
    public static function init() {
        if (self::$storageFile === null) {
            self::$storageFile = __DIR__ . '/../logs/rate_limit.json';
            
            // Create logs directory if it doesn't exist
            $logDir = dirname(self::$storageFile);
            if (!file_exists($logDir)) {
                mkdir($logDir, 0755, true);
            }

            // Load existing data
            if (file_exists(self::$storageFile)) {
                $data = file_get_contents(self::$storageFile);
                self::$storage = json_decode($data, true) ?: [];
            }
        }
    }

    /**
     * Check if request should be rate limited
     * 
     * @param string $identifier User IP or user ID
     * @param int $maxRequests Maximum requests allowed
     * @param int $windowSeconds Time window in seconds
     * @return bool True if rate limit exceeded
     */
    public static function check($identifier = null, $maxRequests = 100, $windowSeconds = 3600) {
        self::init();

        // Get identifier (IP address if not provided)
        if ($identifier === null) {
            $identifier = self::getClientIP();
        }

        $key = md5($identifier);
        $now = time();

        // Clean old entries
        self::cleanup();

        // Get current requests for this identifier
        if (!isset(self::$storage[$key])) {
            self::$storage[$key] = [
                'count' => 0,
                'reset_at' => $now + $windowSeconds,
                'requests' => []
            ];
        }

        $entry = &self::$storage[$key];

        // Reset counter if window expired
        if ($now >= $entry['reset_at']) {
            $entry = [
                'count' => 0,
                'reset_at' => $now + $windowSeconds,
                'requests' => []
            ];
        }

        // Remove requests outside the window
        $entry['requests'] = array_filter($entry['requests'], function($timestamp) use ($now, $windowSeconds) {
            return ($now - $timestamp) < $windowSeconds;
        });

        // Count current requests
        $entry['count'] = count($entry['requests']);

        // Check if limit exceeded
        if ($entry['count'] >= $maxRequests) {
            self::save();
            return true; // Rate limit exceeded
        }

        // Add new request
        $entry['requests'][] = $now;
        $entry['count']++;

        self::save();
        return false; // Request allowed
    }

    /**
     * Apply rate limiting and return 429 if exceeded
     */
    public static function apply($identifier = null, $maxRequests = 100, $windowSeconds = 3600) {
        if (self::check($identifier, $maxRequests, $windowSeconds)) {
            http_response_code(429);
            header('Content-Type: application/json');
            header('Retry-After: ' . $windowSeconds);
            
            echo json_encode([
                'success' => false,
                'message' => 'Too many requests. Please try again later.',
                'retry_after' => $windowSeconds
            ]);
            exit;
        }
    }

    /**
     * Get client IP address
     */
    private static function getClientIP() {
        $ipKeys = [
            'HTTP_CF_CONNECTING_IP', // CloudFlare
            'HTTP_X_FORWARDED_FOR',
            'HTTP_X_REAL_IP',
            'REMOTE_ADDR'
        ];

        foreach ($ipKeys as $key) {
            if (isset($_SERVER[$key])) {
                $ip = $_SERVER[$key];
                
                // Get first IP if multiple
                if (strpos($ip, ',') !== false) {
                    $ips = explode(',', $ip);
                    $ip = trim($ips[0]);
                }

                if (filter_var($ip, FILTER_VALIDATE_IP)) {
                    return $ip;
                }
            }
        }

        return '0.0.0.0';
    }

    /**
     * Clean up old entries
     */
    private static function cleanup() {
        $now = time();
        foreach (self::$storage as $key => $entry) {
            if ($now >= $entry['reset_at'] && empty($entry['requests'])) {
                unset(self::$storage[$key]);
            }
        }
    }

    /**
     * Save storage to file
     */
    private static function save() {
        file_put_contents(self::$storageFile, json_encode(self::$storage));
    }

    /**
     * Get remaining requests for identifier
     */
    public static function getRemaining($identifier = null, $maxRequests = 100) {
        self::init();
        
        if ($identifier === null) {
            $identifier = self::getClientIP();
        }

        $key = md5($identifier);
        
        if (!isset(self::$storage[$key])) {
            return $maxRequests;
        }

        return max(0, $maxRequests - self::$storage[$key]['count']);
    }

    /**
     * Reset rate limit for identifier
     */
    public static function reset($identifier = null) {
        self::init();
        
        if ($identifier === null) {
            $identifier = self::getClientIP();
        }

        $key = md5($identifier);
        unset(self::$storage[$key]);
        self::save();
    }
}
