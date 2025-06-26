import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: listar proveedores
export async function GET() {
  try {
    const proveedores = await prisma.proveedor.findMany({
      orderBy: { id: 'desc' },
    });
    return NextResponse.json(proveedores);
  } catch (error) {
    console.error('Error al obtener proveedores:', error);
    return NextResponse.json({ error: 'Error al obtener proveedores' }, { status: 500 });
  }
}


// POST: crear proveedor
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nombre, contacto, telefono, correo, direccion } = body;

    if (!nombre || !contacto || !telefono || !correo || !direccion) {
      return NextResponse.json({ error: 'Todos los campos son obligatorios' }, { status: 400 });
    }

    const nuevo = await prisma.proveedor.create({
      data: { nombre, contacto, telefono, correo, direccion },
    });

    return NextResponse.json(nuevo, { status: 201 });
  } catch (error) {
    console.error('Error al crear proveedor:', error);
    return NextResponse.json({ error: 'Error al crear proveedor' }, { status: 500 });
  }
}
