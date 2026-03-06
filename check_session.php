<?php
// Check if user is logged in
session_start();
header('Content-Type: application/json');

$response = [
    'logged_in' => false,
    'username' => null
];

if (isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true) {
    $response['logged_in'] = true;
    $response['username'] = $_SESSION['username'] ?? null;
}

echo json_encode($response);
?>
