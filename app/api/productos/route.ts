import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: listar productos
export async function GET() {
  try {
    const productos = await prisma.producto.findMany({
      orderBy: { id: 'desc' },
      include: {
        categoria: { select: { nombre: true } },
        proveedor: { select: { nombre: true } },
      },
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
    const {
      nombre,
      descripcion,
      categoriaId,
      proveedorId,
      precio,
      stock,
      imagen,
      destacado,
    } = body;

    if (
      !nombre ||
      !descripcion ||
      !categoriaId ||
      !proveedorId ||
      precio == null ||
      stock == null
    ) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios" },
        { status: 400 }
      );
    }

    const nuevo = await prisma.producto.create({
      data: {
        nombre,
        descripcion,
        precio,
        stock,
        imagen,
        categoriaId: categoriaId,
        proveedorId: proveedorId,
        ...(typeof destacado === 'boolean' ? { destacado } : {}),
      },
      include: {
        categoria: true,
        proveedor: true,
      },
    });

    return NextResponse.json(nuevo, { status: 201 });
  } catch (error) {
    console.error("Error al crear producto:", error);
    return NextResponse.json(
      { error: "Error al crear producto" },
      { status: 500 }
    );
  }
}
