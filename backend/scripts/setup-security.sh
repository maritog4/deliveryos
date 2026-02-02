#!/bin/bash

echo "════════════════════════════════════════════════════════════════════"
echo "🔒 CONFIGURACIÓN DE SEGURIDAD - Delivery System"
echo "════════════════════════════════════════════════════════════════════"
echo ""

# Generar contraseña segura para base de datos
DB_PASSWORD=$(openssl rand -base64 24 | tr -d "=+/" | cut -c1-24)
JWT_SECRET=$(openssl rand -base64 48 | tr -d "=+/" | cut -c1-64)

echo "📝 Generando credenciales seguras..."
echo ""
echo "✅ Contraseña de BD generada: $DB_PASSWORD"
echo "✅ JWT Secret generado: $JWT_SECRET"
echo ""

# Actualizar archivo .env
ENV_FILE="/Applications/AMPPS/www/deliverySv/backend/.env"

if [ -f "$ENV_FILE" ]; then
    echo "📝 Actualizando archivo .env..."
    
    # Actualizar contraseña de BD
    sed -i '' "s/DB_PASS=.*/DB_PASS=$DB_PASSWORD/" "$ENV_FILE"
    
    # Actualizar JWT secret
    sed -i '' "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" "$ENV_FILE"
    
    echo "✅ Archivo .env actualizado"
else
    echo "❌ Error: Archivo .env no encontrado"
    exit 1
fi

echo ""
echo "════════════════════════════════════════════════════════════════════"
echo "🗄️  CONFIGURANDO BASE DE DATOS"
echo "════════════════════════════════════════════════════════════════════"
echo ""

# Crear usuario de base de datos con la nueva contraseña
echo "Creando usuario 'deliverysv_user' en MySQL..."

/Applications/AMPPS/apps/mysql/bin/mysql -u root -pmysql << EOF
-- Eliminar usuario si existe
DROP USER IF EXISTS 'deliverysv_user'@'localhost';

-- Crear nuevo usuario con contraseña segura
CREATE USER 'deliverysv_user'@'localhost' IDENTIFIED BY '$DB_PASSWORD';

-- Otorgar permisos completos en la base de datos deliverysv
GRANT ALL PRIVILEGES ON deliverysv.* TO 'deliverysv_user'@'localhost';

-- Refrescar privilegios
FLUSH PRIVILEGES;

-- Mostrar confirmación
SELECT CONCAT('✅ Usuario creado: deliverysv_user') AS Status;
EOF

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Usuario de base de datos creado correctamente"
else
    echo ""
    echo "❌ Error al crear usuario de base de datos"
    exit 1
fi

echo ""
echo "════════════════════════════════════════════════════════════════════"
echo "✅ CONFIGURACIÓN COMPLETA"
echo "════════════════════════════════════════════════════════════════════"
echo ""
echo "🔑 CREDENCIALES GENERADAS:"
echo ""
echo "  Usuario BD: deliverysv_user"
echo "  Contraseña: $DB_PASSWORD"
echo "  JWT Secret: [guardado en .env]"
echo ""
echo "⚠️  IMPORTANTE:"
echo ""
echo "  1. Las credenciales están en: backend/.env"
echo "  2. NO compartas el archivo .env"
echo "  3. Agrega .env al .gitignore"
echo "  4. Cambia la contraseña de root de MySQL también"
echo ""
echo "📝 Para cambiar contraseña de root:"
echo "   /Applications/AMPPS/mysql/bin/mysqladmin -u root -pmysql password 'NuevaContraseñaSegura'"
echo ""
echo "════════════════════════════════════════════════════════════════════"
