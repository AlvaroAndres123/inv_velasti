import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// DELETE: eliminar proveedor
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const proveedorId = parseInt(id);
  if (isNaN(proveedorId)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }
  try {
    await prisma.proveedor.delete({ where: { id: proveedorId } });
    return NextResponse.json({ mensaje: 'Proveedor eliminado correctamente' });
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar proveedor' }, { status: 500 });
  }
}

// PUT: actualizar proveedor
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const proveedorId = parseInt(id);
  if (isNaN(proveedorId)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }
  const body = await req.json();
  try {
    const actualizado = await prisma.proveedor.update({
      where: { id: proveedorId },
      data: body,
    });
    return NextResponse.json(actualizado);
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar proveedor' }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const proveedorId = parseInt(id);
  if (isNaN(proveedorId)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }
  try {
    const proveedor = await prisma.proveedor.findUnique({
      where: { id: proveedorId },
      include: { productos: true },
    });
    if (!proveedor) {
      return NextResponse.json({ error: 'Proveedor no encontrado' }, { status: 404 });
    }
    return NextResponse.json(proveedor);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener proveedor' }, { status: 500 });
  }
}
