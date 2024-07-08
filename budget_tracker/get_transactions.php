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

$user_id = $_SESSION['user_id'];

$transactions = [];

// Fetch expenses
$stmt = $pdo->prepare('SELECT id, name, amount, category, recurring, date FROM expenses WHERE user_id = ?');
$stmt->execute([$user_id]);
$expenses = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Fetch income
$stmt = $pdo->prepare('SELECT id, name, amount, recurring, date FROM income WHERE user_id = ?');
$stmt->execute([$user_id]);
$income = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Combine expenses and income
foreach ($expenses as $expense) {
    $expense['type'] = 'expense';
    $transactions[] = $expense;
}
foreach ($income as $inc) {
    $inc['type'] = 'income';
    $transactions[] = $inc;
}

header('Content-Type: application/json');
echo json_encode($transactions);
?>
