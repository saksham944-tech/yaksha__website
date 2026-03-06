<?php
// Endpoint for Raspberry Pi to push thermal sensor summary
// POST JSON: { "api_key": "...", "min_temp": 20.5, "max_temp": 45.2, "avg_temp": 30.1, "frame_path": "images/thermal/frame001.png" }

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once 'db.php';
require_once 'config.php';

$response = ['success' => false, 'message' => ''];

if (!$db || !$db->getConnection()) {
    $response['message'] = 'Database connection failed.';
    echo json_encode($response);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
if (!$data) {
    $data = $_POST;
}

$apiKey = isset($data['api_key']) ? $data['api_key'] : '';
if (!defined('API_KEY') || $apiKey !== API_KEY) {
    http_response_code(401);
    $response['message'] = 'Invalid API key.';
    echo json_encode($response);
    exit;
}

$framePath = isset($data['frame_path']) ? trim($data['frame_path']) : null;
$minTemp   = isset($data['min_temp']) ? floatval($data['min_temp']) : null;
$maxTemp   = isset($data['max_temp']) ? floatval($data['max_temp']) : null;
$avgTemp   = isset($data['avg_temp']) ? floatval($data['avg_temp']) : null;

try {
    $conn = $db->getConnection();
    $stmt = $conn->prepare(
        "INSERT INTO thermal_readings (frame_path, min_temp, max_temp, avg_temp)
         VALUES (?, ?, ?, ?)"
    );
    $stmt->bind_param("sddd", $framePath, $minTemp, $maxTemp, $avgTemp);

    if ($stmt->execute()) {
        $response['success'] = true;
        $response['message'] = 'Thermal reading stored.';
    } else {
        $response['message'] = 'Failed to store thermal reading.';
    }

    $stmt->close();
} catch (Exception $e) {
    http_response_code(500);
    $response['message'] = 'Server error: ' . $e->getMessage();
}

echo json_encode($response);

