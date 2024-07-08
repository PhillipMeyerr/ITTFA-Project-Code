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

if (!isset($_GET['id'])) {
    echo json_encode(['error' => 'Transaction ID not provided']);
    exit();
}

$transaction_id = $_GET['id'];
$user_id = $_SESSION['user_id'];

// Fetch transaction
$sql_expense = 'SELECT id, name, amount, category, recurring, date, "expense" as type FROM expenses WHERE id = ? AND user_id = ?';
$stmt_expense = $pdo->prepare($sql_expense);
$stmt_expense->execute([$transaction_id, $user_id]);
$transaction = $stmt_expense->fetch(PDO::FETCH_ASSOC);

if (!$transaction) {
    $sql_income = 'SELECT id, name, amount, recurring, date, "income" as type FROM income WHERE id = ? AND user_id = ?';
    $stmt_income = $pdo->prepare($sql_income);
    $stmt_income->execute([$transaction_id, $user_id]);
    $transaction = $stmt_income->fetch(PDO::FETCH_ASSOC);
}

if ($transaction) {
    header('Content-Type: application/json');
    echo json_encode($transaction);
} else {
    echo json_encode(['error' => 'Transaction not found']);
}
?>

