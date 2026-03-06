<?php
// Database Connection File
require_once 'config.php';

class Database {
    private $host = DB_HOST;
    private $user = DB_USER;
    private $pass = DB_PASS;
    private $dbname = DB_NAME;
    private $conn;

    public function __construct() {
        $this->connect();
    }

    private function connect() {
        try {
            // First, try to connect without selecting database (to check if MySQL is running)
            $this->conn = @new mysqli($this->host, $this->user, $this->pass);
            
            if ($this->conn->connect_error) {
                $errorMsg = $this->conn->connect_error;
                
                // Check if MySQL service is running
                if (strpos($errorMsg, '2002') !== false || strpos($errorMsg, 'actively refused') !== false) {
                    throw new Exception("MySQL server is not running. Please start MySQL service in XAMPP Control Panel.");
                }
                
                throw new Exception("Connection failed: " . $errorMsg);
            }
            
            // Create database if it doesn't exist
            $this->conn->query("CREATE DATABASE IF NOT EXISTS " . $this->dbname);
            
            // Now select the database
            $this->conn->select_db($this->dbname);
            
            // Set charset to utf8mb4 for proper character encoding
            $this->conn->set_charset("utf8mb4");
            
        } catch (Exception $e) {
            // Don't die immediately - allow graceful error handling
            $this->conn = null;
            error_log("Database connection error: " . $e->getMessage());
            throw $e;
        }
    }

    public function getConnection() {
        return $this->conn;
    }
    
    public function isConnected() {
        return $this->conn !== null && !$this->conn->connect_error;
    }

    public function query($sql) {
        if (!$this->conn) {
            throw new Exception("Database connection not available");
        }
        return $this->conn->query($sql);
    }

    public function prepare($sql) {
        if (!$this->conn) {
            throw new Exception("Database connection not available");
        }
        return $this->conn->prepare($sql);
    }

    public function escape($string) {
        if (!$this->conn) {
            throw new Exception("Database connection not available");
        }
        return $this->conn->real_escape_string($string);
    }

    public function close() {
        if ($this->conn) {
            $this->conn->close();
        }
    }

    public function __destruct() {
        $this->close();
    }
}

// Create global database instance (with error handling)
try {
    $db = new Database();
} catch (Exception $e) {
    // Set $db to null if connection fails
    $db = null;
    // Log error but don't die - let individual pages handle errors
    error_log("Failed to initialize database: " . $e->getMessage());
}
?>
