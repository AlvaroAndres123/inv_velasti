"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
  Label,
} from "recharts";
import { TrendingUp, Package, AlertCircle, ShoppingCart, DollarSign, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { formatearSoloFecha } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio"];
const años = ["2023", "2024", "2025"];

const colores = ["#3b82f6", "#10b981", "#f97316", "#ef4444", "#8b5cf6"];

interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  imagen?: string;
}

interface Movimiento {
  id: number;
  tipo: "entrada" | "salida";
  cantidad: number;
  motivo: string;
  valor: number;
  fecha: string;
  producto: Producto; // para poder usar producto.nombre
}

export default function Home() {
  const [mesSeleccionado, setMesSeleccionado] = useState("Mayo");
  const [añoSeleccionado, setAñoSeleccionado] = useState("2025");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const router = useRouter();
  const [cargando, setCargando] = useState(true);
  const [modalStockBajoAbierto, setModalStockBajoAbierto] = useState(false);
  const [ventasMensuales, setVentasMensuales] = useState<
    { mes: string; ventas: number }[]
  >([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [filtro, setFiltro] = useState({
    mes: mesSeleccionado,
    año: añoSeleccionado,
    fechaInicio: fechaInicio,
    fechaFin: fechaFin,
  });
  const [filtroAplicado, setFiltroAplicado] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem("usuario");
    if (!user) {
      router.replace("/login");
      return;
    }

    Promise.all([
      fetch("/api/productos").then((res) => res.json()),
      fetch("/api/movimientos").then((res) => res.json()),
    ])
      .then(([productosData, movimientosData]) => {
        setProductos(productosData);
        setMovimientos(movimientosData);
        setCargando(false);
      })
      .catch((err) => {
        console.error("Error al cargar datos:", err);
        setCargando(false);
      });
  }, [router]);

  const productosStockBajo = productos.filter((p) => p.stock <= 5);
  const totalProductos = productos.length;

  useEffect(() => {
    const user = localStorage.getItem("usuario");
    if (!user) {
      router.replace("/login");
    } else {
      setCargando(false);
    }
  }, [router]);

    useEffect(() => {
    fetch("/api/ventas-mensuales")
      .then((res) => res.json())
      .then((data) => setVentasMensuales(data))
      .catch((err) => console.error("Error al cargar ventas mensuales:", err));
  }, []);

  if (cargando) return null;

  const resumenMovimientos = meses.map((mesNombre, index) => {
    const mesNum = index + 1; // de 1 a 12
    let entradas = 0;
    let salidas = 0;

    movimientos.forEach((mov) => {
      const fecha = new Date(mov.fecha);
      if (
        fecha.getMonth() + 1 === mesNum &&
        fecha.getFullYear() === parseInt(añoSeleccionado)
      ) {
        if (mov.tipo === "entrada") entradas += mov.cantidad;
        else if (mov.tipo === "salida") salidas += mov.cantidad;
      }
    });

    return { mes: mesNombre.slice(0, 3), entradas, salidas };
  });

  const hoy = new Date();
  const hoyStr = hoy.toISOString().split("T")[0]; // YYYY-MM-DD

  const ultimaEntrada =
    movimientos
      .filter((mov) => mov.tipo === "entrada")
      .sort(
        (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
      )[0]?.fecha || "Sin datos";

  const ultimaEntradaFormateada = ultimaEntrada !== "Sin datos" 
    ? formatearSoloFecha(ultimaEntrada) 
    : "Sin datos";

  const ventasHoy = movimientos
    .filter((mov) => mov.tipo === "salida" && mov.fecha.startsWith(hoyStr))
    .reduce((acc, mov) => acc + mov.cantidad * mov.valor, 0);

  const ingresosMes = movimientos
    .filter((mov) => {
      const fecha = new Date(mov.fecha);
      return (
        mov.tipo === "salida" &&
        fecha.getMonth() === hoy.getMonth() &&
        fecha.getFullYear() === hoy.getFullYear()
      );
    })
    .reduce((acc, mov) => acc + mov.cantidad * mov.valor, 0);



  const productosMasVendidos = Object.entries(
    movimientos
      .filter((m) => m.tipo === "salida")
      .reduce((acc, mov) => {
        const nombreProducto = mov.producto?.nombre || "Desconocido";
        acc[nombreProducto] = (acc[nombreProducto] || 0) + mov.cantidad;
        return acc;
      }, {} as Record<string, number>)
  )
    .map(([name, visitors]) => ({ name, visitors }))
    .sort((a, b) => b.visitors - a.visitors)
    .slice(0, 3);

  // Filtrar movimientos según el filtro aplicado
  const movimientosFiltrados = movimientos.filter((mov) => {
    const fecha = new Date(mov.fecha);
    const mes = fecha.toLocaleString("es-ES", { month: "long" });
    const año = fecha.getFullYear().toString();
    let cumple = true;
    if (filtroAplicado) {
      // Si hay fechas, filtra por rango
      if (filtro.fechaInicio && filtro.fechaFin) {
        cumple = fecha >= new Date(filtro.fechaInicio) && fecha <= new Date(filtro.fechaFin);
      } else if (filtro.fechaInicio) {
        cumple = fecha >= new Date(filtro.fechaInicio);
      } else if (filtro.fechaFin) {
        cumple = fecha <= new Date(filtro.fechaFin);
      } else if (filtro.mes && filtro.año) {
        // Si no hay fechas, filtra por mes y año
        cumple = mes.toLowerCase() === filtro.mes.toLowerCase() && año === filtro.año;
      }
    }
    return cumple;
  });

  // Mensaje personalizado según el filtro
  let mensajeSinDatos = "No hay datos para el filtro seleccionado";
  if (filtroAplicado) {
    if (filtro.fechaInicio && filtro.fechaFin) {
      mensajeSinDatos = `No hay datos para el rango del ${formatearSoloFecha(filtro.fechaInicio)} al ${formatearSoloFecha(filtro.fechaFin)}`;
    } else if (filtro.fechaInicio) {
      mensajeSinDatos = `No hay datos desde el ${formatearSoloFecha(filtro.fechaInicio)}`;
    } else if (filtro.fechaFin) {
      mensajeSinDatos = `No hay datos hasta el ${formatearSoloFecha(filtro.fechaFin)}`;
    } else if (filtro.mes && filtro.año) {
      mensajeSinDatos = `No hay datos para ${filtro.mes.toLowerCase()} de ${filtro.año}`;
    }
  }

  return (
    <main className="p-4 sm:p-6 md:p-8 max-w-screen-xl mx-auto">
      <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center md:text-left">
        Dashboard
      </h2>

      <motion.div
        className="flex flex-col sm:flex-row gap-4 mb-8 justify-center md:justify-start"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <select
          value={mesSeleccionado}
          onChange={(e) => setMesSeleccionado(e.target.value)}
          className="border rounded px-3 py-2 text-sm md:text-base"
        >
          {meses.map((mes) => (
            <option key={mes} value={mes}>
              {mes}
            </option>
          ))}
        </select>
        <select
          value={añoSeleccionado}
          onChange={(e) => setAñoSeleccionado(e.target.value)}
          className="border rounded px-3 py-2 text-sm md:text-base"
        >
          {años.map((año) => (
            <option key={año} value={año}>
              {año}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={fechaInicio}
          onChange={(e) => setFechaInicio(e.target.value)}
          className="border rounded px-3 py-2 text-sm md:text-base"
        />
        <input
          type="date"
          value={fechaFin}
          onChange={(e) => setFechaFin(e.target.value)}
          className="border rounded px-3 py-2 text-sm md:text-base"
        />
        <Button
          onClick={() => {
            setFiltro({
              mes: mesSeleccionado,
              año: añoSeleccionado,
              fechaInicio,
              fechaFin,
            });
            setFiltroAplicado(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Aplicar filtro
        </Button>
      </motion.div>

      <AnimatePresence>
        {filtroAplicado && movimientosFiltrados.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex flex-col items-center mb-8"
          >
            <div className="bg-blue-100/60 border border-blue-300 rounded-xl px-8 py-6 flex flex-col items-center shadow-sm">
              <svg
                className="animate-bounce mb-2"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"
                  fill="#3b82f6"
                />
              </svg>
              <span className="text-blue-600 text-lg font-semibold text-center">
                {mensajeSinDatos}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Solo mostrar tarjetas y gráficos si hay datos filtrados */}
      {(!filtroAplicado || movimientosFiltrados.length > 0) && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mb-12">
            <InfoCard
              title="Total de productos"
              value={totalProductos.toString()}
              color="text-blue-400"
              icon={<Package size={36} className="text-blue-300" />}
            />
            <InfoCard
              title="Stock bajo"
              value={productosStockBajo.length.toString()}
              color="text-red-400"
              icon={<AlertCircle size={36} className="text-red-300" />}
              onClick={() => setModalStockBajoAbierto(true)}
            />
            <InfoCard
              title="Última entrada"
              value={ultimaEntradaFormateada}
              color="text-green-400"
              icon={<ShoppingCart size={36} className="text-green-300" />}
            />
            <InfoCard
              title="Ventas del día"
              value={`C$ ${ventasHoy.toLocaleString()}`}
              color="text-purple-400"
              icon={<DollarSign size={36} className="text-purple-300" />}
            />
            <InfoCard
              title="Ingresos del mes"
              value={`C$ ${ingresosMes.toLocaleString()}`}
              color="text-emerald-400"
              icon={<TrendingUp size={36} className="text-emerald-300" />}
            />
            <InfoCard
              title="Productos más vendidos"
              value={productosMasVendidos.map((p) => p.name).join(", ")}
              color="text-orange-400 text-lg"
              icon={<Star size={36} className="text-orange-300" />}
            />
          </div>

          <h3 className="text-lg md:text-xl font-semibold mb-4 text-blue-900 dark:text-blue-200 text-center md:text-left tracking-wide">
            Ventas por Mes
          </h3>
          <div className="bg-white/80 dark:bg-black/60 border border-blue-200 dark:border-blue-900 p-4 rounded-2xl shadow-xl w-full h-[250px] sm:h-[300px] mb-12 backdrop-blur-md">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ventasMensuales}>
                <CartesianGrid strokeDasharray="3 3" stroke="#c7d2fe" />
                <XAxis dataKey="mes" stroke="#1e3a8a" />
                <YAxis stroke="#1e3a8a" />
                <Tooltip contentStyle={{ background: '#e0e7ff', borderRadius: 8, color: '#1e3a8a' }} />
                <Bar dataKey="ventas" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <h3 className="text-lg md:text-xl font-semibold mb-4 text-blue-900 dark:text-blue-200 text-center md:text-left tracking-wide">
            Top 3 productos más vendidos
          </h3>
          <Card className="mb-12 bg-white/80 dark:bg-black/60 border border-blue-200 dark:border-blue-900 rounded-2xl shadow-xl backdrop-blur-md">
            <CardHeader className="items-center pb-0">
              <CardTitle className="text-blue-900 dark:text-blue-200">Distribución por producto</CardTitle>
              <CardDescription>Últimos 6 meses</CardDescription>
            </CardHeader>
            <CardContent className="pb-0">
              <ChartContainer
                config={{}}
                className="mx-auto aspect-square max-h-[350px] md:max-h-[300px]"
              >
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Pie
                    data={productosMasVendidos}
                    dataKey="visitors"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={110}
                    label={false}
                    labelLine={false}
                    fill="#3b82f6"
                  >
                    {productosMasVendidos.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={colores[index % colores.length]}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
              <div className="grid grid-cols-2 gap-2 sm:hidden mt-4">
                {productosMasVendidos.map((item, index) => (
                  <div
                    key={item.name}
                    className="flex items-center space-x-2 text-sm"
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: colores[index % colores.length] }}
                    ></div>
                    <span>
                      {item.name} ({item.visitors})
                    </span>
                  </div>
                ))}
              </div>
              <div className="hidden sm:grid grid-cols-3 gap-2 mt-6">
                {productosMasVendidos.map((item, index) => (
                  <div
                    key={item.name}
                    className="flex items-center space-x-2 text-sm"
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: colores[index % colores.length] }}
                    ></div>
                    <span>
                      {item.name} ({item.visitors})
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm">
              <div className="flex items-center gap-2 font-medium leading-none text-blue-900 dark:text-blue-200">
                En aumento un 5.2% este mes <TrendingUp className="h-4 w-4" />
              </div>
              <div className="leading-none text-muted-foreground">
                Mostrando productos más vendidos en los últimos 6 meses
              </div>
            </CardFooter>
          </Card>

          <h3 className="text-lg md:text-xl font-semibold mb-4 text-blue-900 dark:text-blue-200 text-center md:text-left tracking-wide">
            Entradas vs Salidas por Mes
          </h3>
          <div className="bg-white/80 dark:bg-black/60 border border-blue-200 dark:border-blue-900 p-4 rounded-2xl shadow-xl w-full h-[250px] sm:h-[300px] mb-12 backdrop-blur-md">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={resumenMovimientos}>
                <CartesianGrid strokeDasharray="3 3" stroke="#c7d2fe" />
                <XAxis dataKey="mes" stroke="#1e3a8a" />
                <YAxis stroke="#1e3a8a" />
                <Tooltip contentStyle={{ background: '#e0e7ff', borderRadius: 8, color: '#1e3a8a' }} />
                <Legend />
                <Bar dataKey="entradas" fill="#10b981" name="Entradas" radius={[8, 8, 0, 0]} />
                <Bar dataKey="salidas" fill="#ef4444" name="Salidas" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      <Dialog
        open={modalStockBajoAbierto}
        onOpenChange={setModalStockBajoAbierto}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Productos con stock bajo</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-72 overflow-y-auto">
            {productos
              .filter((p) => p.stock <= 5)
              .map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 p-2 bg-gray-100 rounded"
                >
                  <img
                    src={p.imagen}
                    alt={p.nombre}
                    className="w-10 h-10 rounded object-cover border"
                  />
                  <div>
                    <p className="font-medium">{p.nombre}</p>
                    <p className="text-sm text-gray-600">Stock: {p.stock}</p>
                  </div>
                </div>
              ))}
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}

function InfoCard({
  title,
  value,
  color,
  icon,
  onClick,
}: {
  title: string;
  value: string;
  color: string;
  icon: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <motion.div
      className="relative bg-white border border-blue-100 rounded-xl p-5 min-w-0 cursor-pointer shadow-sm hover:shadow-md transition-shadow duration-200 group overflow-hidden hover:bg-blue-50/40"
      whileHover={{ scale: 1.015 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      onClick={onClick}
    >
      <div className="absolute right-4 top-4">
        {icon}
      </div>
      <h3 className="text-xs md:text-sm font-semibold mb-2 text-blue-900 tracking-wide">
        {title}
      </h3>
      <p
        className={`text-2xl md:text-3xl font-bold ${color} break-words whitespace-normal`}
      >
        {value}
      </p>
    </motion.div>
  );
}
