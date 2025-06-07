import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: listar productos
export async function GET() {
  try {
    const productos = await prisma.producto.findMany({
      orderBy: { id: 'desc' }
    });
    return NextResponse.json(productos);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    return NextResponse.json({ error: 'Error al obtener productos' }, { status: 500 });
  }
}

// POST: crear producto
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nombre, descripcion, categoria, proveedor, precio, stock, imagen } = body;

    if (!nombre || !descripcion || !categoria || !proveedor || precio == null || stock == null) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    const nuevo = await prisma.producto.create({
      data: {
        nombre,
        descripcion,
        categoria,
        proveedor,
        precio,
        stock,
        imagen,
      },
    });

    return NextResponse.json(nuevo, { status: 201 });
  } catch (error) {
    console.error('Error al crear producto:', error);
    return NextResponse.json({ error: 'Error al crear producto' }, { status: 500 });
  }
}
