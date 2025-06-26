import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const movimientos = await prisma.movimiento.findMany({
      where: {
        tipo: "salida",
      },
      select: {
        fecha: true,
        cantidad: true,
        valor: true,
      },
    });

    const ventasPorMes: { [key: string]: number } = {};

    movimientos.forEach((mov: { fecha: Date; cantidad: number; valor: number }) => {
      const fecha = new Date(mov.fecha);
      const mes = fecha.toLocaleString("es-ES", { month: "long" }); // Usa nombres completos en español
      const año = fecha.getFullYear();
      const mesAño = `${mes} ${año}`;
      
      ventasPorMes[mesAño] = (ventasPorMes[mesAño] || 0) + mov.cantidad * mov.valor;
    });

    const resultado = Object.entries(ventasPorMes).map(([mes, ventas]) => ({
      mes,
      ventas: Math.round(ventas * 100) / 100, // Redondear a 2 decimales
    }));

    return NextResponse.json(resultado);
  } catch (error) {
    console.error("Error al obtener ventas mensuales:", error);
    return NextResponse.json(
      { error: "Error al obtener ventas mensuales" },
      { status: 500 }
    );
  }
}
