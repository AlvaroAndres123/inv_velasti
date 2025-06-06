"use client";

import { useState } from "react";
import { List } from "lucide-react";
import AutoCompleteProducto from "@/components/AutoCompleteProducto";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface Movimiento {
  id: number;
  tipo: "entrada" | "salida";
  producto: string;
  cantidad: number;
  motivo: string;
  fecha: string;
}

export default function MovimientosPage() {
  const [tipoMovimiento, setTipoMovimiento] = useState<"entrada" | "salida">(
    "entrada"
  );
  const [form, setForm] = useState({ producto: "", cantidad: "", motivo: "" });
  const [movimientos, setMovimientos] = useState<Movimiento[]>([
    {
      id: 1,
      tipo: "entrada",
      producto: "Shampoo Hidratante",
      cantidad: 20,
      motivo: "Compra a proveedor",
      fecha: "2025-05-15",
    },
    {
      id: 2,
      tipo: "salida",
      producto: "Labial Mate Rojo",
      cantidad: 5,
      motivo: "Venta en mostrador",
      fecha: "2025-05-14",
    },
    {
      id: 3,
      tipo: "entrada",
      producto: "Crema Facial",
      cantidad: 15,
      motivo: "Promoción de temporada",
      fecha: "2025-05-13",
    },
  ]);

  const productosDisponibles = [
    "Shampoo Hidratante",
    "Labial Mate Rojo",
    "Crema Facial",
    "Polvo Compacto",
    "Tónico Refrescante",
    "Base HD Luminosa",
    "Sérum Antiedad",
  ];

  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalProductosAbierto, setModalProductosAbierto] = useState(false);
  const [filtroTexto, setFiltroTexto] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [filtroFecha, setFiltroFecha] = useState("");
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem("usuario");
    if (!user) {
      router.replace("/login");
    }
  }, [router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const nuevoMovimiento: Movimiento = {
      id: movimientos.length + 1,
      tipo: tipoMovimiento,
      producto: form.producto,
      cantidad: parseInt(form.cantidad),
      motivo: form.motivo || "Sin especificar",
      fecha: new Date().toISOString().split("T")[0],
    };

    setMovimientos([nuevoMovimiento, ...movimientos]);
    setForm({ producto: "", cantidad: "", motivo: "" });
    setModalAbierto(false);
  };

  const movimientosFiltrados = movimientos.filter((mov) => {
    const coincideTexto =
      mov.producto.toLowerCase().includes(filtroTexto.toLowerCase()) ||
      mov.motivo.toLowerCase().includes(filtroTexto.toLowerCase());
    const coincideTipo =
      filtroTipo === "todos" ? true : mov.tipo === filtroTipo;
    const coincideFecha = filtroFecha ? mov.fecha === filtroFecha : true;
    return coincideTexto && coincideTipo && coincideFecha;
  });

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
        <h2 className="text-3xl font-bold text-gray-800">
          Movimientos de inventario
        </h2>
        <Button
          onClick={() => setModalAbierto(true)}
          className="flex gap-2 w-full sm:w-auto"
        >
          <Plus size={18} /> Nuevo movimiento
        </Button>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Input
          placeholder="Buscar por producto o motivo"
          value={filtroTexto}
          onChange={(e) => setFiltroTexto(e.target.value)}
        />
        <Select value={filtroTipo} onValueChange={setFiltroTipo}>
          <SelectTrigger>
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="entrada">Entrada</SelectItem>
            <SelectItem value="salida">Salida</SelectItem>
          </SelectContent>
        </Select>
        <Input
          type="date"
          value={filtroFecha}
          onChange={(e) => setFiltroFecha(e.target.value)}
        />
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => {
              setFiltroTexto("");
              setFiltroTipo("todos");
              setFiltroFecha("");
            }}
          >
            Limpiar filtros
          </Button>
          <Button
            variant="default"
            className="w-full sm:w-auto"
            onClick={() => {
              const encabezados = [
                "Fecha",
                "Tipo",
                "Producto",
                "Cantidad",
                "Motivo",
              ];
              const filas = movimientosFiltrados.map((m) => [
                m.fecha,
                m.tipo,
                m.producto,
                m.cantidad.toString(),
                m.motivo,
              ]);
              const csvContent = [encabezados, ...filas]
                .map((e) => e.map((val) => `"${val}"`).join(","))
                .join("\n");
              const blob = new Blob([csvContent], {
                type: "text/csv;charset=utf-8;",
              });
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.setAttribute("href", url);
              link.setAttribute("download", "movimientos.csv");
              link.click();
            }}
          >
            Exportar a Excel
          </Button>
        </div>
      </div>

      {/* Historial */}
      <h3 className="text-2xl font-semibold mb-4 text-gray-800">Historial</h3>
      <div className="overflow-x-auto rounded-xl shadow">
        <table className="min-w-full text-sm text-left text-gray-700 bg-white">
          <thead className="bg-gray-100 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3 sm:px-6 sm:py-4">Fecha</th>
              <th className="px-4 py-3 sm:px-6 sm:py-4">Tipo</th>
              <th className="px-4 py-3 sm:px-6 sm:py-4">Producto</th>
              <th className="px-4 py-3 sm:px-6 sm:py-4">Cantidad</th>
              <th className="px-4 py-3 sm:px-6 sm:py-4">Motivo</th>
            </tr>
          </thead>
          <tbody>
            {movimientosFiltrados.map((mov) => (
              <tr key={mov.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 sm:px-6 sm:py-4">{mov.fecha}</td>
                <td
                  className={`px-4 py-3 sm:px-6 sm:py-4 font-semibold ${
                    mov.tipo === "entrada" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {mov.tipo.charAt(0).toUpperCase() + mov.tipo.slice(1)}
                </td>
                <td className="px-4 py-3 sm:px-6 sm:py-4">{mov.producto}</td>
                <td className="px-4 py-3 sm:px-6 sm:py-4">{mov.cantidad}</td>
                <td className="px-4 py-3 sm:px-6 sm:py-4">{mov.motivo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <Dialog open={modalAbierto} onOpenChange={setModalAbierto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar movimiento</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <Label>Tipo de movimiento</Label>
              <Select
                value={tipoMovimiento}
                onValueChange={(value) =>
                  setTipoMovimiento(value as "entrada" | "salida")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entrada">Entrada</SelectItem>
                  <SelectItem value="salida">Salida</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="producto">Producto</Label>
              <div className="flex gap-2 items-start">
                <div className="flex-1">
                  <AutoCompleteProducto
                    productos={productosDisponibles}
                    valor={form.producto}
                    onSeleccion={(producto) =>
                      setForm((prev) => ({ ...prev, producto }))
                    }
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setModalProductosAbierto(true)}
                  className="px-2"
                >
                  <List size={20} />
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="cantidad">Cantidad</Label>
              <Input
                id="cantidad"
                type="number"
                name="cantidad"
                value={form.cantidad}
                onChange={handleChange}
                min={1}
                required
              />
            </div>

            <div>
              <Label htmlFor="motivo">Motivo (opcional)</Label>
              <Textarea
                id="motivo"
                name="motivo"
                value={form.motivo}
                onChange={handleChange}
                placeholder="Ej: Nueva compra, corrección de stock, venta..."
              />
            </div>

            <Button type="submit" className="w-full">
              Registrar {tipoMovimiento}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/*Modal para ver todos productos*/}
      <Dialog
        open={modalProductosAbierto}
        onOpenChange={setModalProductosAbierto}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Seleccionar producto</DialogTitle>
          </DialogHeader>
          <div className="max-h-60 overflow-y-auto space-y-2">
            {productosDisponibles.map((producto, i) => (
              <div
                key={i}
                className="px-4 py-2 bg-gray-100 rounded hover:bg-blue-100 cursor-pointer transition"
                onClick={() => {
                  setForm((prev) => ({ ...prev, producto }));
                  setModalProductosAbierto(false);
                }}
              >
                {producto}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
