<?php
/**
 * Setup endpoint - Ejecutar UNA SOLA VEZ para importar la base de datos
 * URL: https://tu-app.railway.app/setup.php
 * ELIMINAR ESTE ARCHIVO después de usarlo
 */

// Solo permitir en producción si es la primera vez
$setupFile = __DIR__ . '/.setup_completed';

if (file_exists($setupFile)) {
    die("✅ Setup ya completado. Elimina este archivo por seguridad.");
}

echo "<pre>";
echo "🚀 DeliveryOS - Database Setup\n";
echo "================================\n\n";

// Configuración
$host = getenv('MYSQLHOST') ?: 'localhost';
$port = getenv('MYSQLPORT') ?: '3306';
$database = getenv('MYSQLDATABASE') ?: 'railway';
$user = getenv('MYSQLUSER') ?: 'root';
$password = getenv('MYSQLPASSWORD') ?: '';

echo "📊 Configuración:\n";
echo "   Host: $host:$port\n";
echo "   Database: $database\n";
echo "   User: $user\n\n";

try {
    // Conectar
    echo "🔌 Conectando a MySQL...\n";
    $pdo = new PDO(
        "mysql:host=$host;port=$port;dbname=$database;charset=utf8mb4",
        $user,
        $password,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
    echo "✅ Conectado exitosamente\n\n";
    
    // Verificar si ya está importado
    $stmt = $pdo->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    if (count($tables) > 0) {
        echo "⚠️  Base de datos ya tiene " . count($tables) . " tablas:\n";
        foreach ($tables as $table) {
            echo "   - $table\n";
        }
        echo "\n¿Continuar de todos modos? (puede causar errores)\n";
        echo "Si quieres reiniciar, elimina las tablas primero.\n\n";
    }
    
    // Importar schema
    echo "📥 Importando schema.sql...\n";
    $schemaFile = __DIR__ . '/database/schema.sql';
    
    if (!file_exists($schemaFile)) {
        throw new Exception("❌ Archivo schema.sql no encontrado en: $schemaFile");
    }
    
    $schema = file_get_contents($schemaFile);
    
    // Limpiar el SQL
    $schema = preg_replace('/--.*$/m', '', $schema); // Remover comentarios
    $schema = preg_replace('/\/\*.*?\*\//s', '', $schema); // Remover comentarios multi-línea
    $schema = preg_replace('/CREATE DATABASE.*?;/i', '', $schema); // Remover CREATE DATABASE
    $schema = preg_replace('/USE .*;/i', '', $schema); // Remover USE
    
    // Dividir en statements
    $statements = array_filter(
        array_map('trim', preg_split('/;[\s]*\n/', $schema)),
        function($stmt) { return !empty($stmt); }
    );
    
    $success = 0;
    $errors = 0;
    
    foreach ($statements as $statement) {
        if (empty(trim($statement))) continue;
        
        try {
            $pdo->exec($statement . ';');
            $success++;
            echo ".";
            if ($success % 50 == 0) echo " ($success)\n";
        } catch (PDOException $e) {
            if (strpos($e->getMessage(), 'already exists') === false) {
                $errors++;
                echo "\n⚠️  Error: " . $e->getMessage() . "\n";
            }
        }
    }
    
    echo "\n✅ Schema: $success statements ejecutados, $errors errores\n\n";
    
    // Importar seeds
    echo "🌱 Importando seeds.sql...\n";
    $seedsFile = __DIR__ . '/database/seeds.sql';
    
    if (!file_exists($seedsFile)) {
        throw new Exception("❌ Archivo seeds.sql no encontrado");
    }
    
    $seeds = file_get_contents($seedsFile);
    $statements = array_filter(
        array_map('trim', preg_split('/;[\s]*\n/', $seeds)),
        function($stmt) { return !empty($stmt) && !preg_match('/^--/', $stmt); }
    );
    
    $success = 0;
    $errors = 0;
    
    foreach ($statements as $statement) {
        if (empty(trim($statement))) continue;
        
        try {
            $pdo->exec($statement . ';');
            $success++;
            echo ".";
            if ($success % 50 == 0) echo " ($success)\n";
        } catch (PDOException $e) {
            $errors++;
            echo "\n⚠️  Error: " . $e->getMessage() . "\n";
        }
    }
    
    echo "\n✅ Seeds: $success statements ejecutados, $errors errores\n\n";
    
    // Verificar resultados
    echo "📊 Verificando datos importados:\n";
    
    $tables = ['users', 'products', 'categories', 'orders', 'delivery_zones'];
    foreach ($tables as $table) {
        try {
            $stmt = $pdo->query("SELECT COUNT(*) as count FROM $table");
            $count = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
            echo "   ✅ $table: $count registros\n";
        } catch (PDOException $e) {
            echo "   ⚠️  $table: " . $e->getMessage() . "\n";
        }
    }
    
    // Marcar como completado
    file_put_contents($setupFile, date('Y-m-d H:i:s'));
    
    echo "\n🎉 ¡Setup completado exitosamente!\n\n";
    echo "📝 Próximos pasos:\n";
    echo "   1. ✅ Base de datos importada\n";
    echo "   2. 🗑️  ELIMINA este archivo (setup.php) por seguridad\n";
    echo "   3. 🚀 Prueba el sistema en /\n";
    echo "   4. 🔑 Login admin: admin@deliverysv.com / admin123\n\n";
    
} catch (Exception $e) {
    echo "\n❌ Error: " . $e->getMessage() . "\n";
    echo "\n📋 Stack trace:\n";
    echo $e->getTraceAsString();
}

echo "</pre>";
?>
