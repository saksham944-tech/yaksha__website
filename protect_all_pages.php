<?php
/**
 * Universal Page Protection
 * This file protects ALL pages by checking authentication
 * Place this in .htaccess or use as a wrapper
 */

session_start();

// Define public pages that don't require login
$publicPages = [
    'login.html',
    'signup.html',
    'index.html',
    'login.php',
    'signup.php',
    'logout.php'
];

// Get the requested file
$requestedFile = basename($_SERVER['REQUEST_URI']);
$requestedFile = explode('?', $requestedFile)[0]; // Remove query string

// Check if it's a public page
$isPublic = false;
foreach ($publicPages as $publicPage) {
    if ($requestedFile === $publicPage || strpos($requestedFile, $publicPage) !== false) {
        $isPublic = true;
        break;
    }
}

// If not public and not logged in, redirect to login
if (!$isPublic) {
    if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
        header('Location: login.html');
        exit;
    }
}

// Continue - page is either public or user is authenticated
?>
