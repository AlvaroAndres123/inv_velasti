import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// DELETE: eliminar categoría por ID
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const categoriaId = parseInt(id);
  if (isNaN(categoriaId)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }
  try {
    // Verificar si tiene productos
    const productos = await prisma.producto.findMany({ where: { categoriaId: categoriaId } });

    if (productos.length > 0) {
      return NextResponse.json(
        { error: "No se puede eliminar la categoría porque tiene productos asociados" },
        { status: 400 }
      );
    }

    await prisma.categoria.delete({ where: { id: categoriaId } });

    return NextResponse.json({ mensaje: "Categoría eliminada con éxito" });
  } catch (error) {
    console.error("Error al eliminar categoría:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const categoriaId = parseInt(id);
  if (isNaN(categoriaId)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }
  try {
    const categoria = await prisma.categoria.findUnique({
      where: { id: categoriaId },
      include: { productos: true },
    });
    if (!categoria) {
      return NextResponse.json({ error: 'Categoría no encontrada' }, { status: 404 });
    }
    return NextResponse.json(categoria);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener categoría' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const categoriaId = parseInt(id);
  if (isNaN(categoriaId)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }
  const body = await req.json();
  try {
    const actualizado = await prisma.categoria.update({
      where: { id: categoriaId },
      data: body,
    });
    return NextResponse.json(actualizado);
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar categoría' }, { status: 500 });
  }
}

