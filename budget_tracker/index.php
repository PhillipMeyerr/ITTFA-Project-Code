<?php
session_start();
require_once 'database.php';

if (!isset($_SESSION['user_id'])) {
    header('Content-Type: application/json');
    echo json_encode(['loggedIn' => false]);
    exit();
}

$user_id = $_SESSION['user_id'];

// Fetch transactions
$sql = 'SELECT * FROM transactions WHERE user_id = ?';
$stmt = $pdo->prepare($sql);
$stmt->execute([$user_id]);
$transactions = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Calculate balances
$total_balance = 0;
$total_income = 0;
$total_expenses = 0;
foreach ($transactions as $transaction) {
    if ($transaction['type'] === 'income') {
        $total_income += $transaction['amount'];
        $total_balance += $transaction['amount'];
    } else {
        $total_expenses += $transaction['amount'];
        $total_balance -= $transaction['amount'];
    }
}

$budget_remaining = $total_income - $total_expenses;

header('Content-Type: application/json');
echo json_encode([
    'transactions' => $transactions,
    'total_balance' => $total_balance,
    'total_income' => $total_income,
    'total_expenses' => $total_expenses,
    'budget_remaining' => $budget_remaining,
]);
?>
