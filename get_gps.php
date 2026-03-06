<?php
// Endpoint used by dashboard to fetch latest GPS reading
// Method: GET

header('Content-Type: application/json');

require_once 'db.php';

$response = [
    'success' => false,
    'message' => '',
    'data'    => null
];

if (!$db || !$db->getConnection()) {
    $response['message'] = 'Database connection failed.';
    echo json_encode($response);
    exit;
}

try {
    $conn = $db->getConnection();

    // Get most recent reading
    $sql = "SELECT latitude, longitude, altitude, speed, satellites, created_at
            FROM gps_readings
            ORDER BY created_at DESC
            LIMIT 1";
    $result = $conn->query($sql);

    if ($result && $result->num_rows === 1) {
        $row = $result->fetch_assoc();
        $response['success'] = true;
        $response['data'] = [
            'lat'  => (float)$row['latitude'],
            'lon'  => (float)$row['longitude'],
            'alt'  => isset($row['altitude']) ? (float)$row['altitude'] : null,
            'speed'=> isset($row['speed']) ? (float)$row['speed'] : null,
            'sats' => isset($row['satellites']) ? (int)$row['satellites'] : null,
            'time' => $row['created_at'],
        ];
    } else {
        $response['message'] = 'No GPS data available yet.';
    }
} catch (Exception $e) {
    $response['message'] = 'Server error: ' . $e->getMessage();
}

echo json_encode($response);
