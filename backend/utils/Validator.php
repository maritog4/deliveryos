<?php
/**
 * Utilidad de Validación de Datos
 * Valida y sanitiza datos de entrada
 */

class Validator {
    
    /**
     * Valida un email
     */
    public static function email($email) {
        return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
    }
    
    /**
     * Valida un teléfono (formato: 1234-5678 o 12345678)
     */
    public static function phone($phone) {
        $pattern = '/^[0-9]{4}-?[0-9]{4}$/';
        return preg_match($pattern, $phone);
    }
    
    /**
     * Valida una contraseña (mínimo 8 caracteres)
     */
    public static function password($password) {
        return strlen($password) >= 8;
    }
    
    /**
     * Valida un número positivo
     */
    public static function positiveNumber($number) {
        return is_numeric($number) && $number > 0;
    }
    
    /**
     * Valida un rango de valores
     */
    public static function inRange($value, $min, $max) {
        return $value >= $min && $value <= $max;
    }
    
    /**
     * Valida que un valor esté en un array de opciones
     */
    public static function inArray($value, $options) {
        return in_array($value, $options);
    }
    
    /**
     * Sanitiza una cadena de texto
     */
    public static function sanitizeString($string) {
        return htmlspecialchars(strip_tags(trim($string)), ENT_QUOTES, 'UTF-8');
    }
    
    /**
     * Valida campos requeridos
     */
    public static function required($fields, $data) {
        $missing = [];
        
        foreach ($fields as $field) {
            if (!isset($data->$field) || empty($data->$field)) {
                $missing[] = $field;
            }
        }
        
        return $missing;
    }
    
    /**
     * Valida formato de orden
     */
    public static function validateOrder($data) {
        $errors = [];
        
        // Validar campos requeridos
        $required = ['customer_name', 'customer_phone', 'payment_method', 'items'];
        $missing = self::required($required, $data);
        
        if (!empty($missing)) {
            $errors['missing_fields'] = $missing;
        }
        
        // Validar teléfono
        if (isset($data->customer_phone) && !self::phone($data->customer_phone)) {
            $errors['customer_phone'] = 'Formato de teléfono inválido';
        }
        
        // Validar email si existe
        if (isset($data->customer_email) && !empty($data->customer_email)) {
            if (!self::email($data->customer_email)) {
                $errors['customer_email'] = 'Formato de email inválido';
            }
        }
        
        // Validar método de pago
        $validPaymentMethods = ['cash', 'card', 'transfer'];
        if (isset($data->payment_method) && !self::inArray($data->payment_method, $validPaymentMethods)) {
            $errors['payment_method'] = 'Método de pago inválido';
        }
        
        // Validar items
        if (isset($data->items)) {
            if (!is_array($data->items) || empty($data->items)) {
                $errors['items'] = 'Debe incluir al menos un producto';
            } else {
                foreach ($data->items as $index => $item) {
                    if (!isset($item->id) || !isset($item->quantity)) {
                        $errors["items[$index]"] = 'Item incompleto';
                    }
                    if (isset($item->quantity) && (!is_numeric($item->quantity) || $item->quantity <= 0)) {
                        $errors["items[$index]"] = 'Cantidad inválida';
                    }
                }
            }
        }
        
        return $errors;
    }
    
    /**
     * Valida formato de producto
     */
    public static function validateProduct($data) {
        $errors = [];
        
        // Validar campos requeridos
        $required = ['name', 'price', 'category_id'];
        $missing = self::required($required, $data);
        
        if (!empty($missing)) {
            $errors['missing_fields'] = $missing;
        }
        
        // Validar precio
        if (isset($data->price) && !self::positiveNumber($data->price)) {
            $errors['price'] = 'El precio debe ser un número positivo';
        }
        
        // Validar nombre
        if (isset($data->name) && strlen($data->name) < 3) {
            $errors['name'] = 'El nombre debe tener al menos 3 caracteres';
        }
        
        return $errors;
    }
}
