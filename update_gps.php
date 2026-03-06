<?php
// Endpoint called by Raspberry Pi to push latest GPS reading
// Method: POST JSON
// Body: { "api_key": "YOUR_SECRET_KEY", "lat": 28.6139, "lon": 77.2090, "alt": 216, "speed": 1.3, "sats": 12 }

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

$lat  = isset($data['lat'])  ? floatval($data['lat'])  : null;
$lon  = isset($data['lon'])  ? floatval($data['lon'])  : null;
$alt  = isset($data['alt'])  ? floatval($data['alt'])  : null;
$speed = isset($data['speed']) ? floatval($data['speed']) : null;
$sats  = isset($data['sats'])  ? intval($data['sats'])   : null;

if ($lat === null || $lon === null) {
    $response['message'] = 'lat and lon are required.';
    echo json_encode($response);
    exit;
}

try {
    $conn = $db->getConnection();
    $stmt = $conn->prepare(
        "INSERT INTO gps_readings (latitude, longitude, altitude, speed, satellites)
         VALUES (?, ?, ?, ?, ?)"
    );
    $stmt->bind_param(
        "dddii",
        $lat,
        $lon,
        $alt,
        $speed,
        $sats
    );

    if ($stmt->execute()) {
        $response['success'] = true;
        $response['message'] = 'GPS reading stored.';
    } else {
        $response['message'] = 'Failed to store GPS reading.';
    }

    $stmt->close();
} catch (Exception $e) {
    http_response_code(500);
    $response['message'] = 'Server error: ' . $e->getMessage();
}

echo json_encode($response);
