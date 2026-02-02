<?php
require_once __DIR__ . '/config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    $stmt = $db->query('SELECT * FROM delivery_zones');
    $zones = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Zonas encontradas: " . count($zones) . "\n\n";
    print_r($zones);
    
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
