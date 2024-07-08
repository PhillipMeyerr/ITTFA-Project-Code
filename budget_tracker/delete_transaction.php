<?php
require_once 'database.php';
session_start();

if (!isset($_SESSION['user_id'])) {
    $response = ['success' => false, 'error' => 'User not logged in'];
    header('Content-Type: application/json');
    echo json_encode($response);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $transaction_id = $_POST['transaction_id'];
    $user_id = $_SESSION['user_id'];

    // Check if the transaction belongs to the logged-in user
    $sql_check_expense = "SELECT id FROM expenses WHERE id = ? AND user_id = ?";
    $stmt_check_expense = $pdo->prepare($sql_check_expense);
    $stmt_check_expense->execute([$transaction_id, $user_id]);

    $sql_check_income = "SELECT id FROM income WHERE id = ? AND user_id = ?";
    $stmt_check_income = $pdo->prepare($sql_check_income);
    $stmt_check_income->execute([$transaction_id, $user_id]);

    if ($stmt_check_expense->rowCount() > 0) {
        $sql = "DELETE FROM expenses WHERE id = ?";
    } elseif ($stmt_check_income->rowCount() > 0) {
        $sql = "DELETE FROM income WHERE id = ?";
    } else {
        $response = ['success' => false, 'error' => 'Transaction not found or access denied'];
        header('Content-Type: application/json');
        echo json_encode($response);
        exit();
    }

    $stmt = $pdo->prepare($sql);

    if ($stmt->execute([$transaction_id])) {
        $response = ['success' => true];
    } else {
        $errorInfo = $stmt->errorInfo();
        $response = ['success' => false, 'error' => 'Failed to delete transaction: ' . $errorInfo[2]];
    }
} else {
    $response = ['success' => false, 'error' => 'Invalid request method'];
}

// Return response as JSON
header('Content-Type: application/json');
echo json_encode($response);
?>
