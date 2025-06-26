import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// POST: login
export async function POST(req: NextRequest) {
  try {
    const { nombre, password } = await req.json();

    if (!nombre || !password) {
      return NextResponse.json(
        { error: "Usuario y contraseña son requeridos" },
        { status: 400 }
      );
    }

    // Buscar usuario en la base de datos por nombre
    const usuario = await prisma.usuario.findUnique({
      where: { nombre },
    });

    if (!usuario) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Verificar contraseña (en producción deberías usar bcrypt)
    if (usuario.password !== password) {
      return NextResponse.json(
        { error: "Contraseña incorrecta" },
        { status: 401 }
      );
    }

    // Registrar actividad de inicio de sesión
    await prisma.actividad.create({
      data: {
        usuarioId: usuario.id,
        accion: 'Inicio de sesión',
        ip: req.headers.get('x-forwarded-for') || '',
      },
    });

    // Retornar datos del usuario (sin la contraseña)
    const { password: _, ...usuarioSinPassword } = usuario;
    
    return NextResponse.json({
      message: "Login exitoso",
      usuario: usuarioSinPassword,
    });
  } catch (error) {
    console.error("Error en login:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
} 