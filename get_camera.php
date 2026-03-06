<?php
// Returns most recent camera frame metadata

header('Content-Type: application/json');

require_once 'db.php';

$response = ['success' => false, 'message' => '', 'data' => null];

if (!$db || !$db->getConnection()) {
    $response['message'] = 'Database connection failed.';
    echo json_encode($response);
    exit;
}

try {
    $conn = $db->getConnection();
    $sql = "SELECT image_path, description, created_at
            FROM camera_frames
            ORDER BY created_at DESC
            LIMIT 1";
    $result = $conn->query($sql);

    if ($result && $result->num_rows === 1) {
        $row = $result->fetch_assoc();
        $response['success'] = true;
        $response['data'] = [
            'image_path'  => $row['image_path'],
            'description' => $row['description'],
            'time'        => $row['created_at'],
        ];
    } else {
        $response['message'] = 'No camera data available yet.';
    }
} catch (Exception $e) {
    $response['message'] = 'Server error: ' . $e->getMessage();
}

echo json_encode($response);

