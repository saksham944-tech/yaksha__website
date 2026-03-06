<?php
// Endpoint for Raspberry Pi to push gas sensor readings
// POST JSON: { "api_key": "...", "sensor_type": "MQ-4", "value": 123.4, "unit": "ppm" }

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

$sensorType = isset($data['sensor_type']) ? trim($data['sensor_type']) : '';
$value      = isset($data['value']) ? floatval($data['value']) : null;
$unit       = isset($data['unit']) ? trim($data['unit']) : 'ppm';

if ($sensorType === '' || $value === null) {
    $response['message'] = 'sensor_type and value are required.';
    echo json_encode($response);
    exit;
}

try {
    $conn = $db->getConnection();
    $stmt = $conn->prepare(
        "INSERT INTO gas_readings (sensor_type, value, unit)
         VALUES (?, ?, ?)"
    );
    $stmt->bind_param("sds", $sensorType, $value, $unit);

    if ($stmt->execute()) {
        $response['success'] = true;
        $response['message'] = 'Gas reading stored.';
    } else {
        $response['message'] = 'Failed to store gas reading.';
    }

    $stmt->close();
} catch (Exception $e) {
    http_response_code(500);
    $response['message'] = 'Server error: ' . $e->getMessage();
}

echo json_encode($response);

