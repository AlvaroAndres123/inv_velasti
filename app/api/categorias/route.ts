import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: listar categorías
export async function GET() {
  try {
    const categorias = await prisma.categoria.findMany({
      orderBy: { id: 'desc' },
    });
    return NextResponse.json(categorias);
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    return NextResponse.json({ error: 'Error al obtener categorías' }, { status: 500 });
  }
}

// POST: crear una nueva categoría
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nombre } = body;

    if (!nombre) {
      return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 });
    }

    // Validar si ya existe
    const existe = await prisma.categoria.findUnique({ where: { nombre } });
    if (existe) {
      return NextResponse.json({ error: 'La categoría ya existe' }, { status: 409 });
    }

    const nuevaCategoria = await prisma.categoria.create({
      data: { nombre },
    });

    return NextResponse.json(nuevaCategoria, { status: 201 });
  } catch (error) {
    console.error('Error al crear categoría:', error);
    return NextResponse.json({ error: 'Error al crear categoría' }, { status: 500 });
  }
}
