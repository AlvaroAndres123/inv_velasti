import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  const categorias = await prisma.categoria.findMany();
  return NextResponse.json(categorias);
}
