<?php
/**
 * Script para agregar datos de prueba
 */

require_once '../config/database.php';

try {
    $database = new Database();
    $conn = $database->getConnection();

    echo "🌱 Insertando datos de prueba...\n\n";

    // Insertar productos de prueba
    $products = [
        [
            'category_id' => 1, // Pizzas
            'name' => 'Pizza Margherita',
            'description' => 'Pizza clásica con salsa de tomate, mozzarella fresca y albahaca',
            'price' => 8.99,
            'image' => 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500',
            'is_available' => 1,
            'is_featured' => 1,
            'preparation_time' => 20
        ],
        [
            'category_id' => 1,
            'name' => 'Pizza Pepperoni',
            'description' => 'Pizza con abundante pepperoni y queso mozzarella',
            'price' => 10.99,
            'image' => 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500',
            'is_available' => 1,
            'is_featured' => 1,
            'preparation_time' => 20
        ],
        [
            'category_id' => 2, // Hamburguesas
            'name' => 'Hamburguesa Clásica',
            'description' => 'Carne de res, lechuga, tomate, cebolla, pepinillos y salsa especial',
            'price' => 7.99,
            'image' => 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500',
            'is_available' => 1,
            'is_featured' => 1,
            'preparation_time' => 15
        ],
        [
            'category_id' => 2,
            'name' => 'Hamburguesa BBQ',
            'description' => 'Carne de res, tocino, cebolla caramelizada y salsa BBQ',
            'price' => 9.99,
            'image' => 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=500',
            'is_available' => 1,
            'is_featured' => 0,
            'preparation_time' => 15
        ],
        [
            'category_id' => 3, // Pastas
            'name' => 'Spaghetti Carbonara',
            'description' => 'Pasta con salsa cremosa, tocino y parmesano',
            'price' => 11.99,
            'image' => 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=500',
            'is_available' => 1,
            'is_featured' => 0,
            'preparation_time' => 18
        ],
        [
            'category_id' => 3,
            'name' => 'Lasagna Bolognesa',
            'description' => 'Capas de pasta con carne, salsa bechamel y queso gratinado',
            'price' => 12.99,
            'image' => 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=500',
            'is_available' => 1,
            'is_featured' => 1,
            'preparation_time' => 25
        ],
        [
            'category_id' => 4, // Bebidas
            'name' => 'Coca Cola',
            'description' => 'Refresco 500ml',
            'price' => 1.99,
            'image' => 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=500',
            'is_available' => 1,
            'is_featured' => 0,
            'preparation_time' => 1
        ],
        [
            'category_id' => 4,
            'name' => 'Jugo Natural de Naranja',
            'description' => 'Jugo 100% natural recién exprimido',
            'price' => 2.99,
            'image' => 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500',
            'is_available' => 1,
            'is_featured' => 0,
            'preparation_time' => 3
        ]
    ];

    $query = "INSERT INTO products (category_id, name, description, price, image, is_available, is_featured, preparation_time)
              VALUES (:category_id, :name, :description, :price, :image, :is_available, :is_featured, :preparation_time)";

    $stmt = $conn->prepare($query);

    foreach ($products as $product) {
        $stmt->execute([
            ':category_id' => $product['category_id'],
            ':name' => $product['name'],
            ':description' => $product['description'],
            ':price' => $product['price'],
            ':image' => $product['image'],
            ':is_available' => $product['is_available'],
            ':is_featured' => $product['is_featured'],
            ':preparation_time' => $product['preparation_time']
        ]);
        echo "✅ Producto creado: {$product['name']}\n";
    }

    echo "\n✨ ¡Datos de prueba insertados exitosamente!\n";

} catch (PDOException $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
