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
import { useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Movimiento {
  id: number;
  tipo: "entrada" | "salida";
  producto: string;
  cantidad: number;
  motivo: string;
  fecha: string;
}

interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  categoria: string;
  proveedor: string;
  valor: number;
  stock: number;
  imagen: string;
}

export default function MovimientosPage() {
  const [tipoMovimiento, setTipoMovimiento] = useState<"entrada" | "salida">(
    "entrada"
  );
  const [form, setForm] = useState({
    producto: "",
    cantidad: "",
    motivo: "",
    valor: "",
  });

  const [movimientos, setMovimientos] = useState<Movimiento[]>([
    {
      id: 1,
      tipo: "entrada",
      producto: "Base HD Luminosa",
      cantidad: 10,
      motivo: "Reposición mensual",
      fecha: "2025-06-01",
    },
    {
      id: 2,
      tipo: "salida",
      producto: "Esmalte Gel Rojo Rubí",
      cantidad: 4,
      motivo: "Venta directa",
      fecha: "2025-06-02",
    },
    {
      id: 3,
      tipo: "entrada",
      producto: "Crema Hidratante con Ácido Hialurónico",
      cantidad: 5,
      motivo: "Compra a proveedor",
      fecha: "2025-06-03",
    },
  ]);

  const [productos, setProductos] = useState<Producto[]>([
    {
      id: 1,
      nombre: "Base HD Luminosa",
      descripcion: "Base líquida de cobertura media con acabado natural.",
      categoria: "Maquillaje",
      proveedor: "Distribuidora Bella",
      valor: 220,
      stock: 15,
      imagen:
        "https://static.mujerhoy.com/www/multimedia/202210/26/media/cortadas/bases-de-maquillaje-luminosas-309891308_167580719198570maquillaje-serum-skin-illusion-velvet-krHB--624x624@MujerHoy.jpg",
    },
    {
      id: 2,
      nombre: "Crema Hidratante con Ácido Hialurónico",
      descripcion: "Hidrata profundamente y mejora la elasticidad de la piel.",
      categoria: "Cuidado Facial",
      proveedor: "Cosmeticos Lopez",
      valor: 180,
      stock: 10,
      imagen:
        "https://th.bing.com/th/id/OIP.UHxFL3bGYwZvoj8Z5vpLkwHaIp?cb=iwp2&rs=1&pid=ImgDetMain",
    },
    {
      id: 3,
      nombre: "Esmalte Gel Rojo Rubí",
      descripcion: "Color intenso con larga duración y acabado profesional.",
      categoria: "Uñas",
      proveedor: "Distribuidora Bella",
      valor: 75,
      stock: 35,
      imagen:
        "https://th.bing.com/th/id/OIP.CP9Fi_9UADvQbjQW_4UIYAHaKU?cb=iwp2&rs=1&pid=ImgDetMain",
    },
  ]);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalProductosAbierto, setModalProductosAbierto] = useState(false);
  const [filtroTextoGeneral, setFiltroTextoGeneral] = useState("");
  const [filtroTextoModal, setFiltroTextoModal] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [filtroFecha, setFiltroFecha] = useState("");
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem("usuario");
    if (!user) {
      router.replace("/login");
    }
  }, [router]);

  useEffect(() => {
    if (modalProductosAbierto) {
      setFiltroTextoModal("");
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100); // le damos un poquito de tiempo para que el modal inicie baby claro que si
    }
  }, [modalProductosAbierto]);

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
    setForm({ producto: "", cantidad: "", motivo: "", valor: "" });
    setModalAbierto(false);
  };

  const movimientosFiltrados = movimientos.filter((mov) => {
    const coincideTexto =
      mov.producto.toLowerCase().includes(filtroTextoGeneral.toLowerCase()) ||
      mov.motivo.toLowerCase().includes(filtroTextoGeneral.toLowerCase());
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
          value={filtroTextoGeneral}
          onChange={(e) => setFiltroTextoGeneral(e.target.value)}
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
              setFiltroTextoGeneral("");
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
                    productos={productos.map((p) => p.nombre)}
                    valor={form.producto}
                    onSeleccion={(producto) =>
                      setForm((prev) => ({
                        ...prev,
                        producto,
                        valor: (
                          productos.find((p) => p.nombre === producto)?.valor ||
                          ""
                        ).toString(),
                      }))
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
              <Label htmlFor="valor">Valor unitario (C$)</Label>
              <Input
                id="valor"
                type="number"
                name="valor"
                value={form.valor}
                onChange={handleChange}
                min={0}
                step={0.01}
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

      {/* Modal para ver todos los productos */}
      <Dialog
        open={modalProductosAbierto}
        onOpenChange={setModalProductosAbierto}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Seleccionar producto</DialogTitle>
          </DialogHeader>

          {/* Buscador */}
          <input
            ref={inputRef}
            type="text"
            placeholder="Buscar producto..."
            className="w-full mb-4 px-4 py-2 border rounded text-sm"
            value={filtroTextoModal}
            onChange={(e) => setFiltroTextoModal(e.target.value)}
          />

          <div className="max-h-72 overflow-y-auto space-y-2">
            {productos
              .filter((p) =>
                p.nombre.toLowerCase().includes(filtroTextoModal.toLowerCase())
              )
              .map((producto: Producto, i: number) => (
                <div
                  key={i}
                  onClick={() => {
                    setForm((prev) => ({
                      ...prev,
                      producto: producto.nombre,
                      valor: producto.valor.toString(),
                    }));
                    setModalProductosAbierto(false);
                  }}
                  className="flex items-center gap-4 px-4 py-2 bg-gray-100 rounded hover:bg-blue-100 cursor-pointer transition"
                >
                  <img
                    src={producto.imagen}
                    alt={producto.nombre}
                    className="w-12 h-12 object-cover rounded border"
                  />
                  <div>
                    <p className="font-medium text-sm">{producto.nombre}</p>
                    <p className="text-xs text-gray-600">C$ {producto.valor}</p>
                  </div>
                </div>
              ))}

            {/* Si no hay resultados */}
            {productos.filter((p) =>
              p.nombre.toLowerCase().includes(filtroTextoModal.toLowerCase())
            ).length === 0 && (
              <p className="text-center text-gray-500 text-sm">
                Sin coincidencias
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
