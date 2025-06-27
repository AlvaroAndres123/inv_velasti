import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: obtener un producto por ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productoId = parseInt(id);
    
    if (isNaN(productoId)) {
      return NextResponse.json(
        { error: "ID inválido" },
        { status: 400 }
      );
    }

    const producto = await prisma.producto.findUnique({ 
      where: { id: productoId },
      include: {
        categoria: true,
        proveedor: true,
      }
    });
    
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
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productoId = parseInt(id);

    if (isNaN(productoId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }
    
    const body = await req.json();
    const { nombre, descripcion, categoria, proveedor, precio, stock, imagen, destacado } = body;

    const data: any = {
      nombre,
      descripcion,
      precio,
      stock,
      imagen,
      ...(typeof destacado === 'boolean' ? { destacado } : {}),
    };
    
    if (typeof categoria !== 'undefined') {
      data.categoria = { connect: { id: categoria } };
    }
    if (typeof proveedor !== 'undefined') {
      data.proveedor = { connect: { id: proveedor } };
    }
    
    const actualizado = await prisma.producto.update({
      where: { id: productoId },
      data,
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

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productoId = parseInt(id);

    if (isNaN(productoId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    await prisma.producto.delete({ where: { id: productoId } });

    return NextResponse.json({ mensaje: "Producto eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    return NextResponse.json(
      { error: "Error al eliminar producto" },
      { status: 500 }
    );
  }
}
