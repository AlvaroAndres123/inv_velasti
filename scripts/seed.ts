import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Crear usuario administrador
  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@velasti.com' },
    update: {},
    create: {
      nombre: 'Administrador',
      email: 'admin@velasti.com',
      password: 'admin123',
    },
  });

  // Crear categorías
  const categorias = await Promise.all([
    prisma.categoria.upsert({
      where: { nombre: 'Maquillaje' },
      update: {},
      create: { nombre: 'Maquillaje' },
    }),
    prisma.categoria.upsert({
      where: { nombre: 'Skincare' },
      update: {},
      create: { nombre: 'Skincare' },
    }),
    prisma.categoria.upsert({
      where: { nombre: 'Fragancias' },
      update: {},
      create: { nombre: 'Fragancias' },
    }),
    prisma.categoria.upsert({
      where: { nombre: 'Cabello' },
      update: {},
      create: { nombre: 'Cabello' },
    }),
  ]);

  // Crear proveedores
  const proveedores = await Promise.all([
    prisma.proveedor.upsert({
      where: { id: 1 },
      update: {},
      create: {
        nombre: 'Cosméticos Premium S.A.',
        contacto: 'María González',
        telefono: '+504 2234-5678',
        correo: 'ventas@cosmeticospremium.com',
        direccion: 'Tegucigalpa, Honduras',
      },
    }),
    prisma.proveedor.upsert({
      where: { id: 2 },
      update: {},
      create: {
        nombre: 'Beauty Supply Honduras',
        contacto: 'Carlos Mendoza',
        telefono: '+504 2245-6789',
        correo: 'info@beautysupply.hn',
        direccion: 'San Pedro Sula, Honduras',
      },
    }),
  ]);

  // Crear productos
  const productos = await Promise.all([
    prisma.producto.upsert({
      where: { id: 1 },
      update: {},
      create: {
        nombre: 'Base de Maquillaje Profesional',
        descripcion: 'Base de larga duración para todo tipo de piel',
        precio: 25.99,
        stock: 50,
        categoriaId: categorias[0].id,
        proveedorId: proveedores[0].id,
      },
    }),
    prisma.producto.upsert({
      where: { id: 2 },
      update: {},
      create: {
        nombre: 'Crema Hidratante Facial',
        descripcion: 'Crema hidratante con ácido hialurónico',
        precio: 18.50,
        stock: 75,
        categoriaId: categorias[1].id,
        proveedorId: proveedores[1].id,
      },
    }),
    prisma.producto.upsert({
      where: { id: 3 },
      update: {},
      create: {
        nombre: 'Perfume Floral',
        descripcion: 'Fragancia floral suave y duradera',
        precio: 45.00,
        stock: 30,
        categoriaId: categorias[2].id,
        proveedorId: proveedores[0].id,
      },
    }),
    prisma.producto.upsert({
      where: { id: 4 },
      update: {},
      create: {
        nombre: 'Shampoo Reparador',
        descripcion: 'Shampoo para cabello dañado',
        precio: 12.99,
        stock: 40,
        categoriaId: categorias[3].id,
        proveedorId: proveedores[1].id,
      },
    }),
  ]);

  // Crear algunos movimientos de ejemplo
  const movimientos = await Promise.all([
    prisma.movimiento.create({
      data: {
        tipo: 'entrada',
        cantidad: 50,
        motivo: 'Compra inicial',
        valor: 25.99,
        productoId: productos[0].id,
      },
    }),
    prisma.movimiento.create({
      data: {
        tipo: 'entrada',
        cantidad: 75,
        motivo: 'Compra inicial',
        valor: 18.50,
        productoId: productos[1].id,
      },
    }),
    prisma.movimiento.create({
      data: {
        tipo: 'salida',
        cantidad: 5,
        motivo: 'Venta',
        valor: 25.99,
        productoId: productos[0].id,
      },
    }),
    prisma.movimiento.create({
      data: {
        tipo: 'salida',
        cantidad: 3,
        motivo: 'Venta',
        valor: 18.50,
        productoId: productos[1].id,
      },
    }),
  ]);

  console.log('✅ Seed completado exitosamente!');
  console.log(`👤 Usuario creado: ${admin.nombre} (${admin.email})`);
  console.log(`📦 ${categorias.length} categorías creadas`);
  console.log(`🚚 ${proveedores.length} proveedores creados`);
  console.log(`💄 ${productos.length} productos creados`);
  console.log(`📊 ${movimientos.length} movimientos creados`);
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 