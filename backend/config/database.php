<?php
/**
 * Database Configuration
 * Uses Environment variables for secure credential management
 */

// Load environment variables
require_once __DIR__ . '/Environment.php';
Environment::load();

class Database {
    private $host;
    private $db_name;
    private $username;
    private $password;
    private $port;
    private $conn;

    public function __construct() {
        // Load from environment variables with fallbacks for development
        $this->host = Environment::get('DB_HOST', 'localhost');
        $this->db_name = Environment::get('DB_NAME', 'deliverysv');
        $this->username = Environment::get('DB_USER', 'root');
        $this->password = Environment::get('DB_PASS', 'mysql');
        $this->port = Environment::get('DB_PORT', '3306');
    }

    /**
     * Get database connection
     */
    public function getConnection() {
        $this->conn = null;

        try {
            $dsn = "mysql:host=" . $this->host . ";port=" . $this->port . ";dbname=" . $this->db_name;
            $this->conn = new PDO($dsn, $this->username, $this->password);
            
            $this->conn->exec("set names utf8mb4");
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
            $this->conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
            
        } catch(PDOException $exception) {
            // Don't expose sensitive information in production
            if (Environment::isDebug()) {
                error_log("Database connection error: " . $exception->getMessage());
                throw new Exception("Database connection failed: " . $exception->getMessage());
            } else {
                error_log("Database connection error: " . $exception->getMessage());
                throw new Exception("Database connection failed. Please contact support.");
            }
        }

        return $this->conn;
    }

    /**
     * Test database connection
     */
    public function testConnection() {
        try {
            $conn = $this->getConnection();
            return $conn !== null;
        } catch(Exception $e) {
            return false;
        }
    }
}
?>
