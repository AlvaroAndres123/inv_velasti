import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// DELETE: eliminar proveedor
export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 });

    await prisma.proveedor.delete({ where: { id } });

    return NextResponse.json({ mensaje: 'Proveedor eliminado' });
  } catch (error) {
    console.error('Error al eliminar proveedor:', error);
    return NextResponse.json({ error: 'Error al eliminar proveedor' }, { status: 500 });
  }
}

// PUT: actualizar proveedor
export async function PUT(req: NextRequest) {
  const url = new URL(req.url);
  const idStr = url.pathname.split('/').pop(); 
  const id = Number(idStr);

  if (isNaN(id)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }

  const body = await req.json();
  const { nombre, contacto, telefono, correo, direccion } = body;

  if (!nombre || !contacto || !telefono || !correo || !direccion) {
    return NextResponse.json({ error: 'Datos inválidos o incompletos' }, { status: 400 });
  }

  try {
    const actualizado = await prisma.proveedor.update({
      where: { id },
      data: { nombre, contacto, telefono, correo, direccion },
    });

    return NextResponse.json(actualizado);
  } catch (error) {
    console.error('Error al actualizar proveedor:', error);
    return NextResponse.json({ error: 'Error al actualizar proveedor' }, { status: 500 });
  }
}
