"use client";

import { useState, useEffect } from "react";
import { List, LayoutGrid, Table, Filter, Search, ArrowLeftRight, Package, BadgeCheck, AlertTriangle } from "lucide-react";
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
import { useRef } from "react";
import { useRouter } from "next/navigation";
import { formatearFecha, formatearFechaCorta } from "@/lib/utils";
import { useToast, ToastContainer } from "@/components/ui/toast";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { useMediaQuery } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface Movimiento {
  productoId: number;
  id: number;
  tipo: "entrada" | "salida";
  producto: {
    id: number;
    nombre: string;
    descripcion: string;
    categoria: string;
    proveedor: string;
    precio: number;
    stock: number;
    imagen: string;
  };
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
  precio: number; 
  stock: number;
  imagen: string;
}

interface Categoria {
  id: number;
  nombre: string;
}

interface Proveedor {
  id: number;
  nombre: string;
}

export default function MovimientosPage() {
  // Estados principales
  const [tipoMovimiento, setTipoMovimiento] = useState<"entrada" | "salida">("entrada");
  const [form, setForm] = useState({ productoId: "", cantidad: "", motivo: "", valor: "" });
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalProductosAbierto, setModalProductosAbierto] = useState(false);
  const [filtroTextoGeneral, setFiltroTextoGeneral] = useState("");
  const [filtroTextoModal, setFiltroTextoModal] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [filtroFecha, setFiltroFecha] = useState("");
  const router = useRouter();
  const [vista, setVista] = useState<'tabla' | 'tarjetas'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('vistaMovimientos') as 'tabla' | 'tarjetas') || 'tabla';
    }
    return 'tabla';
  });
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(!isMobile);
  // Filtros del modal de productos
  const [filtroCategoriaModal, setFiltroCategoriaModal] = useState('todas');
  const [filtroProveedorModal, setFiltroProveedorModal] = useState('todos');
  const [filtroStockModal, setFiltroStockModal] = useState('todos');
  const [ordenModal, setOrdenModal] = useState('nombre');
  const [ascModal, setAscModal] = useState(true);
  // Estados para categorías y proveedores
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  // Estados para paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [movimientosPorPagina, setMovimientosPorPagina] = useState(10);
  const opcionesPorPagina = [5, 10, 20, 30, 50];

  // useEffect para cargar productos
  useEffect(() => {
    fetch("/api/productos")
      .then((res) => res.json())
      .then((data) => setProductos(data))
      .catch((err) => console.error("Error cargando productos", err));
  }, []);
  // useEffect para cargar movimientos
  useEffect(() => {
    fetch("/api/movimientos")
      .then((res) => res.json())
      .then((data) => setMovimientos(data))
      .catch((err) => console.error("Error cargando movimientos", err));
  }, []);
  // useEffect para cargar categorías y proveedores
  useEffect(() => {
    fetch("/api/categorias")
      .then((res) => res.json())
      .then((data) => setCategorias(data))
      .catch((err) => console.error("Error cargando categorías", err));
    fetch("/api/proveedores")
      .then((res) => res.json())
      .then((data) => setProveedores(data))
      .catch((err) => console.error("Error cargando proveedores", err));
  }, []);
  // useEffect para redirección si no hay usuario
  useEffect(() => {
    const user = localStorage.getItem("usuario");
    if (!user) {
      router.replace("/login");
    }
  }, [router]);
  // useEffect para enfocar input del modal
  useEffect(() => {
    if (modalProductosAbierto) {
      setFiltroTextoModal("");
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [modalProductosAbierto]);
  // useEffect para guardar preferencia de vista
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('vistaMovimientos', vista);
    }
  }, [vista]);
  // Al cambiar filtros, resetear a la primera página
  useEffect(() => {
    setPaginaActual(1);
  }, [filtroTextoGeneral, filtroTipo, filtroFecha, movimientosPorPagina]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
const registrarMovimiento = async () => {

  // Eliminamos la verificación de usuario chico tal vez a futuro estara

  if (!form.productoId || !form.cantidad || !form.valor) {
    alert("Todos los campos son obligatorios.");
    return;
  }

const movimiento = {
  tipo: tipoMovimiento,
  cantidad: parseInt(form.cantidad),
  motivo: form.motivo || "Sin motivo",
  productoId: parseInt(form.productoId),
  valor: parseFloat(form.valor),
};



  try {
    const res = await fetch("/api/movimientos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(movimiento),
    });

    const data = await res.json();

    if (res.ok) {
      console.log("Movimiento registrado:", data);
      // Actualiza la tabla o lista de movimientos
      setMovimientos((prev) => [data, ...prev]);
      setModalAbierto(false);
    } else {
      alert(data.error || "Error al registrar movimiento.");
    }
  } catch (err) {
    console.error("Error al registrar movimiento:", err);
    alert("Error al registrar movimiento.");
  }
};


  const movimientosFiltrados = movimientos.filter((mov) => {
   const coincideTexto =
  (mov.producto?.nombre?.toLowerCase() || "").includes(filtroTextoGeneral.toLowerCase()) ||
  mov.motivo.toLowerCase().includes(filtroTextoGeneral.toLowerCase());

    const coincideTipo =
      filtroTipo === "todos" ? true : mov.tipo === filtroTipo;
    const coincideFecha = filtroFecha ? mov.fecha === filtroFecha : true;
    return coincideTexto && coincideTipo && coincideFecha;
  });

  // Resumen de movimientos
  const totalEntradas = movimientos.filter(m => m.tipo === 'entrada').length;
  const totalSalidas = movimientos.filter(m => m.tipo === 'salida').length;

  // Calcular movimientos a mostrar según paginación
  const totalPaginas = Math.max(1, Math.ceil(movimientosFiltrados.length / movimientosPorPagina));
  const movimientosPaginados = movimientosFiltrados.slice((paginaActual - 1) * movimientosPorPagina, paginaActual * movimientosPorPagina);

  // Spinner de carga
  if (!productos.length && !movimientos.length) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin h-20 w-20 text-blue-500" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          <span className="text-blue-600 font-medium">Cargando movimientos...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f8fa] flex flex-col items-center justify-start py-4">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl border border-gray-200 p-4 sm:p-8 mx-auto">
        {/* Encabezado */}
        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
          <div className="flex items-center gap-2">
            <ArrowLeftRight size={28} className="text-blue-500" />
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 leading-tight">Movimientos de inventario</h2>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 md:ml-4 justify-center md:justify-start mt-2 md:mt-0 items-center">
            <div className="flex flex-row sm:flex-row gap-2 w-full justify-center">
              <span className="px-3 py-1 rounded-full bg-gray-200 text-gray-700 text-xs font-semibold flex items-center gap-1"><Table size={14}/> {movimientos.length} total</span>
              <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold flex items-center gap-1"><BadgeCheck size={14}/> Entradas: {totalEntradas}</span>
              <span className="px-3 py-1 rounded-full bg-red-100 text-red-600 text-xs font-semibold flex items-center gap-1"><AlertTriangle size={14}/> Salidas: {totalSalidas}</span>
            </div>
          </div>
        </div>
        {/* Filtros avanzados mejorados */}
        <div className="mb-6 mt-6 bg-[#f8fafc] rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex flex-wrap items-center gap-2 mb-2 justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setFiltrosAbiertos((v) => !v)}
                className="order-1 px-2 py-1 text-xs h-8 w-8 flex items-center justify-center"
                title={filtrosAbiertos ? 'Ocultar filtros' : 'Mostrar filtros'}
              >
                {filtrosAbiertos ? <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> : <Filter size={16} />}
              </Button>
              <h3 className="font-semibold text-gray-700 ml-2">Filtros</h3>
              <span className="ml-2 text-xs text-gray-500">{movimientosFiltrados.length} resultado(s)</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFiltroTextoGeneral("");
                  setFiltroTipo("todos");
                  setFiltroFecha("");
                }}
                className="text-gray-500 hover:text-gray-700 px-2 py-1 text-xs ml-2"
              >
                Limpiar
              </Button>
            </div>
            <div className="flex items-center gap-2 mt-2 sm:mt-0">
              <label className="text-xs text-gray-500">Mostrar</label>
              <select
                className="rounded-md border border-blue-200 focus:border-blue-400 focus:ring-blue-300 bg-white h-8 text-sm px-2"
                value={movimientosPorPagina}
                onChange={e => {
                  setMovimientosPorPagina(Number(e.target.value));
                  setPaginaActual(1);
                }}
              >
                {opcionesPorPagina.map(op => (
                  <option key={op} value={op}>{op}</option>
                ))}
              </select>
              <span className="text-xs text-gray-500">por página</span>
            </div>
          </div>
          <AnimatePresence>
            {(filtrosAbiertos || !isMobile) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="flex flex-col md:grid md:grid-cols-3 gap-4 mb-4">
                  <div className="w-full flex flex-col relative">
                    <label className="text-sm text-gray-700 mb-1 font-medium">Buscar</label>
                    <div className="relative w-full">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 pointer-events-none">
                        <Search size={16} />
                      </span>
                      <Input
                        placeholder="Buscar por producto o motivo"
                        value={filtroTextoGeneral}
                        onChange={(e) => setFiltroTextoGeneral(e.target.value)}
                        className="pl-10 rounded-md border border-blue-200 focus:border-blue-400 focus:ring-blue-300 bg-white h-10 sm:h-11 text-base w-full text-sm sm:text-base"
                      />
                    </div>
                  </div>
                  <div className="w-full flex flex-col">
                    <label className="text-sm text-gray-700 mb-1 font-medium">Tipo</label>
                    <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                      <SelectTrigger className="rounded-md border border-blue-200 focus:border-blue-400 focus:ring-blue-300 bg-white h-11 text-base">
                        <SelectValue placeholder="Filtrar por tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        <SelectItem value="entrada">Entrada</SelectItem>
                        <SelectItem value="salida">Salida</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-full flex flex-col">
                    <label className="text-sm text-gray-700 mb-1 font-medium">Fecha</label>
                    <div className="relative w-full">
                      <Input
                        type="date"
                        value={filtroFecha}
                        onChange={(e) => setFiltroFecha(e.target.value)}
                        className="pr-10 rounded-md border border-blue-200 focus:border-blue-400 focus:ring-blue-300 bg-white h-10 sm:h-11 text-base w-full text-sm sm:text-base"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                        <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M3 8h18M8 3v2m8-2v2m-9 4v9a2 2 0 002 2h6a2 2 0 002-2V9" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {/* Vista de movimientos */}
        {vista === 'tabla' ? (
          <div className="w-full">
            <div className="hidden sm:block overflow-x-auto rounded-xl shadow bg-white mt-6">
              <table className="min-w-full text-sm text-left text-gray-700 bg-white border-separate border-spacing-0">
                <thead className="bg-gray-200 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-4 py-4 border-b border-gray-300">Fecha</th>
                    <th className="px-4 py-4 border-b border-gray-300">Tipo</th>
                    <th className="px-4 py-4 border-b border-gray-300">Producto</th>
                    <th className="px-4 py-4 border-b border-gray-300">Cantidad</th>
                    <th className="px-4 py-4 border-b border-gray-300">Motivo</th>
                  </tr>
                </thead>
                <tbody>
                  {movimientosPaginados.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-blue-500">
                        <Package size={32} className="mx-auto mb-2" />
                        <div>No hay movimientos para mostrar</div>
                        <div className="text-sm text-gray-500 mt-1">
                          {movimientos.length > 0 ? "Intenta ajustar los filtros" : "Registra tu primer movimiento"}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    movimientosPaginados.map((mov) => (
                      <tr key={mov.id} className="border-t border-gray-200 hover:bg-blue-50/40 transition">
                        <td className="px-4 py-4 border-b border-gray-100">{formatearFechaCorta(mov.fecha)}</td>
                        <td className="px-4 py-4 border-b border-gray-100 font-semibold">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 ${mov.tipo === "entrada" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                            {mov.tipo === "entrada" ? <BadgeCheck size={14}/> : <AlertTriangle size={14}/>} {mov.tipo.charAt(0).toUpperCase() + mov.tipo.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-4 border-b border-gray-100">
                          <TooltipProvider delayDuration={300}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="truncate max-w-[140px] block cursor-pointer">{productos.find((p) => p.id === mov.productoId)?.nombre || "Desconocido"}</span>
                              </TooltipTrigger>
                              <TooltipContent>
                                {productos.find((p) => p.id === mov.productoId)?.nombre || "Desconocido"}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </td>
                        <td className="px-4 py-4 border-b border-gray-100">{mov.cantidad}</td>
                        <td className="px-4 py-4 border-b border-gray-100">
                          <TooltipProvider delayDuration={300}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="truncate max-w-[140px] block cursor-pointer">{mov.motivo}</span>
                              </TooltipTrigger>
                              <TooltipContent>
                                {mov.motivo}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {/* Tarjetas en móvil */}
            <div className="sm:hidden space-y-3">
              {movimientosPaginados.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[120px] text-blue-500 bg-white rounded-xl shadow p-6">
                  <Package size={36} className="mb-2" />
                  <span className="text-base font-semibold">No hay movimientos para mostrar</span>
                  <span className="text-xs text-gray-500 mt-1">
                    {movimientos.length > 0 ? "Intenta ajustar los filtros" : "Registra tu primer movimiento"}
                  </span>
                </div>
              ) : (
                movimientosPaginados.map((mov) => (
                  <div key={mov.id} className="bg-white rounded-xl shadow p-4 flex flex-col gap-2 border border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 font-medium">{formatearFechaCorta(mov.fecha)}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 ${mov.tipo === "entrada" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                        {mov.tipo === "entrada" ? <BadgeCheck size={14}/> : <AlertTriangle size={14}/>} {mov.tipo.charAt(0).toUpperCase() + mov.tipo.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 font-medium">Producto:</span>
                      <TooltipProvider delayDuration={300}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="truncate max-w-[120px] block cursor-pointer font-medium text-gray-800">{productos.find((p) => p.id === mov.productoId)?.nombre || "Desconocido"}</span>
                          </TooltipTrigger>
                          <TooltipContent>
                            {productos.find((p) => p.id === mov.productoId)?.nombre || "Desconocido"}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 font-medium">Cantidad:</span>
                      <span className="text-xs text-gray-700">{mov.cantidad}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 font-medium">Motivo:</span>
                      <span className="text-xs text-gray-700 truncate">{mov.motivo}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
            {/* Controles de paginación debajo de la lista */}
            <div className="flex justify-center items-center gap-2 mt-8">
              <Button
                variant="outline"
                size="sm"
                disabled={paginaActual === 1}
                onClick={() => setPaginaActual(paginaActual - 1)}
              >Anterior</Button>
              {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(num => (
                <Button
                  key={num}
                  variant={paginaActual === num ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPaginaActual(num)}
                  className={paginaActual === num ? 'bg-blue-600 text-white' : ''}
                >{num}</Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                disabled={paginaActual === totalPaginas}
                onClick={() => setPaginaActual(paginaActual + 1)}
              >Siguiente</Button>
            </div>
          </div>
        ) : (
          // Vista tarjetas
          <TooltipProvider delayDuration={300}>
            <div className="w-full">
              <AnimatePresence>
                {movimientosPaginados.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center min-h-[200px] text-blue-500"
                  >
                    <Package size={48} className="mb-2" />
                    <span className="text-lg font-semibold">No hay movimientos para mostrar</span>
                    <span className="text-sm text-gray-500 mt-1">
                      {movimientos.length > 0 ? "Intenta ajustar los filtros" : "Registra tu primer movimiento"}
                    </span>
                  </motion.div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {movimientosPaginados.map((mov) => (
                      <motion.div
                        key={mov.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="relative bg-white rounded-2xl shadow-lg p-6 flex flex-col h-full border border-blue-50 hover:shadow-xl transition group"
                      >
                        {/* Badge tipo */}
                        <span className={`absolute top-2 right-2 sm:top-3 sm:right-3 z-20 px-2 sm:px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${mov.tipo === "entrada" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                          {mov.tipo === "entrada" ? <BadgeCheck size={14}/> : <AlertTriangle size={14}/>} {mov.tipo.charAt(0).toUpperCase() + mov.tipo.slice(1)}
                        </span>
                        {/* Producto */}
                        <div className="flex items-center gap-4 mb-2">
                          <img
                            src={productos.find((p) => p.id === mov.productoId)?.imagen || ''}
                            alt={productos.find((p) => p.id === mov.productoId)?.nombre || 'Producto'}
                            className="w-14 h-14 object-cover rounded border bg-gray-100"
                          />
                          <div>
                            <TooltipProvider delayDuration={300}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="font-medium text-base truncate max-w-[90vw] sm:max-w-[120px] block cursor-pointer">{productos.find((p) => p.id === mov.productoId)?.nombre || "Desconocido"}</span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {productos.find((p) => p.id === mov.productoId)?.nombre || "Desconocido"}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <span className="text-xs text-gray-500">{formatearFecha(mov.fecha)}</span>
                          </div>
                        </div>
                        {/* Cantidad y motivo */}
                        <div className="flex flex-col gap-1 mt-2">
                          <span className="text-sm font-semibold">Cantidad: <span className="text-blue-700">{mov.cantidad}</span></span>
                          <span className="text-xs text-gray-600">Motivo: {mov.motivo}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </div>
          </TooltipProvider>
        )}
        {/* Modal */}
        <Dialog open={modalAbierto} onOpenChange={setModalAbierto}>
          <DialogContent className="max-w-lg px-2 sm:px-6 overflow-y-auto max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-blue-700">
                <ArrowLeftRight size={22} /> Registrar movimiento
              </DialogTitle>
            </DialogHeader>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                registrarMovimiento();
              }}
            >
              <div>
                <Label>Tipo de movimiento</Label>
                <Select
                  value={tipoMovimiento}
                  onValueChange={(value) => setTipoMovimiento(value as "entrada" | "salida")}
                >
                  <SelectTrigger className="rounded-lg border-blue-200 focus:border-blue-400 focus:ring-blue-300 h-11 text-base">
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
                    <Select
                      value={form.productoId}
                      onValueChange={(val) => {
                        const producto = productos.find((p) => p.id.toString() === val);
                        setForm((prev) => ({
                          ...prev,
                          productoId: val,
                          valor: producto?.precio?.toString() || "",
                        }));
                      }}
                    >
                      <SelectTrigger className="rounded-lg border-blue-200 focus:border-blue-400 focus:ring-blue-300 h-11 text-base">
                        <SelectValue placeholder="Seleccionar producto" />
                      </SelectTrigger>
                      <SelectContent>
                        {productos.map((producto) => (
                          <SelectItem key={producto.id} value={producto.id.toString()}>
                            {producto.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setModalProductosAbierto(true)}
                    className="px-2"
                    title="Buscar producto"
                  >
                    <List size={20} />
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
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
                    className="rounded-lg border-blue-200 focus:border-blue-400 focus:ring-blue-300"
                    placeholder="0"
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
                    className="rounded-lg border-blue-200 focus:border-blue-400 focus:ring-blue-300"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="motivo">Motivo (opcional)</Label>
                <Textarea
                  id="motivo"
                  name="motivo"
                  value={form.motivo}
                  onChange={handleChange}
                  placeholder="Ej: Nueva compra, corrección de stock, venta..."
                  className="rounded-lg border-blue-200 focus:border-blue-400 focus:ring-blue-300"
                  rows={2}
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md flex items-center justify-center gap-2"
                disabled={false}
              >
                <ArrowLeftRight size={18} /> Registrar {tipoMovimiento}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Modal para ver todos los productos */}
        <Dialog
          open={modalProductosAbierto}
          onOpenChange={setModalProductosAbierto}
        >
          <DialogContent className="max-w-2xl px-2 sm:px-8 py-6 overflow-y-auto max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Seleccionar producto</DialogTitle>
            </DialogHeader>

            {/* Filtros del modal de productos */}
            <div className="mb-2">
              {/* Desktop: grid horizontal, Mobile: stack vertical */}
              <div className="hidden sm:grid grid-cols-5 gap-2 mb-1">
                <label className="text-xs text-gray-500 font-medium">Categoría</label>
                <label className="text-xs text-gray-500 font-medium">Proveedor</label>
                <label className="text-xs text-gray-500 font-medium">Stock</label>
                <label className="text-xs text-gray-500 font-medium">Ordenar por</label>
                <span></span>
              </div>
              <div className="hidden sm:grid grid-cols-5 gap-2 mb-4">
                <Select value={filtroCategoriaModal} onValueChange={setFiltroCategoriaModal}>
                  <SelectTrigger className="rounded-md border border-blue-200 focus:border-blue-400 focus:ring-blue-300 bg-white h-9 text-sm w-full">
                    <SelectValue placeholder="Categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas</SelectItem>
                    {categorias.map(cat => (
                      <SelectItem key={cat.id} value={cat.nombre}>{cat.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filtroProveedorModal} onValueChange={setFiltroProveedorModal}>
                  <SelectTrigger className="rounded-md border border-blue-200 focus:border-blue-400 focus:ring-blue-300 bg-white h-9 text-sm w-full">
                    <SelectValue placeholder="Proveedor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    {proveedores.map(prov => (
                      <SelectItem key={prov.id} value={prov.nombre}>{prov.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filtroStockModal} onValueChange={setFiltroStockModal}>
                  <SelectTrigger className="rounded-md border border-blue-200 focus:border-blue-400 focus:ring-blue-300 bg-white h-9 text-sm w-full">
                    <SelectValue placeholder="Stock" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="con_stock">Con stock</SelectItem>
                    <SelectItem value="agotado">Agotados</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={ordenModal} onValueChange={setOrdenModal}>
                  <SelectTrigger className="rounded-md border border-blue-200 focus:border-blue-400 focus:ring-blue-300 bg-white h-9 text-sm w-full">
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nombre">Nombre</SelectItem>
                    <SelectItem value="precio">Precio</SelectItem>
                    <SelectItem value="stock">Stock</SelectItem>
                  </SelectContent>
                </Select>
                <Button type="button" variant="outline" size="icon" className="h-9 w-9 mx-auto flex items-center justify-center border border-blue-200" onClick={() => setAscModal(a => !a)} title={ascModal ? 'Ascendente' : 'Descendente'}>
                  {ascModal ? <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M7 14l5-5 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> : <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </Button>
              </div>
              {/* Mobile: stack vertical, cada filtro con su label */}
              <div className="flex flex-col gap-2 sm:hidden mb-4">
                <div>
                  <label className="text-xs text-gray-500 font-medium mb-1 block">Categoría</label>
                  <Select value={filtroCategoriaModal} onValueChange={setFiltroCategoriaModal}>
                    <SelectTrigger className="rounded-md border border-blue-200 focus:border-blue-400 focus:ring-blue-300 bg-white h-10 text-sm w-full">
                      <SelectValue placeholder="Categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todas">Todas</SelectItem>
                      {categorias.map(cat => (
                        <SelectItem key={cat.id} value={cat.nombre}>{cat.nombre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium mb-1 block">Proveedor</label>
                  <Select value={filtroProveedorModal} onValueChange={setFiltroProveedorModal}>
                    <SelectTrigger className="rounded-md border border-blue-200 focus:border-blue-400 focus:ring-blue-300 bg-white h-10 text-sm w-full">
                      <SelectValue placeholder="Proveedor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      {proveedores.map(prov => (
                        <SelectItem key={prov.id} value={prov.nombre}>{prov.nombre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium mb-1 block">Stock</label>
                  <Select value={filtroStockModal} onValueChange={setFiltroStockModal}>
                    <SelectTrigger className="rounded-md border border-blue-200 focus:border-blue-400 focus:ring-blue-300 bg-white h-10 text-sm w-full">
                      <SelectValue placeholder="Stock" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="con_stock">Con stock</SelectItem>
                      <SelectItem value="agotado">Agotados</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 font-medium mb-1 block">Ordenar por</label>
                    <Select value={ordenModal} onValueChange={setOrdenModal}>
                      <SelectTrigger className="rounded-md border border-blue-200 focus:border-blue-400 focus:ring-blue-300 bg-white h-10 text-sm w-full">
                        <SelectValue placeholder="Ordenar por" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nombre">Nombre</SelectItem>
                        <SelectItem value="precio">Precio</SelectItem>
                        <SelectItem value="stock">Stock</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="button" variant="outline" size="icon" className="h-10 w-10 flex items-center justify-center border border-blue-200 mt-5" onClick={() => setAscModal(a => !a)} title={ascModal ? 'Ascendente' : 'Descendente'}>
                    {ascModal ? <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M7 14l5-5 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> : <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </Button>
                </div>
              </div>
            </div>

            {/* Buscador */}
            <input
              ref={inputRef}
              type="text"
              placeholder="Buscar producto..."
              className="w-full mb-4 px-4 py-2 border rounded text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none"
              value={filtroTextoModal}
              onChange={(e) => setFiltroTextoModal(e.target.value)}
              style={{ maxWidth: '100%' }}
            />

            <div className="max-h-80 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
              {productos
                .filter((p) =>
                  p.nombre.toLowerCase().includes(filtroTextoModal.toLowerCase()) &&
                  (filtroCategoriaModal === 'todas' || p.categoria === filtroCategoriaModal) &&
                  (filtroProveedorModal === 'todos' || p.proveedor === filtroProveedorModal) &&
                  (filtroStockModal === 'todos' || (filtroStockModal === 'con_stock' ? p.stock > 0 : p.stock <= 0))
                )
                .sort((a, b) => {
                  let valA: string | number = '';
                  let valB: string | number = '';
                  if (ordenModal === 'nombre') {
                    valA = a.nombre.toLowerCase();
                    valB = b.nombre.toLowerCase();
                  } else if (ordenModal === 'precio') {
                    valA = a.precio;
                    valB = b.precio;
                  } else if (ordenModal === 'stock') {
                    valA = a.stock;
                    valB = b.stock;
                  }
                  if (valA < valB) return ascModal ? -1 : 1;
                  if (valA > valB) return ascModal ? 1 : -1;
                  return 0;
                })
                .map((producto: Producto, i: number) => (
                  <div
                    key={i}
                    onClick={() => {
                      setForm((prev) => ({
                        ...prev,
                        productoId: producto.id.toString(),
                        valor: producto.precio.toString(),
                      }));
                      setModalProductosAbierto(false);
                    }}
                    className="flex items-center gap-4 px-4 py-3 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-lg hover:border-blue-200 cursor-pointer transition-all duration-150 min-h-[64px]"
                    style={{ boxShadow: '0 2px 8px 0 rgba(33,150,243,0.06)' }}
                  >
                    {producto.imagen ? (
                      <img
                        src={producto.imagen}
                        alt={producto.nombre}
                        className="w-10 h-10 object-cover rounded border bg-gray-50 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center border flex-shrink-0">
                        <Package className="text-gray-400" size={22} />
                      </div>
                    )}
                    <div className="flex flex-col justify-center min-w-0">
                      <p className="font-semibold text-sm text-gray-800 truncate">{producto.nombre}</p>
                      <p className="text-xs text-gray-600 truncate">C$ {producto.precio}</p>
                    </div>
                  </div>
                ))}

              {/* Si no hay resultados */}
              {productos.filter((p) =>
                p.nombre.toLowerCase().includes(filtroTextoModal.toLowerCase()) &&
                (filtroCategoriaModal === 'todas' || p.categoria === filtroCategoriaModal) &&
                (filtroProveedorModal === 'todos' || p.proveedor === filtroProveedorModal) &&
                (filtroStockModal === 'todos' || (filtroStockModal === 'con_stock' ? p.stock > 0 : p.stock <= 0))
              ).length === 0 && (
                <p className="text-center text-gray-500 text-sm py-6">
                  Sin coincidencias
                </p>
              )}
            </div>
            <style jsx global>{`
              .custom-scrollbar::-webkit-scrollbar {
                width: 7px;
                background: transparent;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb {
                background: #e3e8f0;
                border-radius: 6px;
              }
              .custom-scrollbar:hover::-webkit-scrollbar-thumb {
                background: #b6c6e3;
              }
            `}</style>
          </DialogContent>
        </Dialog>

        {/* FAB siempre fijo en la esquina inferior derecha */}
        <div className="fixed bottom-6 right-6 z-50 w-14 h-14 flex items-end">
          <Button
            size="icon"
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg w-14 h-14 flex items-center justify-center text-3xl transition-transform hover:scale-110"
            onClick={() => setModalAbierto(true)}
            title="Registrar movimiento"
            aria-label="Registrar movimiento"
            style={{ boxShadow: '0 4px 24px 0 rgba(33,150,243,0.18)' }}
          >
            <Plus size={32} />
          </Button>
        </div>
      </div>
    </div>
  );
}
