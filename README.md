# 🎨 AlmaSoft - Sistema de Inventario de Cosméticos

Sistema moderno de control de inventario desarrollado con Next.js, Prisma y React.

## 🚀 Despliegue y Configuración de Base de Datos

### Desarrollo Local (SQLite)

Por defecto, el proyecto está configurado para usar SQLite en desarrollo. Esto permite trabajar sin necesidad de un servidor de base de datos externo.

1. Crea un archivo `.env` en la raíz del proyecto con:
   ```env
   DATABASE_PROVIDER=sqlite
   DATABASE_URL=file:./dev.db
   ```
2. Ejecuta las migraciones y genera el cliente Prisma:
   ```bash
   npm run db:dev
   npm run db:generate
   npm run db:seed # (opcional, si tienes un seed)
   ```
3. Inicia la app:
   ```bash
   npm run dev
   ```

### Producción (PostgreSQL con Neon)

Para producción, se recomienda usar Neon (https://neon.tech) como base de datos PostgreSQL gratuita.

1. **Crea una cuenta y un proyecto en Neon:**
   - Ve a https://neon.tech
   - Regístrate y crea un nuevo proyecto
2. **Obtén la cadena de conexión:**
   - Ejemplo:
     ```
     postgresql://usuario:contraseña@host/neon_db?sslmode=require&channel_binding=require
     ```
3. **Configura las variables de entorno en Vercel o tu servidor:**
   - `DATABASE_PROVIDER=postgresql`
   - `DATABASE_URL=postgresql://usuario:contraseña@host/neon_db?sslmode=require&channel_binding=require`
4. **Sincroniza la base de datos:**
   - Ejecuta en local o en el dashboard de Vercel:
     ```bash
     npx prisma db push
     # o usando migraciones
     npx prisma migrate dev --name init
     ```
5. **Despliega tu app:**
   - Usa Vercel CLI o conecta tu repo a Vercel

### Scripts útiles

- `npm run db:dev` — Sincroniza el esquema con SQLite (desarrollo)
- `npm run db:prod` — Sincroniza el esquema con PostgreSQL (producción)
- `npm run db:generate` — Genera el cliente Prisma
- `npm run db:seed` — Ejecuta el seed de la base de datos
- `npm run db:studio` — Abre Prisma Studio

### Migrar datos de SQLite a PostgreSQL (opcional)
Si tienes datos en SQLite y quieres migrarlos a PostgreSQL:
1. Exporta los datos de SQLite a CSV o usa una herramienta como [DBConvert](https://dbconvert.com/sqlite/postgresql/).
2. Importa los datos a tu base de datos Neon usando su panel o una herramienta como DBeaver.

## Variables de Entorno Requeridas

```env
# Desarrollo local
DATABASE_PROVIDER=sqlite
DATABASE_URL=file:./dev.db

# Producción
DATABASE_PROVIDER=postgresql
DATABASE_URL=postgresql://usuario:contraseña@host/neon_db?sslmode=require&channel_binding=require
NODE_ENV=production
```

## 🛠️ Desarrollo Local

```bash
# Instalar dependencias
npm install

# Configurar base de datos
npm run db:dev
npm run db:generate
npm run db:seed

# Ejecutar en desarrollo
npm run dev
```

## 📊 Características

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

### Configuración de Base de Datos

#### Opción 1: Neon (Recomendado - Gratuito)

1. **Crear cuenta en Neon:**
   - Ve a https://neon.tech
   - Regístrate con GitHub
   - Crea un nuevo proyecto

2. **Obtener URL de conexión:**
   - En tu proyecto Neon, ve a "Connection Details"
   - Copia la URL de conexión

3. **Configurar variables de entorno:**
   ```bash
   DATABASE_PROVIDER=postgresql
   DATABASE_URL=postgresql://[user]:[password]@[host]/[dbname]
   ```

4. **Desplegar en Vercel:**
   ```bash
   vercel --prod
   ```

#### Opción 2: Supabase (Alternativa gratuita)

1. Ve a https://supabase.com
2. Crea un proyecto
3. Ve a Settings → Database
4. Copia la connection string

### Variables de Entorno Requeridas

```bash
# Desarrollo local
DATABASE_PROVIDER=sqlite
DATABASE_URL=file:./dev.db

# Producción
DATABASE_PROVIDER=postgresql
DATABASE_URL=postgresql://usuario:contraseña@servidor.com/db
NODE_ENV=production
```

## 🛠️ Desarrollo Local

```bash
# Instalar dependencias
npm install

# Configurar base de datos
npm run db:generate
npm run db:migrate
npm run db:seed

# Ejecutar en desarrollo
npm run dev
```

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
