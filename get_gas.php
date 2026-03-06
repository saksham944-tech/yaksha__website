<?php
// Returns most recent gas sensor reading

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
    $sql = "SELECT sensor_type, value, unit, created_at
            FROM gas_readings
            ORDER BY created_at DESC
            LIMIT 1";
    $result = $conn->query($sql);

    if ($result && $result->num_rows === 1) {
        $row = $result->fetch_assoc();
        $response['success'] = true;
        $response['data'] = [
            'sensor_type' => $row['sensor_type'],
            'value'       => (float)$row['value'],
            'unit'        => $row['unit'],
            'time'        => $row['created_at'],
        ];
    } else {
        $response['message'] = 'No gas data available yet.';
    }
} catch (Exception $e) {
    $response['message'] = 'Server error: ' . $e->getMessage();
}

echo json_encode($response);

