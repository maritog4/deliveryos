#!/bin/bash

# ============================================
# PREPARE CODECANYON PACKAGE
# ============================================
# This script prepares a clean version of the project
# for uploading to CodeCanyon marketplace
#
# Usage: bash prepare-codecanyon.sh
# ============================================

set -e  # Exit on error

echo "🚀 Preparando paquete para CodeCanyon..."
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="deliveryos"
VERSION="1.0.0"
OUTPUT_DIR="codecanyon-package"
ZIP_NAME="${PROJECT_NAME}-v${VERSION}.zip"

# ============================================
# 1. CREATE OUTPUT DIRECTORY
# ============================================
echo "📁 Creando directorio temporal..."
rm -rf $OUTPUT_DIR
mkdir -p $OUTPUT_DIR/$PROJECT_NAME

# ============================================
# 2. COPY PROJECT FILES
# ============================================
echo "📦 Copiando archivos del proyecto..."

# Backend
echo "   → Backend..."
rsync -av --progress \
  --exclude='node_modules' \
  --exclude='vendor' \
  --exclude='.env' \
  --exclude='*.log' \
  --exclude='test-*.php' \
  --exclude='test-*.html' \
  --exclude='diagnostico.sh' \
  backend/ $OUTPUT_DIR/$PROJECT_NAME/backend/

# Frontend
echo "   → Frontend..."
rsync -av --progress \
  --exclude='node_modules' \
  --exclude='dist' \
  --exclude='.env' \
  --exclude='dev.log' \
  --exclude='vite.log' \
  frontend/ $OUTPUT_DIR/$PROJECT_NAME/frontend/

# Database
echo "   → Database..."
cp -r database/ $OUTPUT_DIR/$PROJECT_NAME/database/

# Documentation
echo "   → Documentation..."
cp README_EN.md $OUTPUT_DIR/$PROJECT_NAME/README.md
cp CHANGELOG.md $OUTPUT_DIR/$PROJECT_NAME/
cp LICENSE $OUTPUT_DIR/$PROJECT_NAME/
cp -r docs/ $OUTPUT_DIR/$PROJECT_NAME/docs/

# Testing files
echo "   → Testing files..."
cp TESTING_CHECKLIST.md $OUTPUT_DIR/$PROJECT_NAME/
cp TESTING_CREDENTIALS.md $OUTPUT_DIR/$PROJECT_NAME/
cp test-api.sh $OUTPUT_DIR/$PROJECT_NAME/
cp test-manual.sh $OUTPUT_DIR/$PROJECT_NAME/

# Root files
echo "   → Root files..."
cp install.php $OUTPUT_DIR/$PROJECT_NAME/ 2>/dev/null || echo "⚠️  install.php not found (optional)"
cp .gitignore $OUTPUT_DIR/$PROJECT_NAME/ 2>/dev/null || true

# ============================================
# 3. VERIFY .env.example FILES EXIST
# ============================================
echo ""
echo "🔍 Verificando archivos de configuración..."

if [ ! -f "$OUTPUT_DIR/$PROJECT_NAME/backend/.env.example" ]; then
    echo -e "${RED}❌ ERROR: backend/.env.example no encontrado${NC}"
    exit 1
fi

if [ ! -f "$OUTPUT_DIR/$PROJECT_NAME/frontend/.env.example" ]; then
    echo -e "${RED}❌ ERROR: frontend/.env.example no encontrado${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Archivos .env.example verificados${NC}"

# ============================================
# 4. VERIFY CRITICAL FILES
# ============================================
echo ""
echo "🔍 Verificando archivos críticos..."

CRITICAL_FILES=(
    "README.md"
    "LICENSE"
    "CHANGELOG.md"
    "database/schema.sql"
    "database/seeds.sql"
    "backend/.env.example"
    "frontend/.env.example"
)

for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$OUTPUT_DIR/$PROJECT_NAME/$file" ]; then
        echo -e "   ${GREEN}✅${NC} $file"
    else
        echo -e "   ${RED}❌${NC} $file ${RED}FALTA!${NC}"
        exit 1
    fi
done

# ============================================
# 5. CREATE INSTALLATION GUIDE
# ============================================
echo ""
echo "📝 Creando guía de instalación rápida..."

cat > $OUTPUT_DIR/$PROJECT_NAME/QUICK_START.md << 'EOF'
# 🚀 Quick Start Guide

## Installation Steps

### 1. Upload Files
Upload all files to your web server (Apache/Nginx with PHP 7.4+)

### 2. Create Database
```sql
CREATE DATABASE deliveryos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Import Database
```bash
mysql -u your_user -p deliveryos < database/schema.sql
mysql -u your_user -p deliveryos < database/seeds.sql
```

### 4. Configure Backend
```bash
cd backend
cp .env.example .env
nano .env  # Edit with your database credentials
composer install
```

### 5. Configure Frontend
```bash
cd frontend
cp .env.example .env
nano .env  # Edit with your API URL
npm install
npm run build
```

### 6. Set Permissions
```bash
chmod 755 backend/uploads
chmod 755 backend/logs
```

### 7. Access Application
- Frontend: http://your-domain.com
- Admin: admin@demo.com / password123
- Customer: customer@demo.com / password123
- Driver: driver@demo.com / password123

⚠️ **IMPORTANT**: Change all passwords after first login!

## Full Documentation
See `README.md` for complete documentation.
EOF

# ============================================
# 6. CREATE .gitignore FOR PACKAGE
# ============================================
cat > $OUTPUT_DIR/$PROJECT_NAME/.gitignore << 'EOF'
# Environment files
.env
.env.local
.env.production

# Dependencies
node_modules/
vendor/

# Build outputs
dist/
build/

# Logs
*.log
logs/

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo
EOF

# ============================================
# 7. CLEAN UP UNNECESSARY FILES
# ============================================
echo ""
echo "🧹 Limpiando archivos innecesarios..."

# Remove test files
find $OUTPUT_DIR/$PROJECT_NAME -name "test-*" -type f -delete 2>/dev/null || true

# Remove .DS_Store
find $OUTPUT_DIR/$PROJECT_NAME -name ".DS_Store" -delete 2>/dev/null || true

# Remove empty directories
find $OUTPUT_DIR/$PROJECT_NAME -type d -empty -delete 2>/dev/null || true

echo -e "${GREEN}✅ Limpieza completada${NC}"

# ============================================
# 8. CREATE ZIP FILE
# ============================================
echo ""
echo "📦 Creando archivo ZIP..."

cd $OUTPUT_DIR
zip -r ../$ZIP_NAME $PROJECT_NAME -q

cd ..
ZIP_SIZE=$(du -h $ZIP_NAME | cut -f1)

echo -e "${GREEN}✅ Archivo creado: $ZIP_NAME ($ZIP_SIZE)${NC}"

# ============================================
# 9. GENERATE PACKAGE SUMMARY
# ============================================
echo ""
echo "📊 Generando resumen del paquete..."

cat > $OUTPUT_DIR/PACKAGE_SUMMARY.txt << EOF
==============================================
CODECANYON PACKAGE SUMMARY
==============================================

Package Name: $PROJECT_NAME
Version: $VERSION
Created: $(date)
Size: $ZIP_SIZE

==============================================
INCLUDED FILES
==============================================

Backend:
$(find $PROJECT_NAME/backend -type f | wc -l) files

Frontend:
$(find $PROJECT_NAME/frontend -type f | wc -l) files

Documentation:
- README.md (Main documentation)
- CHANGELOG.md (Version history)
- LICENSE (Terms and conditions)
- QUICK_START.md (Installation guide)
- docs/API.md (API reference)
- docs/SCREENSHOT_GUIDE.md
- TESTING_CHECKLIST.md
- TESTING_CREDENTIALS.md

Database:
- schema.sql (Structure)
- seeds.sql (Sample data)

==============================================
VERIFICATION CHECKLIST
==============================================

✓ All .env files removed
✓ .env.example files included
✓ node_modules removed
✓ vendor directory removed
✓ Test files removed
✓ Log files removed
✓ Documentation included
✓ Database files included

==============================================
NEXT STEPS
==============================================

1. Test installation on clean server
2. Verify all features work
3. Create screenshots (8 images)
4. Record video demo (3-5 min)
5. Upload to CodeCanyon

==============================================
DEFAULT CREDENTIALS
==============================================

Admin: admin@demo.com / password123
Customer: customer@demo.com / password123
Driver: driver@demo.com / password123

⚠️ IMPORTANT: Users must change passwords!

==============================================
EOF

cat $OUTPUT_DIR/PACKAGE_SUMMARY.txt

# ============================================
# 10. FINAL VERIFICATION
# ============================================
echo ""
echo "🔍 Verificación final..."

# Check ZIP is not too large (CodeCanyon limit ~50MB)
ZIP_SIZE_BYTES=$(stat -f%z "$ZIP_NAME" 2>/dev/null || stat -c%s "$ZIP_NAME")
ZIP_SIZE_MB=$((ZIP_SIZE_BYTES / 1024 / 1024))

if [ $ZIP_SIZE_MB -gt 50 ]; then
    echo -e "${YELLOW}⚠️  ADVERTENCIA: ZIP es muy grande ($ZIP_SIZE_MB MB)${NC}"
    echo "   CodeCanyon recomienda menos de 50MB"
else
    echo -e "${GREEN}✅ Tamaño del ZIP OK ($ZIP_SIZE_MB MB)${NC}"
fi

# ============================================
# SUCCESS MESSAGE
# ============================================
echo ""
echo "=========================================="
echo -e "${GREEN}✅ ¡PAQUETE LISTO PARA CODECANYON!${NC}"
echo "=========================================="
echo ""
echo "Archivo: $ZIP_NAME"
echo "Tamaño: $ZIP_SIZE"
echo "Ubicación: $(pwd)/$ZIP_NAME"
echo ""
echo "📋 Resumen: $OUTPUT_DIR/PACKAGE_SUMMARY.txt"
echo ""
echo "Próximos pasos:"
echo "1. Extraer y probar en servidor limpio"
echo "2. Capturar 8 screenshots profesionales"
echo "3. Grabar video demo de 3-5 minutos"
echo "4. Subir a CodeCanyon con screenshots"
echo ""
echo "¡Buena suerte con tu lanzamiento! 🚀"
echo ""
