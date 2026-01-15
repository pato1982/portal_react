#!/bin/bash
# Script para actualizar el servidor con los últimos cambios

echo "=== Actualizando Portal Estudiantil en Servidor ==="

# Ir al directorio del proyecto
cd /var/www/dev/colegio-react || exit 1

# Descargar cambios
echo "Descargando cambios desde GitHub..."
git pull origin master

# Instalar dependencias (por si acaso)
echo "Verificando dependencias..."
npm install

# Construir aplicación
echo "Construyendo aplicación..."
npm run build

# Reiniciar servicios
echo "Reiniciando servicios..."
pm2 restart all 2>/dev/null || echo "PM2 no encontrado, omitiendo reinicio"

echo "=== Actualización completada ==="
echo "Verifica en: http://170.239.87.97/tu-ruta-de-acceso"
