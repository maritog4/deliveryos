<?php
// Fix admin password
$host = 'localhost';
$username = 'root';
$password = 'mysql';
$database = 'deliverysv';

try {
    $conn = new PDO("mysql:host=$host;dbname=$database", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Hash correcto para "admin123"
    $newPassword = password_hash('admin123', PASSWORD_BCRYPT);
    
    $stmt = $conn->prepare("UPDATE users SET password = ? WHERE email = 'admin@deliverysv.com'");
    $stmt->execute([$newPassword]);
    
    echo "✓ Password del admin actualizado correctamente\n";
    echo "  Email: admin@deliverysv.com\n";
    echo "  Password: admin123\n";
    
} catch (PDOException $e) {
    echo "✗ ERROR: " . $e->getMessage() . "\n";
}
?>
