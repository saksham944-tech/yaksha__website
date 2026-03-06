<?php
/**
 * HTML File Protection
 * This file protects all HTML files by checking authentication
 * Called via .htaccess rewrite rules
 */

session_start();

// Get the requested HTML file
$requestedFile = isset($_GET['file']) ? basename($_GET['file']) : '';

// Security: Only allow HTML files
if (pathinfo($requestedFile, PATHINFO_EXTENSION) !== 'html') {
    header('HTTP/1.0 403 Forbidden');
    die('Access denied');
}

// Check if user is logged in
if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    // Not logged in - redirect to login
    header('Location: login.html');
    exit;
}

// User is authenticated - serve the HTML file
$filePath = __DIR__ . '/' . $requestedFile;

// Check if file exists
if (file_exists($filePath) && is_file($filePath)) {
    // Read and output the file
    readfile($filePath);
} else {
    header('HTTP/1.0 404 Not Found');
    die('File not found');
}
?>
