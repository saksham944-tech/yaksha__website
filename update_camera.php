<?php
// Endpoint for Raspberry Pi to push camera frame metadata
// Recommended: stream video directly from Pi and only store key frame paths here
// POST JSON: { "api_key": "...", "image_path": "frames/frame001.jpg", "description": "front view" }

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

$imagePath   = isset($data['image_path']) ? trim($data['image_path']) : '';
$description = isset($data['description']) ? trim($data['description']) : null;

if ($imagePath === '') {
    $response['message'] = 'image_path is required.';
    echo json_encode($response);
    exit;
}

try {
    $conn = $db->getConnection();
    $stmt = $conn->prepare(
        "INSERT INTO camera_frames (image_path, description)
         VALUES (?, ?)"
    );
    $stmt->bind_param("ss", $imagePath, $description);

    if ($stmt->execute()) {
        $response['success'] = true;
        $response['message'] = 'Camera frame stored.';
    } else {
        $response['message'] = 'Failed to store camera frame.';
    }

    $stmt->close();
} catch (Exception $e) {
    http_response_code(500);
    $response['message'] = 'Server error: ' . $e->getMessage();
}

echo json_encode($response);

