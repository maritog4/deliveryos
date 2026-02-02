#!/bin/bash
# Script para importar base de datos en Railway
# Este script se ejecuta automáticamente en el deploy

echo "🔌 Verificando conexión a MySQL..."

# Esperar a que MySQL esté listo
timeout=60
while ! mysql -h $MYSQLHOST -P $MYSQLPORT -u $MYSQLUSER -p$MYSQLPASSWORD -e "SELECT 1" > /dev/null 2>&1; do
    timeout=$((timeout - 1))
    if [ $timeout -le 0 ]; then
        echo "❌ Timeout esperando MySQL"
        exit 1
    fi
    echo "⏳ Esperando MySQL... ($timeout segundos restantes)"
    sleep 1
done

echo "✅ MySQL está listo"

# Verificar si ya está importado
TABLES=$(mysql -h $MYSQLHOST -P $MYSQLPORT -u $MYSQLUSER -p$MYSQLPASSWORD $MYSQLDATABASE -e "SHOW TABLES" 2>/dev/null | wc -l)

if [ $TABLES -gt 1 ]; then
    echo "✅ Base de datos ya importada ($TABLES tablas)"
    exit 0
fi

echo "📥 Importando schema.sql..."
mysql -h $MYSQLHOST -P $MYSQLPORT -u $MYSQLUSER -p$MYSQLPASSWORD $MYSQLDATABASE < /app/database/schema.sql

if [ $? -eq 0 ]; then
    echo "✅ Schema importado"
else
    echo "❌ Error importando schema"
    exit 1
fi

echo "🌱 Importando seeds.sql..."
mysql -h $MYSQLHOST -P $MYSQLPORT -u $MYSQLUSER -p$MYSQLPASSWORD $MYSQLDATABASE < /app/database/seeds.sql

if [ $? -eq 0 ]; then
    echo "✅ Seeds importados"
else
    echo "❌ Error importando seeds"
    exit 1
fi

echo "🎉 Base de datos importada exitosamente"
