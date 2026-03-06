<?php
// Signup API Endpoint
header('Content-Type: application/json');
require_once 'db.php';

// Check if database connection is available
if (!$db || !$db->getConnection()) {
    $response = [
        'success' => false,
        'message' => 'Database connection failed. Please ensure MySQL service is running in XAMPP Control Panel.'
    ];
    echo json_encode($response);
    exit;
}

$response = ['success' => false, 'message' => ''];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!$data) {
        $data = $_POST;
    }
    
    $username = isset($data['username']) ? trim($data['username']) : '';
    $password = isset($data['password']) ? $data['password'] : '';
    $confirm = isset($data['confirm']) ? $data['confirm'] : '';
    
    // Validation
    if (empty($username) || empty($password) || empty($confirm)) {
        $response['message'] = 'All fields are required.';
        echo json_encode($response);
        exit;
    }
    
    if ($password !== $confirm) {
        $response['message'] = 'Passwords do not match.';
        echo json_encode($response);
        exit;
    }
    
    if (strlen($username) < 3) {
        $response['message'] = 'Username must be at least 3 characters long.';
        echo json_encode($response);
        exit;
    }
    
    if (strlen($password) < 6) {
        $response['message'] = 'Password must be at least 6 characters long.';
        echo json_encode($response);
        exit;
    }
    
    // Check if username already exists
    $stmt = $db->prepare("SELECT id FROM users WHERE username = ?");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $response['message'] = 'Username already exists. Please choose another.';
        echo json_encode($response);
        $stmt->close();
        exit;
    }
    
    // Hash password
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    
    // Insert new user
    $stmt = $db->prepare("INSERT INTO users (username, password) VALUES (?, ?)");
    $stmt->bind_param("ss", $username, $hashedPassword);
    
    if ($stmt->execute()) {
        $response['success'] = true;
        $response['message'] = 'Account created successfully!';
    } else {
        $response['message'] = 'Error creating account. Please try again.';
    }
    
    $stmt->close();
} else {
    $response['message'] = 'Invalid request method.';
}

echo json_encode($response);
?>
