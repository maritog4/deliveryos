<!DOCTYPE html>
<html>
<head>
    <title>Insertar Datos de Prueba</title>
    <style>
        body { font-family: Arial; padding: 20px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .success { color: #10b981; margin: 10px 0; }
        .error { color: #ef4444; margin: 10px 0; }
        h1 { color: #1e293b; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🌱 Insertar Datos de Prueba</h1>
<?php
require_once 'config/database.php';

try {
    $database = new Database();
    $conn = $database->getConnection();

    echo "<p>Conectado a la base de datos...</p>";

    // Insertar productos de prueba
    $products = [
        // Pizzas
        [
            'category_id' => 1,
            'name' => 'Pizza Margherita',
            'description' => 'Pizza clásica con salsa de tomate, mozzarella fresca y albahaca',
            'price' => 8.99,
            'image' => 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&h=500&fit=crop',
            'is_available' => 1,
            'is_featured' => 1,
            'preparation_time' => 20
        ],
        [
            'category_id' => 1,
            'name' => 'Pizza Pepperoni',
            'description' => 'Pizza con abundante pepperoni y queso mozzarella',
            'price' => 10.99,
            'image' => 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500&h=500&fit=crop',
            'is_available' => 1,
            'is_featured' => 1,
            'preparation_time' => 20
        ],
        [
            'category_id' => 1,
            'name' => 'Pizza Hawaiana',
            'description' => 'Jamón, piña y queso mozzarella sobre salsa de tomate',
            'price' => 9.99,
            'image' => 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&h=500&fit=crop',
            'is_available' => 1,
            'is_featured' => 0,
            'preparation_time' => 20
        ],
        [
            'category_id' => 1,
            'name' => 'Pizza Cuatro Quesos',
            'description' => 'Mozzarella, parmesano, gorgonzola y queso de cabra',
            'price' => 12.99,
            'image' => 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&h=500&fit=crop',
            'is_available' => 1,
            'is_featured' => 1,
            'preparation_time' => 22
        ],
        
        // Hamburguesas
        [
            'category_id' => 2,
            'name' => 'Hamburguesa Clásica',
            'description' => 'Carne de res 200g, lechuga, tomate, cebolla, pepinillos y salsa especial',
            'price' => 7.99,
            'image' => 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&h=500&fit=crop',
            'is_available' => 1,
            'is_featured' => 1,
            'preparation_time' => 15
        ],
        [
            'category_id' => 2,
            'name' => 'Hamburguesa BBQ Bacon',
            'description' => 'Carne de res, tocino crujiente, cebolla caramelizada y salsa BBQ',
            'price' => 9.99,
            'image' => 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&h=500&fit=crop',
            'is_available' => 1,
            'is_featured' => 1,
            'preparation_time' => 15
        ],
        [
            'category_id' => 2,
            'name' => 'Hamburguesa Doble',
            'description' => 'Doble carne de res, doble queso cheddar, lechuga y tomate',
            'price' => 11.99,
            'image' => 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=500&h=500&fit=crop',
            'is_available' => 1,
            'is_featured' => 0,
            'preparation_time' => 18
        ],
        [
            'category_id' => 2,
            'name' => 'Hamburguesa de Pollo',
            'description' => 'Pechuga de pollo crujiente, mayonesa, lechuga y tomate',
            'price' => 8.99,
            'image' => 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=500&h=500&fit=crop',
            'is_available' => 1,
            'is_featured' => 0,
            'preparation_time' => 15
        ],
        
        // Pastas
        [
            'category_id' => 3,
            'name' => 'Spaghetti Carbonara',
            'description' => 'Pasta con salsa cremosa, tocino y parmesano',
            'price' => 11.99,
            'image' => 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=500&h=500&fit=crop',
            'is_available' => 1,
            'is_featured' => 1,
            'preparation_time' => 18
        ],
        [
            'category_id' => 3,
            'name' => 'Lasagna Bolognesa',
            'description' => 'Capas de pasta con carne, salsa bechamel y queso gratinado',
            'price' => 12.99,
            'image' => 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=500&h=500&fit=crop',
            'is_available' => 1,
            'is_featured' => 1,
            'preparation_time' => 25
        ],
        [
            'category_id' => 3,
            'name' => 'Fettuccine Alfredo',
            'description' => 'Pasta con salsa cremosa de queso parmesano y mantequilla',
            'price' => 10.99,
            'image' => 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=500&h=500&fit=crop',
            'is_available' => 1,
            'is_featured' => 0,
            'preparation_time' => 16
        ],
        [
            'category_id' => 3,
            'name' => 'Ravioli de Ricotta',
            'description' => 'Raviolis rellenos de ricotta con salsa de tomate y albahaca',
            'price' => 13.99,
            'image' => 'https://images.unsplash.com/photo-1587740908075-9e245070dfaa?w=500&h=500&fit=crop',
            'is_available' => 1,
            'is_featured' => 0,
            'preparation_time' => 20
        ],
        
        // Bebidas
        [
            'category_id' => 4,
            'name' => 'Coca Cola 500ml',
            'description' => 'Refresco carbonatado clásico',
            'price' => 1.99,
            'image' => 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=500&h=500&fit=crop',
            'is_available' => 1,
            'is_featured' => 0,
            'preparation_time' => 1
        ],
        [
            'category_id' => 4,
            'name' => 'Jugo de Naranja Natural',
            'description' => 'Jugo 100% natural recién exprimido, 400ml',
            'price' => 2.99,
            'image' => 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500&h=500&fit=crop',
            'is_available' => 1,
            'is_featured' => 0,
            'preparation_time' => 3
        ],
        [
            'category_id' => 4,
            'name' => 'Limonada Casera',
            'description' => 'Limonada fresca preparada al momento, 500ml',
            'price' => 2.49,
            'image' => 'https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9d?w=500&h=500&fit=crop',
            'is_available' => 1,
            'is_featured' => 1,
            'preparation_time' => 3
        ],
        [
            'category_id' => 4,
            'name' => 'Agua Mineral 600ml',
            'description' => 'Agua purificada embotellada',
            'price' => 1.49,
            'image' => 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=500&h=500&fit=crop',
            'is_available' => 1,
            'is_featured' => 0,
            'preparation_time' => 1
        ],
    ];

    // Primero, limpiar productos existentes para evitar duplicados
    $conn->exec("DELETE FROM products WHERE id > 0");
    echo "<p class='success'>✓ Productos anteriores eliminados</p>";

    $query = "INSERT INTO products (category_id, name, description, price, image, is_available, is_featured, preparation_time, display_order)
              VALUES (:category_id, :name, :description, :price, :image, :is_available, :is_featured, :preparation_time, :display_order)";

    $stmt = $conn->prepare($query);

    $count = 0;
    foreach ($products as $index => $product) {
        $stmt->execute([
            ':category_id' => $product['category_id'],
            ':name' => $product['name'],
            ':description' => $product['description'],
            ':price' => $product['price'],
            ':image' => $product['image'],
            ':is_available' => $product['is_available'],
            ':is_featured' => $product['is_featured'],
            ':preparation_time' => $product['preparation_time'],
            ':display_order' => $index
        ]);
        echo "<p class='success'>✓ {$product['name']}</p>";
        $count++;
    }

    echo "<hr>";
    echo "<h2 class='success'>✨ ¡{$count} productos insertados exitosamente!</h2>";
    echo "<p><a href='/deliverySv/frontend/'>Ver el sitio</a> | <a href='/deliverySv/backend/api/products/read.php'>Ver API</a></p>";

} catch (PDOException $e) {
    echo "<p class='error'>❌ Error: " . $e->getMessage() . "</p>";
}
?>
    </div>
</body>
</html>
