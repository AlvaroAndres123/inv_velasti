import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Obtener un movimiento específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const movimientoId = parseInt(id);
    
    if (isNaN(movimientoId)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    const movimiento = await prisma.movimiento.findUnique({
      where: { id: movimientoId },
      include: {
        producto: {
          include: {
            categoria: true,
            proveedor: true,
          },
        },
      },
    });

    if (!movimiento) {
      return NextResponse.json(
        { error: 'Movimiento no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(movimiento);
  } catch (error) {
    console.error('Error al obtener movimiento:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 