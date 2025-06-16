import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: obtener un producto por ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);
  try {
    const producto = await prisma.producto.findUnique({ where: { id } });
    if (!producto) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 }
      );
    }
    return NextResponse.json(producto);
  } catch (error) {
    console.error("Error al obtener producto:", error);
    return NextResponse.json(
      { error: "Error al obtener producto" },
      { status: 500 }
    );
  }
}

// PUT: actualizar un producto
export async function PUT(req: NextRequest) {
  const url = new URL(req.url);
  const idStr = url.pathname.split('/').pop(); 
  const id = Number(idStr);

  if (isNaN(id)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }
  const body = await req.json();
  const { nombre, descripcion, categoria, proveedor, precio, stock, imagen } =
    body;

  try {
  const actualizado = await prisma.producto.update({
  where: { id },
  data: {
    nombre,
    descripcion,
    precio,
    stock,
    imagen,
    categoriaId: categoria,
    proveedorId: proveedor,
  },
  include: {
    categoria: true,
    proveedor: true,
  },
});

    return NextResponse.json(actualizado);
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    return NextResponse.json(
      { error: "Error al actualizar producto" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const idStr = url.pathname.split("/").pop();
    const id = parseInt(idStr || "");

    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    await prisma.producto.delete({ where: { id } });

    return NextResponse.json({ mensaje: "Producto eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    return NextResponse.json(
      { error: "Error al eliminar producto" },
      { status: 500 }
    );
  }
}
