import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// DELETE: eliminar categoría por ID
export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const idStr = url.pathname.split("/").pop(); // Extrae el último segmento del path
    const id = parseInt(idStr || "");

    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    // Verificar si tiene productos
    const productos = await prisma.producto.findMany({ where: { categoriaId: id } });

    if (productos.length > 0) {
      return NextResponse.json(
        { error: "No se puede eliminar la categoría porque tiene productos asociados" },
        { status: 400 }
      );
    }

    await prisma.categoria.delete({ where: { id } });

    return NextResponse.json({ mensaje: "Categoría eliminada con éxito" });
  } catch (error) {
    console.error("Error al eliminar categoría:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

