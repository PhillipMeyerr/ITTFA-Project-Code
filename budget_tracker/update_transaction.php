<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once 'database.php';
session_start();

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['error' => 'User not logged in']);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $transaction_id = $_POST['id'];
    $user_id = $_SESSION['user_id'];
    $type = $_POST['type'];
    $name = $_POST['name'];
    $amount = $_POST['amount'];
    $recurring = isset($_POST['recurring']) ? 1 : 0;

    if ($type === 'expense') {
        $category = $_POST['category'];
        $sql = 'UPDATE expenses SET name = ?, amount = ?, category = ?, recurring = ? WHERE id = ? AND user_id = ?';
        $stmt = $pdo->prepare($sql);
        $result = $stmt->execute([$name, $amount, $category, $recurring, $transaction_id, $user_id]);
    } elseif ($type === 'income') {
        $sql = 'UPDATE income SET name = ?, amount = ?, recurring = ? WHERE id = ? AND user_id = ?';
        $stmt = $pdo->prepare($sql);
        $result = $stmt->execute([$name, $amount, $recurring, $transaction_id, $user_id]);
    } else {
        $result = false;
    }

    if ($result) {
        $response = ['success' => true];
    } else {
        $response = ['error' => 'Failed to update transaction'];
    }

    header('Content-Type: application/json');
    echo json_encode($response);
}
?>
