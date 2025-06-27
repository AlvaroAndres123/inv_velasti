import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: obtener todas las configuraciones o una específica por clave
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const clave = searchParams.get('clave');

    if (clave) {
      // Obtener configuración específica
      const configuracion = await prisma.configuracion.findUnique({
        where: { clave },
      });

      if (!configuracion) {
        return NextResponse.json(
          { error: "Configuración no encontrada" },
          { status: 404 }
        );
      }

      return NextResponse.json(configuracion);
    } else {
      // Obtener todas las configuraciones
      const configuraciones = await prisma.configuracion.findMany({
        orderBy: { clave: 'asc' },
      });
      return NextResponse.json(configuraciones);
    }
  } catch (error) {
    console.error('Error al obtener configuraciones:', error);
    return NextResponse.json(
      { error: 'Error al obtener configuraciones' },
      { status: 500 }
    );
  }
}

// POST: crear nueva configuración
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { clave, valor, descripcion, tipo } = body;

    if (!clave || valor === undefined) {
      return NextResponse.json(
        { error: "Clave y valor son obligatorios" },
        { status: 400 }
      );
    }

    // Verificar si ya existe una configuración con esa clave
    const existente = await prisma.configuracion.findUnique({
      where: { clave },
    });

    if (existente) {
      return NextResponse.json(
        { error: "Ya existe una configuración con esa clave" },
        { status: 409 }
      );
    }

    const nuevaConfiguracion = await prisma.configuracion.create({
      data: {
        clave,
        valor: String(valor),
        descripcion,
        tipo: tipo || "string",
      },
    });

    return NextResponse.json(nuevaConfiguracion, { status: 201 });
  } catch (error) {
    console.error("Error al crear configuración:", error);
    return NextResponse.json(
      { error: "Error al crear configuración" },
      { status: 500 }
    );
  }
}

// PUT: actualizar configuración existente
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { clave, valor, descripcion, tipo } = body;

    if (!clave || valor === undefined) {
      return NextResponse.json(
        { error: "Clave y valor son obligatorios" },
        { status: 400 }
      );
    }

    const configuracionActualizada = await prisma.configuracion.update({
      where: { clave },
      data: {
        valor: String(valor),
        descripcion,
        tipo: tipo || "string",
      },
    });

    return NextResponse.json(configuracionActualizada);
  } catch (error) {
    console.error("Error al actualizar configuración:", error);
    return NextResponse.json(
      { error: "Error al actualizar configuración" },
      { status: 500 }
    );
  }
}

// DELETE: eliminar configuración
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const clave = searchParams.get('clave');

    if (!clave) {
      return NextResponse.json(
        { error: "Clave es obligatoria" },
        { status: 400 }
      );
    }

    await prisma.configuracion.delete({
      where: { clave },
    });

    return NextResponse.json({ message: "Configuración eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar configuración:", error);
    return NextResponse.json(
      { error: "Error al eliminar configuración" },
      { status: 500 }
    );
  }
} 