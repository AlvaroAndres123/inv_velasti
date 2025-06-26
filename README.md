# 🎨 AlmaSoft - Sistema de Inventario de Cosméticos

Sistema completo de gestión de inventario para tiendas de cosméticos, desarrollado con Next.js, Prisma y SQLite.

## ✨ Características

- 📊 **Dashboard interactivo** con gráficos y métricas en tiempo real
- 📦 **Gestión completa de productos** con categorías y proveedores
- 🔄 **Sistema de movimientos** (entradas/salidas) con tracking completo
- 👥 **Gestión de proveedores** con información de contacto
- 📈 **Reportes y analytics** de ventas e inventario
- 🔔 **Alertas de stock bajo** automáticas
- 📱 **Diseño responsive** para móviles y desktop
- 🔐 **Sistema de autenticación** integrado

## 🛠️ Tecnologías

- **Frontend:** Next.js 15, React 19, TypeScript
- **Base de Datos:** SQLite con Prisma ORM
- **UI/UX:** Tailwind CSS, Radix UI, Framer Motion
- **Gráficos:** Recharts
- **Autenticación:** Sistema propio con Prisma

## 🚀 Instalación

1. **Clonar el repositorio:**
```bash
git clone <tu-repositorio>
cd inv_velasti
```

2. **Instalar dependencias:**
```bash
npm install
```

3. **Configurar la base de datos:**
```bash
# Generar el cliente de Prisma
npm run db:generate

# Crear la base de datos y aplicar migraciones
npm run db:push

# Poblar con datos de ejemplo
npm run db:seed
```

4. **Ejecutar en desarrollo:**
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:4000`

## 🔑 Credenciales de Acceso

**Usuario Administrador:**
- **Email:** admin@velasti.com
- **Contraseña:** admin123

## 📁 Estructura del Proyecto

```
inv_velasti/
├── app/                    # Páginas y APIs de Next.js
│   ├── api/               # Endpoints de la API
│   ├── login/             # Página de autenticación
│   ├── productos/         # Gestión de productos
│   ├── movimientos/       # Control de inventario
│   ├── proveedores/       # Gestión de proveedores
│   └── perfil/            # Configuración de usuario
├── components/            # Componentes reutilizables
├── lib/                   # Utilidades y configuración
├── prisma/                # Schema y migraciones
├── scripts/               # Scripts de utilidad
└── public/                # Archivos estáticos
```

## 🗄️ Base de Datos

### Modelos Principales:

- **Usuario:** Gestión de usuarios del sistema
- **Categoria:** Categorización de productos
- **Proveedor:** Información de proveedores
- **Producto:** Productos del inventario
- **Movimiento:** Entradas y salidas de productos

### Comandos Útiles:

```bash
# Ver la base de datos en Prisma Studio
npm run db:studio

# Generar nueva migración
npm run db:migrate

# Resetear base de datos
npm run db:reset

# Ejecutar seed manualmente
npm run db:seed
```

## 📊 Funcionalidades Principales

### Dashboard
- Gráficos de ventas mensuales
- Resumen de movimientos
- Productos con stock bajo
- Métricas de rendimiento

### Gestión de Productos
- CRUD completo de productos
- Categorización automática
- Control de stock en tiempo real
- Imágenes de productos

### Sistema de Movimientos
- Registro de entradas (compras)
- Registro de salidas (ventas)
- Tracking de valores y motivos
- Historial completo

### Reportes
- Productos más vendidos
- Análisis de tendencias
- Alertas automáticas
- Exportación de datos

## 🔧 Configuración Avanzada

### Variables de Entorno
Crea un archivo `.env.local` en la raíz del proyecto:

```env
# Base de datos (SQLite se configura automáticamente)
DATABASE_URL="file:./dev.db"

# Configuración de la aplicación
NEXT_PUBLIC_APP_NAME="AlmaSoft"
NEXT_PUBLIC_APP_URL="http://localhost:4000"
```

### Personalización
- **Colores:** Edita `tailwind.config.js`
- **Fuentes:** Configura en `app/layout.tsx`
- **Componentes:** Modifica en `components/ui/`

## 🚀 Despliegue

### Vercel (Recomendado)
1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno
3. Deploy automático en cada push

### Otros Servicios
- **Netlify:** Compatible con Next.js
- **Railway:** Soporte nativo para SQLite
- **Heroku:** Requiere configuración adicional

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Si tienes problemas o preguntas:

1. Revisa la documentación de Prisma
2. Consulta los issues del repositorio
3. Crea un nuevo issue con detalles del problema

---

**Desarrollado con ❤️ para la gestión eficiente de inventarios de cosméticos**
