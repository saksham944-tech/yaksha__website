<?php
// Login API Endpoint
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

// Start session for user authentication
session_start();

$response = ['success' => false, 'message' => ''];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!$data) {
        $data = $_POST;
    }
    
    $username = isset($data['username']) ? trim($data['username']) : '';
    $password = isset($data['password']) ? $data['password'] : '';
    
    // Validation
    if (empty($username) || empty($password)) {
        $response['message'] = 'Please enter User ID and Password.';
        echo json_encode($response);
        exit;
    }
    
    // Check user credentials
    $stmt = $db->prepare("SELECT id, username, password FROM users WHERE username = ?");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 1) {
        $user = $result->fetch_assoc();
        
        // Verify password
        if (password_verify($password, $user['password'])) {
            // Set session variables
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['username'] = $user['username'];
            $_SESSION['logged_in'] = true;
            
            $response['success'] = true;
            $response['message'] = 'Login successful!';
            $response['redirect'] = 'dashboard.html';
        } else {
            $response['message'] = 'Incorrect User ID or Password.';
        }
    } else {
        $response['message'] = 'Incorrect User ID or Password.';
    }
    
    $stmt->close();
} else {
    $response['message'] = 'Invalid request method.';
}

echo json_encode($response);
?>
