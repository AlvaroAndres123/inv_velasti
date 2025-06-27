import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: obtener perfil por nombre
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const nombre = searchParams.get('nombre');
    if (!nombre) {
      return NextResponse.json({ error: 'Nombre de usuario requerido' }, { status: 400 });
    }
    const usuario = await prisma.usuario.findUnique({ where: { nombre } });
    if (!usuario) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }
    const { password, ...usuarioSinPassword } = usuario;
    return NextResponse.json(usuarioSinPassword);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener perfil' }, { status: 500 });
  }
}

// PUT: actualizar nombre y/o contraseña
export async function PUT(req: NextRequest) {
  try {
    const { nombre, nuevoNombre, contrasenaActual, nuevaContrasena } = await req.json();
    if (!nombre) {
      return NextResponse.json({ error: 'Nombre de usuario requerido' }, { status: 400 });
    }
    const usuario = await prisma.usuario.findUnique({ where: { nombre } });
    if (!usuario) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }
    // Si se quiere cambiar la contraseña
    if (nuevaContrasena) {
      if (!contrasenaActual || usuario.password !== contrasenaActual) {
        return NextResponse.json({ error: 'La contraseña actual no es correcta' }, { status: 401 });
      }
    }
    const data: any = {};
    if (nuevoNombre && nuevoNombre !== nombre) data.nombre = nuevoNombre;
    if (nuevaContrasena) data.password = nuevaContrasena;
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'No hay cambios para actualizar' }, { status: 400 });
    }
    const actualizado = await prisma.usuario.update({
      where: { nombre },
      data,
    });
    // Registrar actividad
    await prisma.actividad.create({
      data: {
        usuarioId: actualizado.id,
        accion: nuevaContrasena ? (nuevoNombre ? 'Actualización de perfil y cambio de contraseña' : 'Cambio de contraseña') : 'Actualización de perfil',
        ip: req.headers.get('x-forwarded-for') || '',
      },
    });
    const { password, ...usuarioSinPassword } = actualizado;
    return NextResponse.json(usuarioSinPassword);
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar perfil' }, { status: 500 });
  }
} 