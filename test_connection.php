<?php
// Test Database Connection
// Access this file in browser: http://localhost/yaksha/yaksha2/yaksha_website/test_connection.php

require_once 'config.php';

echo "<h2>MySQL Connection Test</h2>";
echo "<hr>";

// Test 1: Check if MySQL extension is loaded
echo "<h3>1. PHP MySQL Extension</h3>";
if (extension_loaded('mysqli')) {
    echo "✓ mysqli extension is loaded<br>";
} else {
    echo "✗ mysqli extension is NOT loaded<br>";
    echo "Please enable mysqli extension in php.ini<br>";
}

// Test 2: Try to connect to MySQL server
echo "<h3>2. MySQL Server Connection</h3>";
$conn = @new mysqli(DB_HOST, DB_USER, DB_PASS);

if ($conn->connect_error) {
    echo "✗ Connection failed: " . $conn->connect_error . "<br>";
    echo "<strong>Solution:</strong><br>";
    echo "1. Open XAMPP Control Panel<br>";
    echo "2. Click 'Start' button next to MySQL<br>";
    echo "3. Wait for MySQL to start (green indicator)<br>";
    echo "4. Refresh this page<br>";
} else {
    echo "✓ Successfully connected to MySQL server<br>";
    
    // Test 3: Check if database exists
    echo "<h3>3. Database Check</h3>";
    $result = $conn->query("SHOW DATABASES LIKE '" . DB_NAME . "'");
    
    if ($result->num_rows > 0) {
        echo "✓ Database '" . DB_NAME . "' exists<br>";
    } else {
        echo "⚠ Database '" . DB_NAME . "' does not exist<br>";
        echo "Creating database...<br>";
        
        if ($conn->query("CREATE DATABASE IF NOT EXISTS " . DB_NAME)) {
            echo "✓ Database created successfully<br>";
        } else {
            echo "✗ Failed to create database: " . $conn->error . "<br>";
        }
    }
    
    // Test 4: Try to use the database
    echo "<h3>4. Database Connection</h3>";
    if ($conn->select_db(DB_NAME)) {
        echo "✓ Successfully connected to database '" . DB_NAME . "'<br>";
        
        // Test 5: Check if users table exists
        echo "<h3>5. Tables Check</h3>";
        $result = $conn->query("SHOW TABLES LIKE 'users'");
        
        if ($result->num_rows > 0) {
            echo "✓ 'users' table exists<br>";
        } else {
            echo "⚠ 'users' table does not exist<br>";
            echo "Please run the SQL script from 'database_setup.sql' in phpMyAdmin<br>";
        }
    } else {
        echo "✗ Failed to select database: " . $conn->error . "<br>";
    }
}

$conn->close();

echo "<hr>";
echo "<h3>Configuration</h3>";
echo "Host: " . DB_HOST . "<br>";
echo "User: " . DB_USER . "<br>";
echo "Password: " . (DB_PASS ? "***" : "(empty)") . "<br>";
echo "Database: " . DB_NAME . "<br>";
?>
