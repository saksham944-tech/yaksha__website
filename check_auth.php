<?php
// Authentication Check Handler for HTML files
session_start();

// Get the requested file
$requestedFile = isset($_GET['file']) ? $_GET['file'] : '';

// Check if user is logged in
if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    // Not logged in - redirect to login
    header('Location: login.html');
    exit;
}

// User is logged in - serve the HTML file
$filePath = __DIR__ . '/' . basename($requestedFile);

// Security: Only allow HTML files
if (pathinfo($requestedFile, PATHINFO_EXTENSION) !== 'html') {
    header('HTTP/1.0 403 Forbidden');
    die('Access denied');
}

// Check if file exists
if (file_exists($filePath) && is_file($filePath)) {
    // Read and output the file
    $content = file_get_contents($filePath);
    
    // Inject a logout button or user info if needed
    // You can customize this section
    
    echo $content;
} else {
    header('HTTP/1.0 404 Not Found');
    die('File not found');
}
?>
