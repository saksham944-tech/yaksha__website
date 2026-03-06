<?php
// Returns most recent thermal reading

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
    $sql = "SELECT frame_path, min_temp, max_temp, avg_temp, created_at
            FROM thermal_readings
            ORDER BY created_at DESC
            LIMIT 1";
    $result = $conn->query($sql);

    if ($result && $result->num_rows === 1) {
        $row = $result->fetch_assoc();
        $response['success'] = true;
        $response['data'] = [
            'frame_path' => $row['frame_path'],
            'min_temp'   => isset($row['min_temp']) ? (float)$row['min_temp'] : null,
            'max_temp'   => isset($row['max_temp']) ? (float)$row['max_temp'] : null,
            'avg_temp'   => isset($row['avg_temp']) ? (float)$row['avg_temp'] : null,
            'time'       => $row['created_at'],
        ];
    } else {
        $response['message'] = 'No thermal data available yet.';
    }
} catch (Exception $e) {
    $response['message'] = 'Server error: ' . $e->getMessage();
}

echo json_encode($response);

