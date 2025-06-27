import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Eliminar todos los usuarios existentes
  await prisma.usuario.deleteMany({});

  // Crear solo el usuario admin
  await prisma.usuario.create({
    data: {
      nombre: 'admin',
      email: 'admin@velasti.com',
      password: 'admin123%',
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
    prisma.categoria.upsert({
      where: { nombre: 'Uñas' },
      update: {},
      create: { nombre: 'Uñas' },
    }),
    prisma.categoria.upsert({
      where: { nombre: 'Accesorios' },
      update: {},
      create: { nombre: 'Accesorios' },
    }),
    prisma.categoria.upsert({
      where: { nombre: 'Hombres' },
      update: {},
      create: { nombre: 'Hombres' },
    }),
    prisma.categoria.upsert({
      where: { nombre: 'Natural' },
      update: {},
      create: { nombre: 'Natural' },
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
    prisma.proveedor.upsert({
      where: { id: 3 },
      update: {},
      create: {
        nombre: 'Distribuidora de Belleza Central',
        contacto: 'Ana Rodríguez',
        telefono: '+504 2256-7890',
        correo: 'pedidos@bellezacentral.com',
        direccion: 'La Ceiba, Honduras',
      },
    }),
    prisma.proveedor.upsert({
      where: { id: 4 },
      update: {},
      create: {
        nombre: 'Importadora Cosmética Internacional',
        contacto: 'Luis Fernández',
        telefono: '+504 2267-8901',
        correo: 'contacto@importcosmetic.com',
        direccion: 'Choluteca, Honduras',
      },
    }),
    prisma.proveedor.upsert({
      where: { id: 5 },
      update: {},
      create: {
        nombre: 'Proveedora de Productos Naturales',
        contacto: 'Sofia Morales',
        telefono: '+504 2278-9012',
        correo: 'natural@proveedora.com',
        direccion: 'Comayagua, Honduras',
      },
    }),
  ]);

  // Crear productos - Maquillaje
  const productosMaquillaje = await Promise.all([
    prisma.producto.upsert({
      where: { id: 1 },
      update: {},
      create: {
        nombre: 'Base de Maquillaje Profesional',
        descripcion: 'Base de larga duración para todo tipo de piel, cobertura media',
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
        nombre: 'Corrector de Ojeras',
        descripcion: 'Corrector cremoso para ojeras y imperfecciones',
        precio: 12.50,
        stock: 75,
        categoriaId: categorias[0].id,
        proveedorId: proveedores[1].id,
      },
    }),
    prisma.producto.upsert({
      where: { id: 3 },
      update: {},
      create: {
        nombre: 'Polvo Compacto',
        descripcion: 'Polvo compacto para fijar el maquillaje',
        precio: 18.75,
        stock: 60,
        categoriaId: categorias[0].id,
        proveedorId: proveedores[2].id,
      },
    }),
    prisma.producto.upsert({
      where: { id: 4 },
      update: {},
      create: {
        nombre: 'Sombra de Ojos Profesional',
        descripcion: 'Paleta de sombras con 18 colores mate y brillantes',
        precio: 35.00,
        stock: 30,
        categoriaId: categorias[0].id,
        proveedorId: proveedores[0].id,
      },
    }),
    prisma.producto.upsert({
      where: { id: 5 },
      update: {},
      create: {
        nombre: 'Delineador de Ojos Líquido',
        descripcion: 'Delineador líquido de larga duración, negro intenso',
        precio: 15.99,
        stock: 80,
        categoriaId: categorias[0].id,
        proveedorId: proveedores[1].id,
      },
    }),
    prisma.producto.upsert({
      where: { id: 6 },
      update: {},
      create: {
        nombre: 'Máscara de Pestañas Volumizadora',
        descripcion: 'Máscara de pestañas que añade volumen y longitud',
        precio: 22.50,
        stock: 65,
        categoriaId: categorias[0].id,
        proveedorId: proveedores[2].id,
      },
    }),
    prisma.producto.upsert({
      where: { id: 7 },
      update: {},
      create: {
        nombre: 'Labial Mate Líquido',
        descripcion: 'Labial líquido mate de larga duración',
        precio: 19.99,
        stock: 90,
        categoriaId: categorias[0].id,
        proveedorId: proveedores[0].id,
      },
    }),
    prisma.producto.upsert({
      where: { id: 8 },
      update: {},
      create: {
        nombre: 'Rubor en Polvo',
        descripcion: 'Rubor en polvo con acabado natural',
        precio: 16.75,
        stock: 70,
        categoriaId: categorias[0].id,
        proveedorId: proveedores[1].id,
      },
    }),
  ]);

  // Crear productos - Skincare
  const productosSkincare = await Promise.all([
    prisma.producto.upsert({
      where: { id: 9 },
      update: {},
      create: {
        nombre: 'Crema Hidratante Facial',
        descripcion: 'Crema hidratante con ácido hialurónico para piel seca',
        precio: 28.50,
        stock: 75,
        categoriaId: categorias[1].id,
        proveedorId: proveedores[1].id,
      },
    }),
    prisma.producto.upsert({
      where: { id: 10 },
      update: {},
      create: {
        nombre: 'Limpiador Facial Suave',
        descripcion: 'Gel limpiador facial para todo tipo de piel',
        precio: 18.99,
        stock: 85,
        categoriaId: categorias[1].id,
        proveedorId: proveedores[2].id,
      },
    }),
    prisma.producto.upsert({
      where: { id: 11 },
      update: {},
      create: {
        nombre: 'Serum Vitamina C',
        descripcion: 'Serum con vitamina C para iluminar y unificar el tono',
        precio: 45.00,
        stock: 40,
        categoriaId: categorias[1].id,
        proveedorId: proveedores[0].id,
      },
    }),
    prisma.producto.upsert({
      where: { id: 12 },
      update: {},
      create: {
        nombre: 'Protector Solar SPF 50',
        descripcion: 'Protector solar facial con SPF 50, no comedogénico',
        precio: 32.75,
        stock: 60,
        categoriaId: categorias[1].id,
        proveedorId: proveedores[3].id,
      },
    }),
    prisma.producto.upsert({
      where: { id: 13 },
      update: {},
      create: {
        nombre: 'Mascarilla Hidratante',
        descripcion: 'Mascarilla facial hidratante para uso semanal',
        precio: 15.50,
        stock: 100,
        categoriaId: categorias[1].id,
        proveedorId: proveedores[4].id,
      },
    }),
    prisma.producto.upsert({
      where: { id: 14 },
      update: {},
      create: {
        nombre: 'Tónico Facial',
        descripcion: 'Tónico facial para equilibrar el pH de la piel',
        precio: 22.00,
        stock: 70,
        categoriaId: categorias[1].id,
        proveedorId: proveedores[1].id,
      },
    }),
  ]);

  // Crear productos - Fragancias
  const productosFragancias = await Promise.all([
    prisma.producto.upsert({
      where: { id: 15 },
      update: {},
      create: {
        nombre: 'Perfume Floral Suave',
        descripcion: 'Fragancia floral suave y duradera para mujeres',
        precio: 65.00,
        stock: 30,
        categoriaId: categorias[2].id,
        proveedorId: proveedores[0].id,
      },
    }),
    prisma.producto.upsert({
      where: { id: 16 },
      update: {},
      create: {
        nombre: 'Colonia Masculina',
        descripcion: 'Colonia fresca y elegante para hombres',
        precio: 55.00,
        stock: 25,
        categoriaId: categorias[2].id,
        proveedorId: proveedores[3].id,
      },
    }),
    prisma.producto.upsert({
      where: { id: 17 },
      update: {},
      create: {
        nombre: 'Perfume Oriental',
        descripcion: 'Fragancia oriental cálida y sensual',
        precio: 75.00,
        stock: 20,
        categoriaId: categorias[2].id,
        proveedorId: proveedores[0].id,
      },
    }),
    prisma.producto.upsert({
      where: { id: 18 },
      update: {},
      create: {
        nombre: 'Aceite Esencial de Lavanda',
        descripcion: 'Aceite esencial puro de lavanda para aromaterapia',
        precio: 18.99,
        stock: 50,
        categoriaId: categorias[2].id,
        proveedorId: proveedores[4].id,
      },
    }),
  ]);

  // Crear productos - Cabello
  const productosCabello = await Promise.all([
    prisma.producto.upsert({
      where: { id: 19 },
      update: {},
      create: {
        nombre: 'Shampoo Reparador',
        descripcion: 'Shampoo para cabello dañado y seco',
        precio: 24.99,
        stock: 40,
        categoriaId: categorias[3].id,
        proveedorId: proveedores[1].id,
      },
    }),
    prisma.producto.upsert({
      where: { id: 20 },
      update: {},
      create: {
        nombre: 'Acondicionador Hidratante',
        descripcion: 'Acondicionador profundo para cabello seco',
        precio: 22.50,
        stock: 45,
        categoriaId: categorias[3].id,
        proveedorId: proveedores[1].id,
      },
    }),
    prisma.producto.upsert({
      where: { id: 21 },
      update: {},
      create: {
        nombre: 'Mascarilla Capilar',
        descripcion: 'Mascarilla reparadora para cabello dañado',
        precio: 28.75,
        stock: 35,
        categoriaId: categorias[3].id,
        proveedorId: proveedores[2].id,
      },
    }),
    prisma.producto.upsert({
      where: { id: 22 },
      update: {},
      create: {
        nombre: 'Aceite de Argan',
        descripcion: 'Aceite de argán puro para cabello seco',
        precio: 35.00,
        stock: 30,
        categoriaId: categorias[3].id,
        proveedorId: proveedores[4].id,
      },
    }),
    prisma.producto.upsert({
      where: { id: 23 },
      update: {},
      create: {
        nombre: 'Spray Termoprotector',
        descripcion: 'Spray protector para plancha y secador',
        precio: 19.99,
        stock: 60,
        categoriaId: categorias[3].id,
        proveedorId: proveedores[1].id,
      },
    }),
  ]);

  // Crear productos - Uñas
  const productosUnas = await Promise.all([
    prisma.producto.upsert({
      where: { id: 24 },
      update: {},
      create: {
        nombre: 'Esmalte de Uñas Profesional',
        descripcion: 'Esmalte de larga duración, color rojo clásico',
        precio: 12.99,
        stock: 120,
        categoriaId: categorias[4].id,
        proveedorId: proveedores[2].id,
      },
    }),
    prisma.producto.upsert({
      where: { id: 25 },
      update: {},
      create: {
        nombre: 'Base para Uñas',
        descripcion: 'Base transparente para preparar las uñas',
        precio: 10.50,
        stock: 90,
        categoriaId: categorias[4].id,
        proveedorId: proveedores[2].id,
      },
    }),
    prisma.producto.upsert({
      where: { id: 26 },
      update: {},
      create: {
        nombre: 'Top Coat Brillante',
        descripcion: 'Top coat para sellar y dar brillo al esmalte',
        precio: 11.75,
        stock: 85,
        categoriaId: categorias[4].id,
        proveedorId: proveedores[2].id,
      },
    }),
  ]);

  // Crear productos - Accesorios
  const productosAccesorios = await Promise.all([
    prisma.producto.upsert({
      where: { id: 27 },
      update: {},
      create: {
        nombre: 'Brochas de Maquillaje Set',
        descripcion: 'Set de 10 brochas profesionales para maquillaje',
        precio: 45.00,
        stock: 25,
        categoriaId: categorias[5].id,
        proveedorId: proveedores[0].id,
      },
    }),
    prisma.producto.upsert({
      where: { id: 28 },
      update: {},
      create: {
        nombre: 'Espejo de Maquillaje LED',
        descripcion: 'Espejo con luces LED para maquillaje profesional',
        precio: 85.00,
        stock: 15,
        categoriaId: categorias[5].id,
        proveedorId: proveedores[3].id,
      },
    }),
    prisma.producto.upsert({
      where: { id: 29 },
      update: {},
      create: {
        nombre: 'Organizador de Cosméticos',
        descripcion: 'Organizador portátil para cosméticos',
        precio: 32.50,
        stock: 40,
        categoriaId: categorias[5].id,
        proveedorId: proveedores[1].id,
      },
    }),
  ]);

  // Crear productos - Hombres
  const productosHombres = await Promise.all([
    prisma.producto.upsert({
      where: { id: 30 },
      update: {},
      create: {
        nombre: 'Gel para Barba',
        descripcion: 'Gel modelador para barba y bigote',
        precio: 18.99,
        stock: 55,
        categoriaId: categorias[6].id,
        proveedorId: proveedores[3].id,
      },
    }),
    prisma.producto.upsert({
      where: { id: 31 },
      update: {},
      create: {
        nombre: 'Aceite para Barba',
        descripcion: 'Aceite hidratante para barba y piel',
        precio: 22.50,
        stock: 45,
        categoriaId: categorias[6].id,
        proveedorId: proveedores[3].id,
      },
    }),
    prisma.producto.upsert({
      where: { id: 32 },
      update: {},
      create: {
        nombre: 'Crema de Afeitar',
        descripcion: 'Crema de afeitar suave y espumosa',
        precio: 15.75,
        stock: 70,
        categoriaId: categorias[6].id,
        proveedorId: proveedores[3].id,
      },
    }),
  ]);

  // Crear productos - Natural
  const productosNatural = await Promise.all([
    prisma.producto.upsert({
      where: { id: 33 },
      update: {},
      create: {
        nombre: 'Jabón Natural de Aloe',
        descripcion: 'Jabón artesanal con aloe vera y aceites naturales',
        precio: 8.99,
        stock: 100,
        categoriaId: categorias[7].id,
        proveedorId: proveedores[4].id,
      },
    }),
    prisma.producto.upsert({
      where: { id: 34 },
      update: {},
      create: {
        nombre: 'Crema Natural de Caléndula',
        descripcion: 'Crema natural con caléndula para piel sensible',
        precio: 16.50,
        stock: 65,
        categoriaId: categorias[7].id,
        proveedorId: proveedores[4].id,
      },
    }),
    prisma.producto.upsert({
      where: { id: 35 },
      update: {},
      create: {
        nombre: 'Aceite de Coco Virgen',
        descripcion: 'Aceite de coco virgen para piel y cabello',
        precio: 14.99,
        stock: 80,
        categoriaId: categorias[7].id,
        proveedorId: proveedores[4].id,
      },
    }),
  ]);

  // Combinar todos los productos
  const todosLosProductos = [
    ...productosMaquillaje,
    ...productosSkincare,
    ...productosFragancias,
    ...productosCabello,
    ...productosUnas,
    ...productosAccesorios,
    ...productosHombres,
    ...productosNatural,
  ];

  // Crear movimientos de entrada (compras iniciales)
  const movimientosEntrada = await Promise.all(
    todosLosProductos.map((producto, index) =>
      prisma.movimiento.create({
        data: {
          tipo: 'entrada',
          cantidad: producto.stock,
          motivo: 'Compra inicial de inventario',
          valor: producto.precio,
          productoId: producto.id,
          fecha: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Últimos 30 días
        },
      })
    )
  );

  // Crear movimientos de salida (ventas simuladas)
  const movimientosSalida = await Promise.all([
    // Ventas de maquillaje
    prisma.movimiento.create({
      data: {
        tipo: 'salida',
        cantidad: 5,
        motivo: 'Venta al cliente',
        valor: 25.99,
        productoId: productosMaquillaje[0].id,
        fecha: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Últimos 7 días
      },
    }),
    prisma.movimiento.create({
      data: {
        tipo: 'salida',
        cantidad: 3,
        motivo: 'Venta al cliente',
        valor: 12.50,
        productoId: productosMaquillaje[1].id,
        fecha: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.movimiento.create({
      data: {
        tipo: 'salida',
        cantidad: 2,
        motivo: 'Venta al cliente',
        valor: 35.00,
        productoId: productosMaquillaje[3].id,
        fecha: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      },
    }),
    // Ventas de skincare
    prisma.movimiento.create({
      data: {
        tipo: 'salida',
        cantidad: 4,
        motivo: 'Venta al cliente',
        valor: 28.50,
        productoId: productosSkincare[0].id,
        fecha: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.movimiento.create({
      data: {
        tipo: 'salida',
        cantidad: 6,
        motivo: 'Venta al cliente',
        valor: 18.99,
        productoId: productosSkincare[1].id,
        fecha: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      },
    }),
    // Ventas de fragancias
    prisma.movimiento.create({
      data: {
        tipo: 'salida',
        cantidad: 1,
        motivo: 'Venta al cliente',
        valor: 65.00,
        productoId: productosFragancias[0].id,
        fecha: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.movimiento.create({
      data: {
        tipo: 'salida',
        cantidad: 2,
        motivo: 'Venta al cliente',
        valor: 55.00,
        productoId: productosFragancias[1].id,
        fecha: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      },
    }),
    // Ventas de cabello
    prisma.movimiento.create({
      data: {
        tipo: 'salida',
        cantidad: 3,
        motivo: 'Venta al cliente',
        valor: 24.99,
        productoId: productosCabello[0].id,
        fecha: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.movimiento.create({
      data: {
        tipo: 'salida',
        cantidad: 2,
        motivo: 'Venta al cliente',
        valor: 22.50,
        productoId: productosCabello[1].id,
        fecha: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      },
    }),
    // Ventas de uñas
    prisma.movimiento.create({
      data: {
        tipo: 'salida',
        cantidad: 8,
        motivo: 'Venta al cliente',
        valor: 12.99,
        productoId: productosUnas[0].id,
        fecha: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      },
    }),
    // Ventas de accesorios
    prisma.movimiento.create({
      data: {
        tipo: 'salida',
        cantidad: 1,
        motivo: 'Venta al cliente',
        valor: 45.00,
        productoId: productosAccesorios[0].id,
        fecha: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      },
    }),
    // Ventas de productos para hombres
    prisma.movimiento.create({
      data: {
        tipo: 'salida',
        cantidad: 4,
        motivo: 'Venta al cliente',
        valor: 18.99,
        productoId: productosHombres[0].id,
        fecha: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      },
    }),
    // Ventas de productos naturales
    prisma.movimiento.create({
      data: {
        tipo: 'salida',
        cantidad: 10,
        motivo: 'Venta al cliente',
        valor: 8.99,
        productoId: productosNatural[0].id,
        fecha: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      },
    }),
  ]);

  // Actualizar stock de productos después de las ventas
  await Promise.all([
    prisma.producto.update({
      where: { id: productosMaquillaje[0].id },
      data: { stock: productosMaquillaje[0].stock - 5 },
    }),
    prisma.producto.update({
      where: { id: productosMaquillaje[1].id },
      data: { stock: productosMaquillaje[1].stock - 3 },
    }),
    prisma.producto.update({
      where: { id: productosMaquillaje[3].id },
      data: { stock: productosMaquillaje[3].stock - 2 },
    }),
    prisma.producto.update({
      where: { id: productosSkincare[0].id },
      data: { stock: productosSkincare[0].stock - 4 },
    }),
    prisma.producto.update({
      where: { id: productosSkincare[1].id },
      data: { stock: productosSkincare[1].stock - 6 },
    }),
    prisma.producto.update({
      where: { id: productosFragancias[0].id },
      data: { stock: productosFragancias[0].stock - 1 },
    }),
    prisma.producto.update({
      where: { id: productosFragancias[1].id },
      data: { stock: productosFragancias[1].stock - 2 },
    }),
    prisma.producto.update({
      where: { id: productosCabello[0].id },
      data: { stock: productosCabello[0].stock - 3 },
    }),
    prisma.producto.update({
      where: { id: productosCabello[1].id },
      data: { stock: productosCabello[1].stock - 2 },
    }),
    prisma.producto.update({
      where: { id: productosUnas[0].id },
      data: { stock: productosUnas[0].stock - 8 },
    }),
    prisma.producto.update({
      where: { id: productosAccesorios[0].id },
      data: { stock: productosAccesorios[0].stock - 1 },
    }),
    prisma.producto.update({
      where: { id: productosHombres[0].id },
      data: { stock: productosHombres[0].stock - 4 },
    }),
    prisma.producto.update({
      where: { id: productosNatural[0].id },
      data: { stock: productosNatural[0].stock - 10 },
    }),
  ]);

  console.log('✅ Seed completado exitosamente!');
  console.log(`👥 ${todosLosProductos.length} productos creados`);
  console.log(`📋 Resumen por categoría:`);
  console.log(`   • Maquillaje: ${productosMaquillaje.length} productos`);
  console.log(`   • Skincare: ${productosSkincare.length} productos`);
  console.log(`   • Fragancias: ${productosFragancias.length} productos`);
  console.log(`   • Cabello: ${productosCabello.length} productos`);
  console.log(`   • Uñas: ${productosUnas.length} productos`);
  console.log(`   • Accesorios: ${productosAccesorios.length} productos`);
  console.log(`   • Hombres: ${productosHombres.length} productos`);
  console.log(`   • Natural: ${productosNatural.length} productos`);
  console.log(`📊 ${movimientosEntrada.length + movimientosSalida.length} movimientos creados`);
  console.log('\n🔑 Credenciales de acceso:');
  console.log('   • admin@velasti.com / admin123');

  // Crear configuraciones iniciales del sistema
  console.log('🔧 Creando configuraciones iniciales...');
  
  const configuraciones = await Promise.all([
    prisma.configuracion.upsert({
      where: { clave: 'nombre_empresa' },
      update: {},
      create: {
        clave: 'nombre_empresa',
        valor: 'Velasti Beauty',
        descripcion: 'Nombre de la empresa que aparece en reportes y documentos',
        tipo: 'string'
      },
    }),
    prisma.configuracion.upsert({
      where: { clave: 'moneda' },
      update: {},
      create: {
        clave: 'moneda',
        valor: 'L.',
        descripcion: 'Símbolo de moneda para mostrar en precios',
        tipo: 'string'
      },
    }),
    prisma.configuracion.upsert({
      where: { clave: 'stock_minimo' },
      update: {},
      create: {
        clave: 'stock_minimo',
        valor: '10',
        descripcion: 'Cantidad mínima de stock para alertas de inventario bajo',
        tipo: 'number'
      },
    }),
    prisma.configuracion.upsert({
      where: { clave: 'alertas_stock' },
      update: {},
      create: {
        clave: 'alertas_stock',
        valor: 'true',
        descripcion: 'Habilitar alertas de stock bajo',
        tipo: 'boolean'
      },
    }),
    prisma.configuracion.upsert({
      where: { clave: 'configuracion_ventas' },
      update: {},
      create: {
        clave: 'configuracion_ventas',
        valor: JSON.stringify({
          impuesto: 15,
          descuento_maximo: 20,
          metodo_pago: ['efectivo', 'tarjeta', 'transferencia']
        }),
        descripcion: 'Configuración general de ventas y facturación',
        tipo: 'json'
      },
    }),
    prisma.configuracion.upsert({
      where: { clave: 'tema_aplicacion' },
      update: {},
      create: {
        clave: 'tema_aplicacion',
        valor: 'light',
        descripcion: 'Tema de la aplicación (light/dark)',
        tipo: 'string'
      },
    }),
  ]);

  console.log('✅ Seed completado exitosamente!');
  console.log(`📊 Resumen:`);
  console.log(`   - Usuarios: 1`);
  console.log(`   - Categorías: ${categorias.length}`);
  console.log(`   - Proveedores: ${proveedores.length}`);
  console.log(`   - Productos: ${todosLosProductos.length}`);
  console.log(`   - Movimientos: ${movimientosEntrada.length + movimientosSalida.length}`);
  console.log(`   - Configuraciones: ${configuraciones.length}`);
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 