#!/bin/bash

# Script para crear el paquete de CodeCanyon
# Ejecutar desde la raíz del proyecto: bash codecanyon/create-package.sh

echo "🚀 Creando paquete para CodeCanyon..."
echo ""

# Variables
PROJECT_NAME="DeliveryOS"
VERSION="1.0.0"
DATE=$(date +%Y%m%d)
OUTPUT_DIR="codecanyon/package"
PACKAGE_NAME="${PROJECT_NAME}_v${VERSION}_${DATE}.zip"

# Crear directorio temporal
TEMP_DIR="/tmp/${PROJECT_NAME}_temp"
rm -rf $TEMP_DIR
mkdir -p $TEMP_DIR

echo "📁 Copiando archivos..."

# Copiar backend (excluir logs y archivos temporales)
echo "  ✅ Backend..."
rsync -av --exclude='logs' --exclude='.DS_Store' --exclude='*.log' backend/ $TEMP_DIR/backend/

# Copiar frontend build
echo "  ✅ Frontend..."
if [ -d "frontend/dist" ]; then
  cp -r frontend/dist $TEMP_DIR/frontend/
else
  echo "  ⚠️  frontend/dist no existe. Ejecutando npm run build..."
  cd frontend
  npm run build
  cd ..
  cp -r frontend/dist $TEMP_DIR/frontend/
fi

# Copiar código fuente del frontend (para desarrolladores)
echo "  ✅ Frontend Source..."
mkdir -p $TEMP_DIR/frontend-src
rsync -av --exclude='node_modules' --exclude='dist' --exclude='.git' frontend/ $TEMP_DIR/frontend-src/

# Copiar database
echo "  ✅ Database..."
cp -r database $TEMP_DIR/

# Copiar websocket
echo "  ✅ WebSocket..."
mkdir -p $TEMP_DIR/websocket
rsync -av --exclude='node_modules' websocket/ $TEMP_DIR/websocket/

# Copiar documentación
echo "  ✅ Documentación..."
cp codecanyon/package/README.md $TEMP_DIR/
cp LICENSE $TEMP_DIR/ 2>/dev/null || echo "# Licencia Regular de Envato" > $TEMP_DIR/LICENSE

# Crear archivo de instalación
cat > $TEMP_DIR/INSTALL.txt << 'EOF'
INSTALACIÓN RÁPIDA:

1. Sube la carpeta completa a tu servidor
2. Crea una base de datos MySQL
3. Importa: database/schema.sql
4. Edita: backend/config/database.php (datos de MySQL)
5. Edita: frontend/index.html (cambiar URL del API si es necesario)
6. Permisos: chmod -R 755 backend/uploads/
7. Accede: https://tudominio.com/frontend/

Más detalles en README.md
EOF

# Crear estructura de directorios necesaria
mkdir -p $TEMP_DIR/backend/uploads/products
mkdir -p $TEMP_DIR/backend/uploads/restaurant
mkdir -p $TEMP_DIR/backend/logs
chmod -R 755 $TEMP_DIR/backend/uploads 2>/dev/null
chmod -R 755 $TEMP_DIR/backend/logs 2>/dev/null

# Crear .htaccess para backend/uploads (seguridad)
cat > $TEMP_DIR/backend/uploads/.htaccess << 'EOF'
# Permitir solo imágenes
<FilesMatch "\.(jpg|jpeg|png|gif|webp)$">
    Order Allow,Deny
    Allow from all
</FilesMatch>
<FilesMatch "^((?!\.jpg|\.jpeg|\.png|\.gif|\.webp).)*$">
    Order Allow,Deny
    Deny from all
</FilesMatch>
EOF

echo ""
echo "📦 Creando archivo ZIP..."

# Ir al directorio temporal y crear ZIP
cd $TEMP_DIR
zip -r "/Applications/AMPPS/www/deliverySv/$OUTPUT_DIR/$PACKAGE_NAME" . > /dev/null
cd -

# Limpiar
rm -rf $TEMP_DIR

# Verificar tamaño
SIZE=$(du -h "$OUTPUT_DIR/$PACKAGE_NAME" | cut -f1)

echo ""
echo "✅ ¡Paquete creado exitosamente!"
echo ""
echo "📦 Archivo: $OUTPUT_DIR/$PACKAGE_NAME"
echo "📏 Tamaño: $SIZE"
echo ""
echo "📋 Contenido incluido:"
echo "  ✅ Backend (PHP API)"
echo "  ✅ Frontend (Build de producción)"
echo "  ✅ Frontend Source (Código fuente React)"
echo "  ✅ Database (SQL)"
echo "  ✅ WebSocket Server"
echo "  ✅ Documentación completa"
echo ""
echo "🚀 Listo para subir a CodeCanyon!"
echo ""
