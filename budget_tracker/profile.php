<?php
session_start();
require_once 'database.php';

// Check if the user is logged in
if (!isset($_SESSION['user_id'])) {
    header('Content-Type: application/json');
    echo json_encode(['error' => 'User not logged in']);
    exit();
}

$user_id = $_SESSION['user_id'];

if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    // Fetch user data
    $sql = 'SELECT name, email FROM users WHERE id = ?';
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$user_id]);
    $user = $stmt->fetch();
    
    header('Content-Type: application/json');
    echo json_encode($user);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Update user data
    $name = $_POST['name'];
    $email = $_POST['email'];
    $password = $_POST['password'];
    
    if (!empty($password)) {
        $hashed_password = password_hash($password, PASSWORD_DEFAULT);
        $sql = 'UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?';
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$name, $email, $hashed_password, $user_id]);
    } else {
        $sql = 'UPDATE users SET name = ?, email = ? WHERE id = ?';
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$name, $email, $user_id]);
    }

    // Update session variables
    $_SESSION['user_name'] = $name;

    header('Content-Type: application/json');
    echo json_encode(['success' => 'Profile updated successfully']);
    exit();
}
?>
