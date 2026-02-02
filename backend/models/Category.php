<?php
/**
 * Category Model
 */

class Category {
    private $conn;
    private $table_name = "categories";

    public $id;
    public $name;
    public $description;
    public $image;
    public $display_order;
    public $status;

    public function __construct($db) {
        $this->conn = $db;
    }

    /**
     * Get all categories
     */
    public function getAll($status = null) {
        $query = "SELECT * FROM " . $this->table_name;

        if ($status !== null) {
            $query .= " WHERE status = :status";
        }

        $query .= " ORDER BY display_order ASC, name ASC";

        $stmt = $this->conn->prepare($query);

        if ($status !== null) {
            $stmt->bindParam(":status", $status);
        }

        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Get category by ID
     */
    public function getById($id) {
        $query = "SELECT * FROM " . $this->table_name . " WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Create category
     */
    public function create() {
        $query = "INSERT INTO " . $this->table_name . "
                  SET name = :name,
                      description = :description,
                      image = :image,
                      display_order = :display_order,
                      status = :status";

        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(":name", $this->name);
        $stmt->bindParam(":description", $this->description);
        $stmt->bindParam(":image", $this->image);
        $stmt->bindParam(":display_order", $this->display_order);
        $stmt->bindParam(":status", $this->status);

        if ($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return true;
        }

        return false;
    }

    /**
     * Update category
     */
    public function update($id, $data) {
        $query = "UPDATE " . $this->table_name . "
                  SET name = :name,
                      description = :description,
                      display_order = :display_order,
                      status = :status";

        if (!empty($data['image_url'])) {
            $query .= ", image = :image";
        }

        $query .= " WHERE id = :id";

        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(":name", $data['name']);
        $stmt->bindParam(":description", $data['description']);
        $stmt->bindParam(":display_order", $data['display_order']);
        $stmt->bindParam(":status", $data['status']);
        $stmt->bindParam(":id", $id);

        if (!empty($data['image_url'])) {
            $stmt->bindParam(":image", $data['image_url']);
        }

        return $stmt->execute();
    }

    /**
     * Delete category
     */
    public function delete($id) {
        // First check if category has products
        $checkQuery = "SELECT COUNT(*) as total FROM products WHERE category_id = :id";
        $checkStmt = $this->conn->prepare($checkQuery);
        $checkStmt->bindParam(":id", $id);
        $checkStmt->execute();
        $result = $checkStmt->fetch(PDO::FETCH_ASSOC);

        if ($result['total'] > 0) {
            return false; // Cannot delete category with products
        }

        $query = "DELETE FROM " . $this->table_name . " WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);

        return $stmt->execute();
    }

    /**
     * Get categories with product count
     */
    public function getAllWithCount() {
        $query = "SELECT c.*, COUNT(p.id) as product_count
                  FROM " . $this->table_name . " c
                  LEFT JOIN products p ON c.id = p.category_id
                  GROUP BY c.id
                  ORDER BY c.display_order ASC, c.name ASC";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
?>
