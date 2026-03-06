<?php
// Require Authentication - Include this at the top of protected pages
session_start();

// Check if user is logged in
if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    // User is not logged in, redirect to login page
    header('Location: login.html');
    exit;
}

// User is logged in, continue loading the page
// You can access $_SESSION['user_id'] and $_SESSION['username'] here
?>
