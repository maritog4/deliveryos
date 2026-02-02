<?php
// Script de una sola ejecución para importar base de datos en Railway
// Ejecutar: php import-railway.php

$host = getenv('RAILWAY_TCP_PROXY_DOMAIN') ?: 'hopper.proxy.rlwy.net';
$port = getenv('RAILWAY_TCP_PROXY_PORT') ?: '15312';
$database = getenv('MYSQLDATABASE') ?: 'railway';
$user = getenv('MYSQLUSER') ?: 'root';
$password = getenv('MYSQLPASSWORD') ?: '';

echo "🔌 Conectando a Railway MySQL...\n";
echo "Host: $host:$port\n";
echo "Database: $database\n\n";

try {
    $pdo = new PDO(
        "mysql:host=$host;port=$port;charset=utf8mb4",
        $user,
        $password
    );
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "✅ Conectado exitosamente\n\n";
    
    // Crear base de datos si no existe
    echo "📦 Creando base de datos '$database'...\n";
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `$database` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    $pdo->exec("USE `$database`");
    echo "✅ Base de datos seleccionada\n\n";
    
    // Importar schema
    echo "📥 Importando schema.sql...\n";
    $schema = file_get_contents(__DIR__ . '/database/schema.sql');
    
    // Remover comentarios y líneas vacías
    $schema = preg_replace('/--.*$/m', '', $schema);
    $schema = preg_replace('/\/\*.*?\*\//s', '', $schema);
    
    // Remover la línea CREATE DATABASE y USE del schema
    $schema = preg_replace('/CREATE DATABASE.*?;/i', '', $schema);
    $schema = preg_replace('/USE .*?;/i', '', $schema);
    
    // Ejecutar todo el schema de una vez
    try {
        $pdo->exec($schema);
        echo "✅ Schema importado completamente\n\n";
    } catch (PDOException $e) {
        // Si falla, intentar statement por statement
        echo "⚠️  Importando por statements...\n";
        $statements = preg_split('/;\s*$/m', $schema);
        
        foreach ($statements as $i => $statement) {
            $statement = trim($statement);
            if (!empty($statement)) {
                try {
                    $pdo->exec($statement . ';');
                    echo ".";
                } catch (PDOException $e2) {
                    if (strpos($e2->getMessage(), 'already exists') === false) {
                        echo "\n⚠️  Statement " . ($i + 1) . ": " . $e2->getMessage() . "\n";
                    }
                }
            }
        }
        echo "\n✅ Schema procesado\n\n";
    }
    
    // Importar seeds
    echo "🌱 Importando seeds.sql...\n";
    $seeds = file_get_contents(__DIR__ . '/database/seeds.sql');
    
    $statements = array_filter(
        array_map('trim', explode(';', $seeds)),
        function($stmt) {
            return !empty($stmt) && !preg_match('/^--/', $stmt);
        }
    );
    
    foreach ($statements as $i => $statement) {
        if (!empty(trim($statement))) {
            try {
                $pdo->exec($statement);
                echo ".";
            } catch (PDOException $e) {
                echo "\n⚠️  Error en seed " . ($i + 1) . ": " . $e->getMessage() . "\n";
            }
        }
    }
    echo "\n✅ Seeds importados\n\n";
    
    // Verificar datos
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM users");
    $users = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
    
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM products");
    $products = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
    
    echo "📊 Verificación:\n";
    echo "   - Usuarios: $users\n";
    echo "   - Productos: $products\n\n";
    
    echo "🎉 ¡Importación completada exitosamente!\n";
    
} catch (PDOException $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}
?>
