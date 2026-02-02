<?php
/**
 * Product Model
 */

class Product {
    private $conn;
    private $table_name = "products";

    public $id;
    public $category_id;
    public $name;
    public $description;
    public $price;
    public $image;
    public $is_available;
    public $is_featured;
    public $preparation_time;
    public $display_order;

    public function __construct($db) {
        $this->conn = $db;
    }

    /**
     * Get all products
     */
    public function getAll($categoryId = null, $featured = null, $available = null) {
        $query = "SELECT p.*, c.name as category_name 
                  FROM " . $this->table_name . " p
                  LEFT JOIN categories c ON p.category_id = c.id
                  WHERE 1=1";

        if ($categoryId) {
            $query .= " AND p.category_id = :category_id";
        }

        if ($featured !== null) {
            $query .= " AND p.is_featured = :is_featured";
        }

        if ($available !== null) {
            $query .= " AND p.is_available = :is_available";
        }

        $query .= " ORDER BY p.display_order ASC, p.name ASC";

        $stmt = $this->conn->prepare($query);

        if ($categoryId) {
            $stmt->bindParam(":category_id", $categoryId);
        }

        if ($featured !== null) {
            $stmt->bindParam(":is_featured", $featured, PDO::PARAM_BOOL);
        }

        if ($available !== null) {
            $stmt->bindParam(":is_available", $available, PDO::PARAM_BOOL);
        }

        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Get product by ID
     */
    public function getById($id) {
        $query = "SELECT p.*, c.name as category_name 
                  FROM " . $this->table_name . " p
                  LEFT JOIN categories c ON p.category_id = c.id
                  WHERE p.id = :id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Create product
     */
    public function create() {
        $query = "INSERT INTO " . $this->table_name . "
                  SET category_id = :category_id,
                      name = :name,
                      description = :description,
                      price = :price,
                      image = :image,
                      is_available = :is_available,
                      is_featured = :is_featured,
                      preparation_time = :preparation_time,
                      display_order = :display_order";

        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(":category_id", $this->category_id);
        $stmt->bindParam(":name", $this->name);
        $stmt->bindParam(":description", $this->description);
        $stmt->bindParam(":price", $this->price);
        $stmt->bindParam(":image", $this->image);
        $stmt->bindParam(":is_available", $this->is_available, PDO::PARAM_BOOL);
        $stmt->bindParam(":is_featured", $this->is_featured, PDO::PARAM_BOOL);
        $stmt->bindParam(":preparation_time", $this->preparation_time);
        $stmt->bindParam(":display_order", $this->display_order);

        if ($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return true;
        }

        return false;
    }

    /**
     * Update product
     */
    public function update($id, $data) {
        $query = "UPDATE " . $this->table_name . "
                  SET category_id = :category_id,
                      name = :name,
                      description = :description,
                      price = :price,
                      is_available = :is_available,
                      is_featured = :is_featured,
                      preparation_time = :preparation_time,
                      display_order = :display_order";

        if (!empty($data['image_url'])) {
            $query .= ", image = :image";
        }

        $query .= " WHERE id = :id";

        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(":category_id", $data['category_id']);
        $stmt->bindParam(":name", $data['name']);
        $stmt->bindParam(":description", $data['description']);
        $stmt->bindParam(":price", $data['price']);
        $stmt->bindParam(":is_available", $data['is_available'], PDO::PARAM_INT);
        $stmt->bindParam(":is_featured", $data['is_featured'], PDO::PARAM_INT);
        $stmt->bindParam(":preparation_time", $data['preparation_time']);
        $stmt->bindParam(":display_order", $data['display_order']);
        $stmt->bindParam(":id", $id);

        if (!empty($data['image_url'])) {
            $stmt->bindParam(":image", $data['image_url']);
        }

        return $stmt->execute();
    }

    /**
     * Delete product
     */
    public function delete($id) {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);

        return $stmt->execute();
    }

    /**
     * Toggle availability
     */
    public function toggleAvailability($id, $available) {
        $query = "UPDATE " . $this->table_name . " 
                  SET is_available = :is_available 
                  WHERE id = :id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":is_available", $available, PDO::PARAM_INT);
        $stmt->bindParam(":id", $id, PDO::PARAM_INT);

        return $stmt->execute();
    }

    /**
     * Search products
     */
    public function search($keyword) {
        $query = "SELECT p.*, c.name as category_name 
                  FROM " . $this->table_name . " p
                  LEFT JOIN categories c ON p.category_id = c.id
                  WHERE p.name LIKE :keyword 
                     OR p.description LIKE :keyword
                  ORDER BY p.name ASC";

        $stmt = $this->conn->prepare($query);
        $keyword = "%{$keyword}%";
        $stmt->bindParam(":keyword", $keyword);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Get featured products
     */
    public function getFeatured($limit = 6) {
        $query = "SELECT p.*, c.name as category_name 
                  FROM " . $this->table_name . " p
                  LEFT JOIN categories c ON p.category_id = c.id
                  WHERE p.is_featured = 1 AND p.is_available = 1
                  ORDER BY p.display_order ASC
                  LIMIT :limit";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":limit", $limit, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Count products
     */
    public function count() {
        $query = "SELECT COUNT(*) as total FROM " . $this->table_name;
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        return $row['total'];
    }
}
?>
