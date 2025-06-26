import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Obtener todos los movimientos
export async function GET() {
  try {
    const movimientos = await prisma.movimiento.findMany({
      include: {
        producto: true,
      },
      orderBy: {
        fecha: "desc",
      },
    });
    return NextResponse.json(movimientos);
  } catch (error) {
    console.error("Error al obtener movimientos:", error);
    return NextResponse.json(
      { error: "Error al obtener movimientos" },
      { status: 500 }
    );
  }
}

// POST: Registrar un nuevo movimiento
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
        console.log("Datos recibidos en el backend:", body);

const { tipo, cantidad, motivo, productoId, valor } = body;

if (!tipo || !cantidad || !productoId || valor == null) {
  return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
}
    const producto = await prisma.producto.findUnique({
      where: { id: productoId },
    });

    if (!producto) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 }
      );
    }

    // Verificar stock si es salida
    if (tipo === "salida" && producto.stock < cantidad) {
      return NextResponse.json(
        { error: "Stock insuficiente" },
        { status: 400 }
      );
    }

    // Calcular nuevo stock
    const nuevoStock =
      tipo === "entrada"
        ? producto.stock + cantidad
        : producto.stock - cantidad;

    // Crear el movimiento
    const movimiento = await prisma.movimiento.create({
 data: {
  tipo,
  cantidad,
  motivo,
  valor, 
  productoId,
},
    });

    // Actualizar el stock del producto
    await prisma.producto.update({
      where: { id: productoId },
      data: { stock: nuevoStock },
    });

    return NextResponse.json(movimiento, { status: 201 });
  } catch (error) {
    console.error("Error al registrar movimiento:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
