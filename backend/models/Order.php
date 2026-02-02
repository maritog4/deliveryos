<?php
/**
 * Order Model
 */

class Order {
    private $conn;
    private $table_name = "orders";

    public $id;
    public $order_number;
    public $user_id;
    public $driver_id;
    public $delivery_type;
    public $status;
    public $customer_name;
    public $customer_phone;
    public $customer_email;
    public $delivery_address;
    public $delivery_reference;
    public $delivery_zone_id;
    public $delivery_latitude;
    public $delivery_longitude;
    public $payment_method;
    public $payment_status;
    public $subtotal;
    public $delivery_cost;
    public $discount;
    public $coupon_code;
    public $total;
    public $customer_notes;
    public $admin_notes;

    public function __construct($db) {
        $this->conn = $db;
    }

    /**
     * Generate unique order number
     */
    public function generateOrderNumber() {
        return 'ORD-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -6));
    }

    /**
     * Create order
     */
    public function create() {
        $this->order_number = $this->generateOrderNumber();

        $query = "INSERT INTO " . $this->table_name . "
                  SET order_number = :order_number,
                      user_id = :user_id,
                      delivery_type = :delivery_type,
                      status = :status,
                      customer_name = :customer_name,
                      customer_phone = :customer_phone,
                      customer_email = :customer_email,
                      delivery_address = :delivery_address,
                      delivery_reference = :delivery_reference,
                      delivery_zone_id = :delivery_zone_id,
                      delivery_latitude = :delivery_latitude,
                      delivery_longitude = :delivery_longitude,
                      payment_method = :payment_method,
                      payment_status = :payment_status,
                      subtotal = :subtotal,
                      delivery_cost = :delivery_cost,
                      discount = :discount,
                      coupon_code = :coupon_code,
                      total = :total,
                      customer_notes = :customer_notes";

        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(":order_number", $this->order_number);
        $stmt->bindParam(":user_id", $this->user_id);
        $stmt->bindParam(":delivery_type", $this->delivery_type);
        $stmt->bindParam(":status", $this->status);
        $stmt->bindParam(":customer_name", $this->customer_name);
        $stmt->bindParam(":customer_phone", $this->customer_phone);
        $stmt->bindParam(":customer_email", $this->customer_email);
        $stmt->bindParam(":delivery_address", $this->delivery_address);
        $stmt->bindParam(":delivery_reference", $this->delivery_reference);
        $stmt->bindParam(":delivery_zone_id", $this->delivery_zone_id);
        $stmt->bindParam(":delivery_latitude", $this->delivery_latitude);
        $stmt->bindParam(":delivery_longitude", $this->delivery_longitude);
        $stmt->bindParam(":payment_method", $this->payment_method);
        $stmt->bindParam(":payment_status", $this->payment_status);
        $stmt->bindParam(":subtotal", $this->subtotal);
        $stmt->bindParam(":delivery_cost", $this->delivery_cost);
        $stmt->bindParam(":discount", $this->discount);
        $stmt->bindParam(":coupon_code", $this->coupon_code);
        $stmt->bindParam(":total", $this->total);
        $stmt->bindParam(":customer_notes", $this->customer_notes);

        if ($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return true;
        }

        return false;
    }

    /**
     * Get order by ID
     */
    public function getById($id) {
        $query = "SELECT o.*, 
                         dz.name as zone_name,
                         u.name as customer_full_name,
                         d.name as driver_name
                  FROM " . $this->table_name . " o
                  LEFT JOIN delivery_zones dz ON o.delivery_zone_id = dz.id
                  LEFT JOIN users u ON o.user_id = u.id
                  LEFT JOIN users d ON o.driver_id = d.id
                  WHERE o.id = :id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Get order by order number
     */
    public function getByOrderNumber($orderNumber) {
        $query = "SELECT o.*, 
                         dz.name as zone_name,
                         u.name as customer_full_name,
                         d.name as driver_name
                  FROM " . $this->table_name . " o
                  LEFT JOIN delivery_zones dz ON o.delivery_zone_id = dz.id
                  LEFT JOIN users u ON o.user_id = u.id
                  LEFT JOIN users d ON o.driver_id = d.id
                  WHERE o.order_number = :order_number";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":order_number", $orderNumber);
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Get all orders with filters
     */
    public function getAll($filters = []) {
        $query = "SELECT o.*, 
                         dz.name as zone_name,
                         u.name as customer_full_name,
                         d.name as driver_name
                  FROM " . $this->table_name . " o
                  LEFT JOIN delivery_zones dz ON o.delivery_zone_id = dz.id
                  LEFT JOIN users u ON o.user_id = u.id
                  LEFT JOIN users d ON o.driver_id = d.id
                  WHERE 1=1";

        // Filtro automático por fecha
        if (isset($filters['date_filter'])) {
            switch ($filters['date_filter']) {
                case 'today':
                    $query .= " AND DATE(o.created_at) = CURDATE()";
                    break;
                case 'week':
                    $query .= " AND YEARWEEK(o.created_at, 1) = YEARWEEK(CURDATE(), 1)";
                    break;
                case 'month':
                    $query .= " AND YEAR(o.created_at) = YEAR(CURDATE()) AND MONTH(o.created_at) = MONTH(CURDATE())";
                    break;
                case 'all':
                    // No agregar filtro de fecha
                    break;
            }
        }

        if (isset($filters['status'])) {
            $query .= " AND o.status = :status";
        }

        if (isset($filters['user_id'])) {
            $query .= " AND o.user_id = :user_id";
        }

        if (isset($filters['driver_id'])) {
            $query .= " AND o.driver_id = :driver_id";
        }

        if (isset($filters['date_from'])) {
            $query .= " AND DATE(o.created_at) >= :date_from";
        }

        if (isset($filters['date_to'])) {
            $query .= " AND DATE(o.created_at) <= :date_to";
        }

        $query .= " ORDER BY o.created_at DESC";

        if (isset($filters['limit'])) {
            $query .= " LIMIT :limit";
            if (isset($filters['offset'])) {
                $query .= " OFFSET :offset";
            }
        }

        $stmt = $this->conn->prepare($query);

        if (isset($filters['status'])) {
            $stmt->bindParam(":status", $filters['status']);
        }

        if (isset($filters['user_id'])) {
            $stmt->bindParam(":user_id", $filters['user_id']);
        }

        if (isset($filters['driver_id'])) {
            $stmt->bindParam(":driver_id", $filters['driver_id']);
        }

        if (isset($filters['date_from'])) {
            $stmt->bindParam(":date_from", $filters['date_from']);
        }

        if (isset($filters['date_to'])) {
            $stmt->bindParam(":date_to", $filters['date_to']);
        }

        if (isset($filters['limit'])) {
            $stmt->bindParam(":limit", $filters['limit'], PDO::PARAM_INT);
            if (isset($filters['offset'])) {
                $stmt->bindParam(":offset", $filters['offset'], PDO::PARAM_INT);
            }
        }

        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Update order status
     */
    public function updateStatus($id, $status) {
        $query = "UPDATE " . $this->table_name . " SET status = :status";

        // Update timestamp based on status
        switch ($status) {
            case 'confirmed':
                $query .= ", confirmed_at = NOW()";
                break;
            case 'preparing':
                $query .= ", preparing_at = NOW()";
                break;
            case 'ready':
                $query .= ", ready_at = NOW()";
                break;
            case 'picked_up':
                $query .= ", picked_up_at = NOW()";
                break;
            case 'delivered':
                $query .= ", delivered_at = NOW(), payment_status = 'paid'";
                break;
            case 'cancelled':
                $query .= ", cancelled_at = NOW()";
                break;
        }

        $query .= " WHERE id = :id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":status", $status);
        $stmt->bindParam(":id", $id);

        return $stmt->execute();
    }

    /**
     * Assign driver to order
     */
    public function assignDriver($orderId, $driverId) {
        $query = "UPDATE " . $this->table_name . " 
                  SET driver_id = :driver_id 
                  WHERE id = :id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":driver_id", $driverId);
        $stmt->bindParam(":id", $orderId);

        return $stmt->execute();
    }

    /**
     * Cancel order
     */
    public function cancel($id, $reason) {
        $query = "UPDATE " . $this->table_name . " 
                  SET status = :status,
                      cancelled_at = NOW(),
                      cancellation_reason = :reason
                  WHERE id = :id";

        $status = ORDER_STATUS_CANCELLED;
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":status", $status);
        $stmt->bindParam(":reason", $reason);
        $stmt->bindParam(":id", $id);

        return $stmt->execute();
    }

    /**
     * Get today's orders count
     */
    public function getTodayCount() {
        $query = "SELECT COUNT(*) as total 
                  FROM " . $this->table_name . " 
                  WHERE DATE(created_at) = CURDATE()";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        return $row['total'];
    }

    /**
     * Get today's revenue
     */
    public function getTodayRevenue() {
        $query = "SELECT SUM(total) as revenue 
                  FROM " . $this->table_name . " 
                  WHERE DATE(created_at) = CURDATE() 
                    AND status != :cancelled";

        $cancelled = ORDER_STATUS_CANCELLED;
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":cancelled", $cancelled);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        return $row['revenue'] ?? 0;
    }

    /**
     * Get statistics
     */
    public function getStats($dateFrom = null, $dateTo = null) {
        $query = "SELECT 
                    COUNT(*) as total_orders,
                    SUM(CASE WHEN status = :delivered THEN 1 ELSE 0 END) as completed_orders,
                    SUM(CASE WHEN status = :cancelled THEN 1 ELSE 0 END) as cancelled_orders,
                    SUM(CASE WHEN status NOT IN (:delivered2, :cancelled2) THEN total ELSE 0 END) as pending_revenue,
                    SUM(CASE WHEN status = :delivered3 THEN total ELSE 0 END) as completed_revenue
                  FROM " . $this->table_name . "
                  WHERE 1=1";

        if ($dateFrom) {
            $query .= " AND DATE(created_at) >= :date_from";
        }

        if ($dateTo) {
            $query .= " AND DATE(created_at) <= :date_to";
        }

        $stmt = $this->conn->prepare($query);
        
        $delivered = ORDER_STATUS_DELIVERED;
        $cancelled = ORDER_STATUS_CANCELLED;
        
        $stmt->bindParam(":delivered", $delivered);
        $stmt->bindParam(":cancelled", $cancelled);
        $stmt->bindParam(":delivered2", $delivered);
        $stmt->bindParam(":cancelled2", $cancelled);
        $stmt->bindParam(":delivered3", $delivered);

        if ($dateFrom) {
            $stmt->bindParam(":date_from", $dateFrom);
        }

        if ($dateTo) {
            $stmt->bindParam(":date_to", $dateTo);
        }

        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}
?>
