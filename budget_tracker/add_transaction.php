<?php
require_once 'database.php';
session_start();

if (!isset($_SESSION['user_id'])) {
    $response = ['success' => false, 'error' => 'User not logged in'];
    header('Content-Type: application/json');
    echo json_encode($response);
    exit();
}

$user_id = $_SESSION['user_id'];
$type = $_POST['type'];
$name = $_POST['name'];
$amount = $_POST['amount'];
$recurring = isset($_POST['recurring']) ? 1 : 0;
$date = date('Y-m-d H:i:s');

// Debug statements
error_log("User ID: $user_id");
error_log("Type: $type");
error_log("Name: $name");
error_log("Amount: $amount");
error_log("Recurring: $recurring");
error_log("Date: $date");

if ($type === 'expense') {
    $category = $_POST['category'];
    $sql = 'INSERT INTO expenses (user_id, name, amount, category, recurring, date) VALUES (?, ?, ?, ?, ?, ?)';
    $stmt = $pdo->prepare($sql);
    $result = $stmt->execute([$user_id, $name, $amount, $category, $recurring, $date]);
} elseif ($type === 'income') {
    $sql = 'INSERT INTO income (user_id, name, amount, recurring, date) VALUES (?, ?, ?, ?, ?)';
    $stmt = $pdo->prepare($sql);
    $result = $stmt->execute([$user_id, $name, $amount, $recurring, $date]);
} else {
    $result = false;
}

if ($result) {
    $response = ['success' => true];
} else {
    $errorInfo = $stmt->errorInfo();
    $response = ['success' => false, 'error' => 'Failed to add transaction: ' . $errorInfo[2]];
}

// Return response as JSON
header('Content-Type: application/json');
echo json_encode($response);
?>
