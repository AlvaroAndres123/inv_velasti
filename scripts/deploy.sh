#!/bin/bash

echo "🚀 Iniciando despliegue de Inv Velasti..."

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: No se encontró package.json"
    exit 1
fi

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

# Generar cliente de Prisma
echo "🔧 Generando cliente de Prisma..."
npx prisma generate

# Verificar variables de entorno
if [ -z "$DATABASE_URL" ]; then
    echo "⚠️  Advertencia: DATABASE_URL no está configurada"
    echo "   Asegúrate de configurar la variable de entorno en tu plataforma de despliegue"
fi

# Construir la aplicación
echo "🏗️  Construyendo la aplicación..."
npm run build

# Ejecutar migraciones (solo si DATABASE_URL está configurada)
if [ ! -z "$DATABASE_URL" ]; then
    echo "🗄️  Ejecutando migraciones de base de datos..."
    npx prisma migrate deploy
else
    echo "⚠️  Saltando migraciones - DATABASE_URL no configurada"
fi

echo "✅ Despliegue completado!"
echo "🌐 Tu aplicación debería estar disponible en:"
echo "   https://tu-dominio.vercel.app" 