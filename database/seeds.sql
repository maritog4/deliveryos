-- DeliverySV Sample Data (Seeds)
-- This file contains sample data for testing and demo purposes

USE deliverysv;

-- Disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- 1. SAMPLE USERS
-- ============================================
-- Password for all users: "password123" (hashed with bcrypt)
INSERT INTO users (name, email, phone, password, role, status) VALUES
('Admin Demo', 'admin@demo.com', '+503 7777-8888', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'active'),
('Carlos Méndez', 'customer@demo.com', '+503 7123-4567', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'customer', 'active'),
('María González', 'maria@example.com', '+503 7234-5678', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'customer', 'active'),
('José Ramírez', 'driver@demo.com', '+503 7345-6789', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'driver', 'active'),
('Ana López', 'driver2@demo.com', '+503 7456-7890', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'driver', 'active');

-- ============================================
-- 2. DELIVERY ZONES
-- ============================================
INSERT INTO delivery_zones (name, description, delivery_cost, min_order_amount, estimated_time, is_active) VALUES
('Centro', 'Centro de la ciudad', 2.50, 5.00, 30, 1),
('San Salvador Norte', 'Zona norte de San Salvador', 3.00, 7.00, 40, 1),
('San Salvador Sur', 'Zona sur de San Salvador', 3.50, 7.00, 45, 1),
('Antiguo Cuscatlán', 'Antiguo Cuscatlán y alrededores', 4.00, 10.00, 50, 1),
('Santa Tecla', 'Santa Tecla y Nueva San Salvador', 4.50, 10.00, 60, 1);

-- ============================================
-- 3. CUSTOMER ADDRESSES
-- ============================================
INSERT INTO addresses (user_id, name, address, reference, latitude, longitude, zone_id, is_default) VALUES
(2, 'Casa', 'Col. Escalón, Av. Masferrer Norte #123', 'Portón blanco, frente a cafetería', 13.704167, -89.229444, 1, 1),
(2, 'Oficina', 'Centro Comercial La Gran Vía, Torre B, Oficina 405', 'Torre de oficinas junto al parqueo', 13.674583, -89.242778, 2, 0),
(3, 'Casa', 'Col. San Benito, Calle La Reforma #456', 'Casa amarilla con jardín', 13.698889, -89.236944, 1, 1);

-- ============================================
-- 4. CATEGORIES
-- ============================================
INSERT INTO categories (name, description, image, display_order, status) VALUES
('Pizzas', 'Deliciosas pizzas artesanales con ingredientes frescos', '/backend/uploads/categories/pizzas.jpg', 1, 'active'),
('Hamburguesas', 'Hamburguesas gourmet con carne de res premium', '/backend/uploads/categories/burgers.jpg', 2, 'active'),
('Pastas', 'Pastas italianas preparadas al momento', '/backend/uploads/categories/pastas.jpg', 3, 'active'),
('Bebidas', 'Refrescos, jugos y bebidas especiales', '/backend/uploads/categories/drinks.jpg', 4, 'active'),
('Postres', 'Postres caseros y dulces tradicionales', '/backend/uploads/categories/desserts.jpg', 5, 'active');

-- ============================================
-- 5. PRODUCTS
-- ============================================
INSERT INTO products (category_id, name, description, price, image, stock, is_featured, status) VALUES
-- Pizzas
(1, 'Pizza Margherita', 'Pizza clásica con tomate, mozzarella fresca, albahaca y aceite de oliva', 8.99, '/backend/uploads/products/pizza-margherita.jpg', 50, 1, 'active'),
(1, 'Pizza Pepperoni', 'Pizza con abundante pepperoni, mozzarella y salsa de tomate casera', 10.99, '/backend/uploads/products/pizza-pepperoni.jpg', 45, 1, 'active'),
(1, 'Pizza Hawaiana', 'Pizza con jamón, piña, mozzarella y salsa BBQ', 9.99, '/backend/uploads/products/pizza-hawaiana.jpg', 40, 0, 'active'),
(1, 'Pizza Cuatro Quesos', 'Mozzarella, parmesano, gorgonzola y queso de cabra', 12.99, '/backend/uploads/products/pizza-quesos.jpg', 35, 1, 'active'),

-- Hamburguesas
(2, 'Hamburguesa Clásica', 'Carne de res 200g, lechuga, tomate, cebolla, pepinillos y salsa especial', 7.50, '/backend/uploads/products/burger-clasica.jpg', 60, 1, 'active'),
(2, 'Hamburguesa BBQ Bacon', 'Carne de res, bacon crujiente, cebolla caramelizada, queso cheddar y salsa BBQ', 9.50, '/backend/uploads/products/burger-bbq.jpg', 55, 1, 'active'),
(2, 'Hamburguesa Doble Carne', 'Doble carne de res 400g, doble queso, lechuga, tomate y salsa especial', 11.99, '/backend/uploads/products/burger-doble.jpg', 40, 0, 'active'),
(2, 'Hamburguesa de Pollo', 'Pechuga de pollo empanizada, lechuga, tomate, mayonesa y mostaza', 6.99, '/backend/uploads/products/burger-pollo.jpg', 50, 0, 'active'),

-- Pastas
(3, 'Pasta Carbonara', 'Spaghetti con salsa cremosa, bacon, huevo y parmesano', 9.50, '/backend/uploads/products/pasta-carbonara.jpg', 30, 1, 'active'),
(3, 'Lasagna Boloñesa', 'Lasagna casera con carne, bechamel, mozzarella y parmesano', 11.50, '/backend/uploads/products/lasagna.jpg', 25, 1, 'active'),
(3, 'Fettuccine Alfredo', 'Pasta fettuccine con salsa alfredo cremosa y parmesano', 8.99, '/backend/uploads/products/fettuccine.jpg', 30, 0, 'active'),
(3, 'Ravioli de Ricotta', 'Ravioles rellenos de ricotta con salsa de tomate y albahaca', 10.50, '/backend/uploads/products/ravioli.jpg', 20, 0, 'active'),

-- Bebidas
(4, 'Coca Cola 500ml', 'Refresco de cola en botella', 1.50, '/backend/uploads/products/coca-cola.jpg', 100, 0, 'active'),
(4, 'Agua Mineral 600ml', 'Agua mineral natural', 1.00, '/backend/uploads/products/agua.jpg', 100, 0, 'active'),
(4, 'Limonada Natural', 'Limonada preparada con limones frescos', 2.50, '/backend/uploads/products/limonada.jpg', 50, 0, 'active'),
(4, 'Jugo de Naranja', 'Jugo de naranja recién exprimido', 3.00, '/backend/uploads/products/jugo-naranja.jpg', 40, 0, 'active'),

-- Postres
(5, 'Cheesecake de Fresa', 'Pastel de queso con coulis de fresa', 4.50, '/backend/uploads/products/cheesecake.jpg', 20, 0, 'active'),
(5, 'Brownie con Helado', 'Brownie de chocolate caliente con helado de vainilla', 4.00, '/backend/uploads/products/brownie.jpg', 25, 0, 'active'),
(5, 'Tiramisú', 'Postre italiano con café, mascarpone y cacao', 5.00, '/backend/uploads/products/tiramisu.jpg', 15, 0, 'active');

-- ============================================
-- 6. SAMPLE ORDERS
-- ============================================
INSERT INTO orders (user_id, total_amount, delivery_cost, final_amount, delivery_address, delivery_reference, delivery_zone_id, payment_method, payment_status, order_status, driver_id) VALUES
-- Orden completada
(2, 21.48, 2.50, 23.98, 'Col. Escalón, Av. Masferrer Norte #123', 'Portón blanco, frente a cafetería', 1, 'card', 'paid', 'delivered', 4),
-- Orden en camino
(2, 27.48, 3.00, 30.48, 'Centro Comercial La Gran Vía, Torre B, Oficina 405', 'Torre de oficinas junto al parqueo', 2, 'card', 'paid', 'on_the_way', 4),
-- Orden preparándose
(3, 19.48, 2.50, 21.98, 'Col. San Benito, Calle La Reforma #456', 'Casa amarilla con jardín', 1, 'cash', 'pending', 'preparing', NULL),
-- Orden pendiente
(2, 15.99, 2.50, 18.49, 'Col. Escalón, Av. Masferrer Norte #123', 'Portón blanco, frente a cafetería', 1, 'card', 'paid', 'pending', NULL),
-- Orden entregada
(3, 32.97, 3.50, 36.47, 'Col. San Benito, Calle La Reforma #456', 'Casa amarilla con jardín', 3, 'card', 'paid', 'delivered', 5);

-- ============================================
-- 7. ORDER ITEMS
-- ============================================
-- Orden 1 (ID=1) - Completada
INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal) VALUES
(1, 1, 1, 8.99, 8.99),    -- Pizza Margherita
(1, 5, 1, 7.50, 7.50),    -- Hamburguesa Clásica
(1, 13, 2, 1.50, 3.00),   -- Coca Cola x2
(1, 15, 1, 2.50, 2.50);   -- Limonada

-- Orden 2 (ID=2) - En camino
INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal) VALUES
(2, 2, 1, 10.99, 10.99),  -- Pizza Pepperoni
(2, 6, 1, 9.50, 9.50),    -- Hamburguesa BBQ
(2, 9, 1, 9.50, 9.50),    -- Pasta Carbonara
(2, 18, 1, 4.50, 4.50);   -- Cheesecake

-- Orden 3 (ID=3) - Preparándose
INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal) VALUES
(3, 4, 1, 12.99, 12.99),  -- Pizza 4 Quesos
(3, 8, 1, 6.99, 6.99);    -- Hamburguesa Pollo

-- Orden 4 (ID=4) - Pendiente
INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal) VALUES
(4, 10, 1, 11.50, 11.50), -- Lasagna
(4, 16, 1, 3.00, 3.00);   -- Jugo Naranja

-- Orden 5 (ID=5) - Entregada
INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal) VALUES
(5, 2, 2, 10.99, 21.98),  -- Pizza Pepperoni x2
(5, 7, 1, 11.99, 11.99);  -- Hamburguesa Doble

-- ============================================
-- 8. DRIVER ASSIGNMENTS (for tracking)
-- ============================================
INSERT INTO drivers (user_id, vehicle_type, license_plate, is_available, current_lat, current_lng) VALUES
(4, 'motorcycle', 'M-12345', 1, 13.692940, -89.218191),
(5, 'car', 'P-67890', 1, 13.686389, -89.230556);

-- ============================================
-- 9. COUPONS (Optional - if you have this feature)
-- ============================================
INSERT INTO coupons (code, description, discount_type, discount_value, min_order_amount, max_uses, times_used, expiry_date, is_active) VALUES
('WELCOME10', 'Descuento de bienvenida 10%', 'percentage', 10.00, 10.00, 100, 5, DATE_ADD(CURRENT_DATE, INTERVAL 30 DAY), 1),
('SAVE5', 'Ahorra $5 en tu orden', 'fixed', 5.00, 20.00, 50, 2, DATE_ADD(CURRENT_DATE, INTERVAL 15 DAY), 1),
('FIRST20', '20% descuento primera orden', 'percentage', 20.00, 15.00, 1000, 45, DATE_ADD(CURRENT_DATE, INTERVAL 60 DAY), 1);

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify data was inserted correctly:
-- SELECT COUNT(*) as total_users FROM users;
-- SELECT COUNT(*) as total_products FROM products;
-- SELECT COUNT(*) as total_orders FROM orders;
-- SELECT COUNT(*) as total_categories FROM categories;
-- SELECT COUNT(*) as total_zones FROM delivery_zones;

-- ============================================
-- NOTES FOR CODECANYON BUYERS
-- ============================================
-- Default login credentials (password: password123):
-- Admin: admin@demo.com
-- Customer: customer@demo.com
-- Driver: driver@demo.com
--
-- IMPORTANT: Change all passwords after installation!
-- You can use the admin panel to create new users and modify existing ones.
