<?php
/**
 * Database Installer
 * Este archivo crea e importa la base de datos automáticamente
 */

// Configuración
$host = 'localhost';
$username = 'root';
$password = 'mysql';
$database = 'deliverysv';

echo "=== INSTALADOR DE BASE DE DATOS DELIVERYSV ===\n\n";

try {
    // Conectar a MySQL sin seleccionar base de datos
    $conn = new PDO("mysql:host=$host", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "✓ Conectado a MySQL\n";
    
    // Crear base de datos si no existe
    $conn->exec("CREATE DATABASE IF NOT EXISTS $database CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    echo "✓ Base de datos '$database' creada/verificada\n";
    
    // Seleccionar la base de datos
    $conn->exec("USE $database");
    echo "✓ Usando base de datos '$database'\n\n";
    
    // Leer el archivo SQL
    $sqlFile = __DIR__ . '/database/schema.sql';
    
    if (!file_exists($sqlFile)) {
        die("✗ ERROR: No se encuentra el archivo $sqlFile\n");
    }
    
    $sql = file_get_contents($sqlFile);
    echo "✓ Archivo SQL leído correctamente\n";
    
    // Dividir las consultas por punto y coma
    $statements = array_filter(array_map('trim', explode(';', $sql)));
    
    echo "✓ Ejecutando " . count($statements) . " consultas SQL...\n\n";
    
    $success = 0;
    $errors = 0;
    
    foreach ($statements as $statement) {
        if (!empty($statement)) {
            try {
                $conn->exec($statement);
                $success++;
                
                // Mostrar progreso
                if ($success % 5 == 0) {
                    echo "  → Ejecutadas $success consultas...\n";
                }
            } catch (PDOException $e) {
                $errors++;
                // No mostrar errores de "tabla ya existe" como críticos
                if (strpos($e->getMessage(), 'already exists') === false) {
                    echo "  ⚠ Advertencia: " . $e->getMessage() . "\n";
                }
            }
        }
    }
    
    echo "\n=== RESULTADO ===\n";
    echo "✓ Consultas exitosas: $success\n";
    
    if ($errors > 0) {
        echo "⚠ Advertencias: $errors\n";
    }
    
    // Verificar tablas creadas
    $result = $conn->query("SHOW TABLES");
    $tables = $result->fetchAll(PDO::FETCH_COLUMN);
    
    echo "\n=== TABLAS CREADAS ===\n";
    foreach ($tables as $table) {
        echo "  • $table\n";
    }
    
    echo "\n=== USUARIO ADMIN CREADO ===\n";
    echo "  Email: admin@deliverysv.com\n";
    echo "  Password: admin123\n";
    
    echo "\n✓ ¡Base de datos instalada correctamente!\n";
    echo "✓ Puedes acceder a la API ahora.\n\n";
    
} catch (PDOException $e) {
    echo "✗ ERROR: " . $e->getMessage() . "\n";
    exit(1);
}
?>
