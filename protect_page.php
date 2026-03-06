<?php
/**
 * Page Protection System
 * Include this at the very top of any PHP file to protect it
 * Usage: <?php require_once 'protect_page.php'; ?>
 */

session_start();

// Pages that don't require authentication
$publicPages = [
    'login.html',
    'login.php',
    'signup.html',
    'signup.php',
    'index.html',
    'logout.php'
];

// Get current page name
$currentPage = basename($_SERVER['PHP_SELF']);

// Check if current page is public
if (!in_array($currentPage, $publicPages)) {
    // This is a protected page - check authentication
    if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
        // Not logged in - redirect to login
        header('Location: login.html');
        exit;
    }
}

// If we get here, either:
// 1. Page is public (login, signup, index)
// 2. User is authenticated
// Continue loading the page
?>
