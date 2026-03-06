<?php
// Returns most recent lidar scan reference

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
    $sql = "SELECT scan_path, notes, created_at
            FROM lidar_scans
            ORDER BY created_at DESC
            LIMIT 1";
    $result = $conn->query($sql);

    if ($result && $result->num_rows === 1) {
        $row = $result->fetch_assoc();
        $response['success'] = true;
        $response['data'] = [
            'scan_path' => $row['scan_path'],
            'notes'     => $row['notes'],
            'time'      => $row['created_at'],
        ];
    } else {
        $response['message'] = 'No lidar data available yet.';
    }
} catch (Exception $e) {
    $response['message'] = 'Server error: ' . $e->getMessage();
}

echo json_encode($response);

