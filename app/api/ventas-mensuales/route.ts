import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Movimiento } from "@prisma/client"; 

export async function GET() {
  try {
    const movimientos: Pick<Movimiento, "fecha" | "cantidad" | "valor">[] =
      await prisma.movimiento.findMany({
        where: { tipo: "salida" },
        select: {
          fecha: true,
          cantidad: true,
          valor: true,
        },
      });

    const resumen: { [key: string]: number } = {};

    movimientos.forEach((mov) => {
      const fecha = new Date(mov.fecha);
      const mes = fecha.toLocaleString("es-ES", { month: "short" }); // Usa "es-ES" si querés ver "ene", "feb", etc.
      const venta = mov.cantidad * mov.valor;

      resumen[mes] = (resumen[mes] || 0) + venta;
    });

    const resultado = Object.entries(resumen).map(([mes, ventas]) => ({
      mes: mes.charAt(0).toUpperCase() + mes.slice(1), // capitaliza
      ventas,
    }));

    return NextResponse.json(resultado);
  } catch (error) {
    console.error("Error al obtener ventas mensuales:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
