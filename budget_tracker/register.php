<?php
// Include database configuration file
require_once 'database.php';

// Check if form is submitted
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $name = $_POST['name'];
    $email = $_POST['email'];
    $password = password_hash($_POST['password'], PASSWORD_DEFAULT);

    // Prepare SQL query to insert user data into the database
    $sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
    $stmt = $pdo->prepare($sql);

    // Execute the query with provided data
    if ($stmt->execute([$name, $email, $password])) {
        echo "Registration successful!";
        // Redirect to login page or profile page
        header("Location: login.html");
        exit();
    } else {
        echo "Error: " . $stmt->errorInfo();
    }
}
?>
