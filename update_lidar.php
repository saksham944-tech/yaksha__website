<?php
// Endpoint for Raspberry Pi to push lidar scan references
// POST JSON: { "api_key": "...", "scan_path": "scans/scan001.pcd", "notes": "front corridor" }

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

$scanPath = isset($data['scan_path']) ? trim($data['scan_path']) : '';
$notes    = isset($data['notes']) ? trim($data['notes']) : null;

if ($scanPath === '') {
    $response['message'] = 'scan_path is required.';
    echo json_encode($response);
    exit;
}

try {
    $conn = $db->getConnection();
    $stmt = $conn->prepare(
        "INSERT INTO lidar_scans (scan_path, notes)
         VALUES (?, ?)"
    );
    $stmt->bind_param("ss", $scanPath, $notes);

    if ($stmt->execute()) {
        $response['success'] = true;
        $response['message'] = 'Lidar scan stored.';
    } else {
        $response['message'] = 'Failed to store lidar scan.';
    }

    $stmt->close();
} catch (Exception $e) {
    http_response_code(500);
    $response['message'] = 'Server error: ' . $e->getMessage();
}

echo json_encode($response);

