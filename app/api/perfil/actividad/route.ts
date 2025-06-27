import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const nombre = searchParams.get('nombre');
    if (!nombre) {
      return NextResponse.json([], { status: 200 });
    }
    const usuario = await prisma.usuario.findUnique({ where: { nombre } });
    if (!usuario) {
      return NextResponse.json([], { status: 200 });
    }
    const actividades = await prisma.actividad.findMany({
      where: { usuarioId: usuario.id },
      orderBy: { fecha: 'desc' },
      take: 20,
    });
    const resultado = actividades.map(a => ({
      fecha: a.fecha.toISOString().replace('T', ' ').substring(0, 16),
      accion: a.accion,
      ip: a.ip || '',
    }));
    return NextResponse.json(resultado);
  } catch (error) {
    return NextResponse.json([], { status: 200 });
  }
} 