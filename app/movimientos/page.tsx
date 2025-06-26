"use client";

import { useState, useEffect } from "react";
import { List, LayoutGrid, Table, Filter, Search, ArrowLeftRight, Package, BadgeCheck, AlertTriangle, X, Trash2, Ban, Eye } from "lucide-react";
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
import { ExportButton } from "@/components/ui/ExportButton";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ExcelJS from "exceljs";

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
  anulado: boolean;
  motivo_anulacion: string;
  fecha_anulacion: string;
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
  const { toasts, success, error: showError, removeToast } = useToast();
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
  // NUEVOS ESTADOS DE FILTRO
  const [filtroProducto, setFiltroProducto] = useState("");
  const [filtroMotivo, setFiltroMotivo] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("todas");
  const [filtroMarca, setFiltroMarca] = useState("todas");
  // Agregar estados para el rango de fechas
  const [filtroFechaInicio, setFiltroFechaInicio] = useState("");
  const [filtroFechaFin, setFiltroFechaFin] = useState("");
  // Estado para anulación
  const [modalAnular, setModalAnular] = useState(false);
  const [movimientoAAnular, setMovimientoAAnular] = useState<Movimiento | null>(null);
  const [motivoAnulacion, setMotivoAnulacion] = useState("");
  const [anulando, setAnulando] = useState(false);
  // Estado para modal de detalles
  const [modalDetalles, setModalDetalles] = useState(false);
  const [productoDetalle, setProductoDetalle] = useState<Producto | null>(null);
  // 1. Estado para la fecha y hora
  const [fechaMovimiento, setFechaMovimiento] = useState(() => {
    const now = new Date();
    return now.toISOString().slice(0, 10); // YYYY-MM-DD
  });
  const [usarHora, setUsarHora] = useState(false);
  const [horaMovimiento, setHoraMovimiento] = useState(() => {
    const now = new Date();
    return now.toTimeString().slice(0, 5); // HH:mm
  });

  // Motivos únicos para autocomplete
  const motivosUnicos = Array.from(new Set(movimientos.map(m => m.motivo))).filter(Boolean);
  const productosUnicos = productos.map(p => p.nombre);

  // Cargar filtros desde localStorage al montar
  useEffect(() => {
    const saved = localStorage.getItem('filtrosMovimientos');
    if (saved) {
      const f = JSON.parse(saved);
      setFiltroProducto(f.filtroProducto || "");
      setFiltroMotivo(f.filtroMotivo || "");
      setFiltroCategoria(f.filtroCategoria || "todas");
      setFiltroMarca(f.filtroMarca || "todas");
      setFiltroTipo(f.filtroTipo || "todos");
      setFiltroFecha(f.filtroFecha || "");
    }
  }, []);
  // Guardar filtros en localStorage al cambiar
  useEffect(() => {
    localStorage.setItem('filtrosMovimientos', JSON.stringify({
      filtroProducto, filtroMotivo, filtroCategoria, filtroMarca, filtroTipo, filtroFecha
    }));
  }, [filtroProducto, filtroMotivo, filtroCategoria, filtroMarca, filtroTipo, filtroFecha]);

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
    // if (!user) {
    //   router.replace("/login");
    // }
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
    showError("Error de validación", "Todos los campos son obligatorios.");
    return;
  }

  let fechaFinal = fechaMovimiento;
  if (usarHora && horaMovimiento) {
    fechaFinal = `${fechaMovimiento}T${horaMovimiento}:00`;
  } else {
    // Si no se usa hora específica, usar la hora actual
    const ahora = new Date();
    fechaFinal = `${fechaMovimiento}T${ahora.toTimeString().slice(0, 8)}`;
  }
  const movimiento = {
    tipo: tipoMovimiento,
    cantidad: parseInt(form.cantidad),
    motivo: form.motivo || "Sin motivo",
    productoId: parseInt(form.productoId),
    valor: parseFloat(form.valor),
    fecha: fechaFinal,
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
      // Actualiza la tabla o lista de movimientos
      setMovimientos((prev) => [data, ...prev]);
      setModalAbierto(false);
      success("Movimiento registrado", "El movimiento ha sido registrado exitosamente.");
    } else {
      showError("Error al registrar", data.error || "Error al registrar movimiento.");
    }
  } catch (err) {
    console.error("Error al registrar movimiento:", err);
    showError("Error inesperado", "Ocurrió un error inesperado al registrar el movimiento.");
  }
};


  const movimientosFiltrados = movimientos.filter((mov) => {
    const producto = productos.find((p) => p.id === mov.productoId);
    const coincideProducto = filtroProducto === "" || (producto?.nombre?.toLowerCase() || "").includes(filtroProducto.toLowerCase());
    const coincideMotivo = filtroMotivo === "" || mov.motivo.toLowerCase().includes(filtroMotivo.toLowerCase());
    const coincideTipo = filtroTipo === "todos"
      ? !mov.anulado
      : filtroTipo === "anulados"
        ? mov.anulado
        : mov.tipo === filtroTipo && !mov.anulado;
    // Convertir fecha del movimiento (DD/MM/YYYY) a YYYY-MM-DD para comparar
    function normalizarFecha(fechaStr: string) {
      if (!fechaStr) return "";
      // Si viene en formato DD/MM/YYYY, convertir a YYYY-MM-DD
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(fechaStr)) {
        const [d, m, y] = fechaStr.split("/");
        return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
      }
      // Si viene en formato YYYY-MM-DD o incluye hora, tomar solo los primeros 10 caracteres
      return fechaStr.slice(0, 10);
    }
    const movFechaNorm = normalizarFecha(mov.fecha);
    let coincideFecha = true;
    if (filtroFechaInicio && filtroFechaFin) {
      coincideFecha = movFechaNorm >= filtroFechaInicio && movFechaNorm <= filtroFechaFin;
    } else if (filtroFecha) {
      coincideFecha = movFechaNorm === filtroFecha;
    }
    const coincideCategoria = filtroCategoria === "todas" ? true : (producto?.categoria === filtroCategoria);
    const coincideMarca = filtroMarca === "todas" ? true : (producto?.proveedor === filtroMarca);
    return coincideProducto && coincideMotivo && coincideTipo && coincideFecha && coincideCategoria && coincideMarca;
  });

  // Resumen de movimientos
  const totalEntradas = movimientos.filter(m => m.tipo === 'entrada').length;
  const totalSalidas = movimientos.filter(m => m.tipo === 'salida').length;

  // Calcular movimientos a mostrar según paginación
  const totalPaginas = Math.max(1, Math.ceil(movimientosFiltrados.length / movimientosPorPagina));
  const movimientosPaginados = movimientosFiltrados.slice((paginaActual - 1) * movimientosPorPagina, paginaActual * movimientosPorPagina);

  // Función para generar nombre de archivo exportado
  function nombreArchivoExportacion(tipo: 'Filtrados', extension: 'xlsx' | 'pdf') {
    const fecha = new Date();
    const yyyy = fecha.getFullYear();
    const mm = String(fecha.getMonth() + 1).padStart(2, '0');
    const dd = String(fecha.getDate()).padStart(2, '0');
    return `AlmaSoft_Movimientos_${yyyy}${mm}${dd}_${tipo}.${extension}`;
  }
  // Exportar a Excel
  function exportarMovimientosAExcel(movimientosExportar: Movimiento[], nombreArchivo: string) {
    if (!movimientosExportar.length) return;
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Movimientos");
    worksheet.mergeCells("A1:F1");
    const logoCell = worksheet.getCell("A1");
    logoCell.value = "Movimientos";
    logoCell.font = { name: "Calibri", bold: true, size: 22, color: { argb: "FF2196F3" } };
    logoCell.alignment = { horizontal: "center", vertical: "middle" };
    worksheet.addRow([]);
    worksheet.columns = [
      { header: "Fecha", key: "fecha", width: 14 },
      { header: "Tipo", key: "tipo", width: 10 },
      { header: "Producto", key: "producto", width: 24 },
      { header: "Cantidad", key: "cantidad", width: 10 },
      { header: "Motivo", key: "motivo", width: 30 },
    ];
    movimientosExportar.forEach((m) => {
      worksheet.addRow({
        fecha: m.fecha,
        tipo: m.tipo.charAt(0).toUpperCase() + m.tipo.slice(1),
        producto: m.producto?.nombre || '',
        cantidad: m.cantidad,
        motivo: m.motivo,
      });
    });
    const headerRowIdx = 3;
    worksheet.getRow(headerRowIdx).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF2196F3" },
      };
      cell.alignment = { horizontal: "center" };
      cell.border = {
        top: { style: "thin", color: { argb: "FFAAAAAA" } },
        bottom: { style: "thin", color: { argb: "FFAAAAAA" } },
        left: { style: "thin", color: { argb: "FFAAAAAA" } },
        right: { style: "thin", color: { argb: "FFAAAAAA" } },
      };
    });
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber < headerRowIdx) return;
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin", color: { argb: "FFAAAAAA" } },
          bottom: { style: "thin", color: { argb: "FFAAAAAA" } },
          left: { style: "thin", color: { argb: "FFAAAAAA" } },
          right: { style: "thin", color: { argb: "FFAAAAAA" } },
        };
        cell.font = cell.font || { name: "Calibri", size: 11 };
      });
    });
    const colCount = worksheet.getRow(headerRowIdx).cellCount;
    const lastCol = String.fromCharCode(64 + colCount);
    worksheet.autoFilter = {
      from: `A${headerRowIdx}`,
      to: `${lastCol}${headerRowIdx}`,
    };
    const fecha = new Date().toLocaleDateString();
    const pieRow = worksheet.addRow([]);
    pieRow.getCell(1).value = `Exportado desde AlmaSoft - Fecha: ${fecha}`;
    worksheet.mergeCells(`A${pieRow.number}:E${pieRow.number}`);
    pieRow.getCell(1).alignment = { horizontal: "center" };
    pieRow.getCell(1).font = { color: { argb: "FF888888" }, italic: true, size: 11 };
    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      saveAs(blob, nombreArchivo);
    });
  }
  // Exportar a PDF
  function exportarMovimientosAPDF(movimientosExportar: Movimiento[], nombreArchivo: string) {
    if (!movimientosExportar.length) return;
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.setTextColor(33, 150, 243);
    doc.setFont('helvetica', 'bold');
    doc.text('Movimientos', doc.internal.pageSize.getWidth() / 2, 22, { align: 'center' });
    doc.setDrawColor(33, 150, 243);
    doc.setLineWidth(1);
    doc.line(20, 28, doc.internal.pageSize.getWidth() - 20, 28);
    const columns = [
      { header: "Fecha", dataKey: "fecha" },
      { header: "Tipo", dataKey: "tipo" },
      { header: "Producto", dataKey: "producto" },
      { header: "Cantidad", dataKey: "cantidad" },
      { header: "Motivo", dataKey: "motivo" },
    ];
    const data = movimientosExportar.map((m) => ({
      fecha: m.fecha,
      tipo: m.tipo.charAt(0).toUpperCase() + m.tipo.slice(1),
      producto: m.producto?.nombre || '',
      cantidad: m.cantidad,
      motivo: m.motivo,
    }));
    autoTable(doc, {
      startY: 34,
      head: [columns.map(col => col.header)],
      body: data.map(row => columns.map(col => (row as any)[col.dataKey])),
      styles: { fontSize: 10, cellPadding: 3, font: 'helvetica', textColor: [33, 37, 41] },
      headStyles: { fillColor: [33, 150, 243], textColor: 255, fontStyle: 'bold', fontSize: 11 },
      alternateRowStyles: { fillColor: [240, 248, 255] },
      tableLineColor: [180, 180, 180],
      tableLineWidth: 0.3,
      margin: { left: 14, right: 14 },
      tableWidth: 'auto',
    });
    const fecha = new Date().toLocaleDateString();
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.setFont('helvetica', 'italic');
    doc.text(
      `Exportado desde AlmaSoft - Fecha: ${fecha}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
    doc.save(nombreArchivo);
  }

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

  function renderPaginacion({ paginaActual, totalPaginas, setPaginaActual }: { paginaActual: number, totalPaginas: number, setPaginaActual: (n: number) => void }) {
    const paginas = [];
    if (totalPaginas <= 7) {
      for (let i = 1; i <= totalPaginas; i++) {
        paginas.push(i);
      }
    } else {
      paginas.push(1);
      if (paginaActual > 4) paginas.push('...');
      for (let i = Math.max(2, paginaActual - 2); i <= Math.min(totalPaginas - 1, paginaActual + 2); i++) {
        if (i === 1 || i === totalPaginas) continue;
        paginas.push(i);
      }
      if (paginaActual < totalPaginas - 3) paginas.push('...');
      paginas.push(totalPaginas);
    }
    return (
      <div className="flex justify-center items-center gap-2 mt-8">
        <Button
          variant="outline"
          size="sm"
          disabled={paginaActual === 1}
          onClick={() => setPaginaActual(paginaActual - 1)}
        >Anterior</Button>
        {paginas.map((num, idx) =>
          num === '...'
            ? <span key={`ellipsis-${idx}`} className="px-2 text-gray-400">...</span>
            : <Button
                key={num}
                variant={paginaActual === num ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPaginaActual(num as number)}
                className={paginaActual === num ? 'bg-blue-600 text-white' : ''}
              >{num}</Button>
        )}
        <Button
          variant="outline"
          size="sm"
          disabled={paginaActual === totalPaginas}
          onClick={() => setPaginaActual(paginaActual + 1)}
        >Siguiente</Button>
      </div>
    );
  }

  // Función para abrir modal de anulación
  const abrirModalAnular = (mov: Movimiento) => {
    setMovimientoAAnular(mov);
    setMotivoAnulacion("");
    setModalAnular(true);
  };
  // Función para anular movimiento
  const anularMovimiento = async () => {
    if (!movimientoAAnular || !motivoAnulacion.trim()) {
      showError("Motivo requerido", "Debes ingresar el motivo de anulación.");
      return;
    }
    setAnulando(true);
    try {
      const res = await fetch("/api/movimientos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: movimientoAAnular.id, motivo_anulacion: motivoAnulacion }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMovimientos((prev) => prev.map(m => m.id === movimientoAAnular.id ? { ...m, anulado: true, motivo_anulacion: motivoAnulacion, fecha_anulacion: new Date().toISOString() } : m));
        setModalAnular(false);
        success("Movimiento anulado", "El movimiento ha sido anulado correctamente.");
      } else {
        showError("Error al anular", data.error || "No se pudo anular el movimiento.");
      }
    } catch (err) {
      showError("Error inesperado", "Ocurrió un error al anular el movimiento.");
    } finally {
      setAnulando(false);
    }
  };

  // Función para abrir modal de detalles
  const abrirModalDetalles = (mov: Movimiento) => {
    setMovimientoAAnular(mov); // Asegura que el movimiento esté disponible para el modal
    const prod = productos.find(p => p.id === mov.productoId);
    setProductoDetalle(prod || null);
    setModalDetalles(true);
  };

  return (
    <div className="min-h-screen bg-[#f6f8fa] flex flex-col items-center justify-start py-4">
      <div className="w-full max-w-7xl px-4 sm:px-8 mx-auto">
        {/* Toast Container */}
        <ToastContainer toasts={toasts} onClose={removeToast} />
        
        {/* Encabezado y botones de cambio de vista */}
        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2 justify-between">
          <div className="flex items-center gap-2">
            <ArrowLeftRight size={28} className="text-blue-500" />
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 leading-tight">Movimientos de inventario</h2>
          </div>
          <div className="flex gap-2 mt-2 md:mt-0">
            <Button
              variant={vista === 'tabla' ? 'default' : 'outline'}
              size="icon"
              aria-label="Vista tabla"
              className={vista === 'tabla' ? 'bg-blue-600 text-white' : ''}
              onClick={() => setVista('tabla')}
            >
              <Table size={20} />
            </Button>
            <Button
              variant={vista === 'tarjetas' ? 'default' : 'outline'}
              size="icon"
              aria-label="Vista tarjetas"
              className={vista === 'tarjetas' ? 'bg-blue-600 text-white' : ''}
              onClick={() => setVista('tarjetas')}
            >
              <LayoutGrid size={20} />
            </Button>
          </div>
        </div>
        {/* Controles superiores y filtros */}
        <div className="mb-4">
          {/* Controles superiores agrupados y responsivos */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 mb-2 w-full">
            {/* Izquierda: Filtros, resultados y paginación */}
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 w-full md:w-auto">
              <div className="flex items-center gap-2">
                <Filter className="text-blue-500" size={20} />
                <h3 className="font-semibold text-gray-700">Filtros</h3>
                <span className="ml-2 text-xs text-gray-500">{movimientosFiltrados.length} resultado(s)</span>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-500">Mostrar</label>
                <select
                  className="rounded-md border border-blue-200 focus:border-blue-400 focus:ring-blue-300 bg-white px-2 py-1 text-xs outline-none"
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
            {/* Derecha: Botones de exportar y limpiar */}
            <div className="flex flex-col gap-2 w-full md:w-auto md:flex-row md:gap-4 justify-start md:justify-end">
              {/* Fila de exportar */}
              <div className="flex flex-row gap-2 w-full md:w-auto">
                <ExportButton
                  onClick={() => exportarMovimientosAExcel(
                    movimientosFiltrados,
                    nombreArchivoExportacion('Filtrados', 'xlsx')
                  )}
                  icon={
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M16 16v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M7 9h6M7 13h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M20 7v6m0 0l2-2m-2 2l-2-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  }
                  title="Exportar movimientos filtrados a Excel"
                >
                  Exportar Excel
                </ExportButton>
                <ExportButton
                  onClick={() => exportarMovimientosAPDF(
                    movimientosFiltrados,
                    nombreArchivoExportacion('Filtrados', 'pdf')
                  )}
                  icon={
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M16 16v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M7 9h6M7 13h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M20 7v6m0 0l2-2m-2 2l-2-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  }
                  title="Exportar movimientos filtrados a PDF"
                >
                  Exportar PDF
                </ExportButton>
              </div>
              {/* Fila de limpiar y mostrar filtros */}
              <div className="flex flex-row gap-2 w-full md:w-auto">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFiltroProducto("");
                    setFiltroMotivo("");
                    setFiltroCategoria("todas");
                    setFiltroMarca("todas");
                    setFiltroTipo("todos");
                    setFiltroFecha("");
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={16} className="mr-1" /> Limpiar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFiltrosAbiertos((v) => !v)}
                  className="md:hidden"
                >
                  {filtrosAbiertos ? 'Ocultar' : 'Mostrar'} filtros
                </Button>
              </div>
            </div>
          </div>
        </div>
        {/* Filtros colapsables en móvil */}
        <div className={`${isMobile && !filtrosAbiertos ? 'hidden' : ''}`}>
          {/* Filtros avanzados */}
          <div className="mb-4">
            {/* Fila principal de filtros alineados */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2 md:gap-2 w-full mb-4">
              {/* Buscar producto */}
              <div className="flex flex-col relative w-full">
                <label htmlFor="filtroProducto" className="text-sm text-gray-700 mb-1 font-medium">Producto</label>
                <span className="absolute left-3 top-[70%] -translate-y-1/2 text-blue-400 pointer-events-none">
                  <Search size={20} />
                </span>
                <input
                  id="filtroProducto"
                  list="productos-list"
                  placeholder="Buscar producto"
                  value={filtroProducto}
                  onChange={e => setFiltroProducto(e.target.value)}
                  className="pl-10 rounded-md border border-blue-200 focus:border-blue-500 focus:ring-blue-300 bg-white h-11 text-base w-full"
                />
                <datalist id="productos-list">
                  {productosUnicos.map((nombre, i) => <option key={i} value={nombre} />)}
                </datalist>
              </div>
              {/* Buscar motivo */}
              <div className="flex flex-col relative w-full">
                <label htmlFor="filtroMotivo" className="text-sm text-gray-700 mb-1 font-medium">Motivo</label>
                <input
                  id="filtroMotivo"
                  list="motivos-list"
                  placeholder="Buscar motivo"
                  value={filtroMotivo}
                  onChange={e => setFiltroMotivo(e.target.value)}
                  className="rounded-md border border-blue-200 focus:border-blue-500 focus:ring-blue-300 bg-white h-11 text-base w-full"
                />
                <datalist id="motivos-list">
                  {motivosUnicos.map((motivo, i) => <option key={i} value={motivo} />)}
                </datalist>
              </div>
              {/* Filtro por categoría */}
              <div className="flex flex-col w-full">
                <label htmlFor="filtroCategoria" className="text-sm text-gray-700 mb-1 font-medium">Categoría</label>
                <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
                  <SelectTrigger id="filtroCategoria" className="rounded-md border border-blue-200 focus:border-blue-500 focus:ring-blue-300 bg-white h-11 text-base w-full">
                    <SelectValue placeholder="Filtrar por categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas</SelectItem>
                    {categorias.map(cat => (
                      <SelectItem key={cat.id} value={cat.nombre}>{cat.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Filtro por marca/proveedor */}
              <div className="flex flex-col w-full">
                <label htmlFor="filtroMarca" className="text-sm text-gray-700 mb-1 font-medium">Marca/Proveedor</label>
                <Select value={filtroMarca} onValueChange={setFiltroMarca}>
                  <SelectTrigger id="filtroMarca" className="rounded-md border border-blue-200 focus:border-blue-500 focus:ring-blue-300 bg-white h-11 text-base w-full">
                    <SelectValue placeholder="Filtrar por marca" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas</SelectItem>
                    {proveedores.map(prov => (
                      <SelectItem key={prov.id} value={prov.nombre}>{prov.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Filtro por tipo (entrada/salida) */}
              <div className="flex flex-col w-full">
                <label htmlFor="filtroTipo" className="text-sm text-gray-700 mb-1 font-medium">Tipo</label>
                <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                  <SelectTrigger id="filtroTipo" className="rounded-md border border-blue-200 focus:border-blue-500 focus:ring-blue-300 bg-white h-11 text-base w-full">
                    <SelectValue placeholder="Filtrar por tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="entrada">Entrada</SelectItem>
                    <SelectItem value="salida">Salida</SelectItem>
                    <SelectItem value="anulados">Anulados</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {/* Fila de filtro de fecha debajo */}
            <div className="w-full flex flex-col md:flex-row gap-2 mb-4">
              <div className="flex flex-col w-full md:w-1/3">
                <label htmlFor="filtroFecha" className="text-sm text-gray-700 mb-1 font-medium">Fecha exacta</label>
                <div className="relative w-full">
                  <Input
                    id="filtroFecha"
                    type="date"
                    placeholder="dd/mm/yyyy"
                    value={filtroFecha}
                    onChange={(e) => setFiltroFecha(e.target.value)}
                    className="pr-10 rounded-md border border-blue-200 focus:border-blue-500 focus:ring-blue-300 bg-white h-11 text-base w-full"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M3 8h18M8 3v2m8-2v2m-9 4v9a2 2 0 002 2h6a2 2 0 002-2V9" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </span>
                </div>
              </div>
              <div className="flex flex-col w-full md:w-1/3">
                <label className="text-sm text-gray-700 mb-1 font-medium">Rango de fechas</label>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    placeholder="Desde"
                    value={filtroFechaInicio}
                    onChange={e => setFiltroFechaInicio(e.target.value)}
                    className="rounded-md border border-blue-200 focus:border-blue-500 focus:ring-blue-300 bg-white h-11 text-base w-full"
                  />
                  <Input
                    type="date"
                    placeholder="Hasta"
                    value={filtroFechaFin}
                    onChange={e => setFiltroFechaFin(e.target.value)}
                    className="rounded-md border border-blue-200 focus:border-blue-500 focus:ring-blue-300 bg-white h-11 text-base w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Vista de movimientos */}
        {vista === 'tarjetas' ? (
          <>
            {movimientosPaginados.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[180px] w-full text-blue-500 bg-white rounded-xl shadow p-6 my-8">
                <ArrowLeftRight size={40} className="mb-2" />
                <span className="text-lg font-semibold">No hay movimientos para mostrar</span>
                <span className="text-sm text-gray-500 mt-1">
                  {movimientos.length > 0 ? "Intenta ajustar los filtros" : "Registra tu primer movimiento"}
                </span>
              </div>
            ) : (
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6 mb-4">
                {movimientosPaginados.map((mov) => (
                  <div key={mov.id} className="bg-white rounded-xl shadow p-4 flex flex-col gap-2 border border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 font-medium">{formatearFechaCorta(mov.fecha)}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 ${mov.tipo === "entrada" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                        {mov.tipo === "entrada" ? <BadgeCheck size={14}/> : <AlertTriangle size={14}/>} {mov.tipo.charAt(0).toUpperCase() + mov.tipo.slice(1)}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400 font-medium">Producto:</span>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-gray-800 truncate">{productos.find((p) => p.id === mov.productoId)?.nombre || "Desconocido"}</span>
                      <div className="flex gap-2">
                        <TooltipProvider delayDuration={300}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                className="border border-blue-200 text-blue-500 bg-white hover:bg-blue-50 hover:text-blue-600 focus:ring-blue-200 rounded-md"
                                onClick={() => abrirModalDetalles(mov)}
                                aria-label="Ver detalles"
                              >
                                <Eye size={20} />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Ver detalles</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        {mov.anulado && filtroTipo === "anulados" ? (
                          <TooltipProvider delayDuration={300}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="inline-flex items-center justify-center rounded-full bg-gray-200 text-red-500 px-2 py-1 text-xs font-semibold ml-2">
                                  <Ban size={16} />
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>Movimiento anulado</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          <TooltipProvider delayDuration={300}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="border border-red-200 text-red-500 bg-white hover:bg-red-50 hover:text-red-600 focus:ring-red-200 rounded-md ml-2"
                                  onClick={() => abrirModalAnular(mov)}
                                  aria-label="Anular movimiento"
                                >
                                  <Ban size={20} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Anular movimiento</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
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
                ))}
              </div>
            )}
            {/* Números de página scrollable */}
            <div className="flex justify-center items-center gap-2 mt-8 overflow-x-auto flex-nowrap pb-2">
              {(() => {
                const paginas = [];
                if (totalPaginas <= 7) {
                  for (let i = 1; i <= totalPaginas; i++) {
                    paginas.push(i);
                  }
                } else {
                  paginas.push(1);
                  if (paginaActual > 4) paginas.push('...');
                  for (let i = Math.max(2, paginaActual - 2); i <= Math.min(totalPaginas - 1, paginaActual + 2); i++) {
                    if (i === 1 || i === totalPaginas) continue;
                    paginas.push(i);
                  }
                  if (paginaActual < totalPaginas - 3) paginas.push('...');
                  paginas.push(totalPaginas);
                }
                return paginas.map((num, idx) =>
                  num === '...'
                    ? <span key={`ellipsis-${idx}`} className="px-2 text-gray-400">...</span>
                    : <Button
                        key={num}
                        variant={paginaActual === num ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPaginaActual(num as number)}
                        className={paginaActual === num ? 'bg-blue-600 text-white min-w-[40px]' : 'min-w-[40px]'}
                      >{num}</Button>
                );
              })()}
            </div>
            {/* Botones Anterior/Siguiente debajo y centrados */}
            <div className="flex justify-center items-center gap-4 mt-2">
              <Button
                variant="outline"
                size="sm"
                disabled={paginaActual === 1}
                onClick={() => setPaginaActual(paginaActual - 1)}
                className="min-w-[80px]"
              >Anterior</Button>
              <Button
                variant="outline"
                size="sm"
                disabled={paginaActual === totalPaginas}
                onClick={() => setPaginaActual(paginaActual + 1)}
                className="min-w-[80px]"
              >Siguiente</Button>
            </div>
          </>
        ) : (
          <>
            <div className="w-full">
              {movimientosPaginados.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[180px] w-full text-blue-500 bg-white rounded-xl shadow p-6 my-8">
                  <ArrowLeftRight size={40} className="mb-2" />
                  <span className="text-lg font-semibold">No hay movimientos para mostrar</span>
                  <span className="text-sm text-gray-500 mt-1">
                    {movimientos.length > 0 ? "Intenta ajustar los filtros" : "Registra tu primer movimiento"}
                  </span>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl shadow bg-white mt-6">
                  <table className="min-w-full text-sm text-left text-gray-700 bg-white border-separate border-spacing-0">
                    <thead className="bg-gray-200 text-xs uppercase text-gray-500">
                      <tr>
                        <th className="px-4 py-4 border-b border-gray-300">Fecha</th>
                        <th className="px-4 py-4 border-b border-gray-300">Tipo</th>
                        <th className="px-4 py-4 border-b border-gray-300">Producto</th>
                        <th className="px-4 py-4 border-b border-gray-300">Cantidad</th>
                        <th className="px-4 py-4 border-b border-gray-300">Motivo</th>
                        <th className="px-4 py-4 border-b border-gray-300">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {movimientosPaginados.map((mov) => (
                        <tr key={mov.id} className="border-t hover:bg-blue-50/40 transition">
                          <td className="px-4 py-4 border-b border-gray-100">{formatearFechaCorta(mov.fecha)}</td>
                          <td className="px-4 py-4 border-b border-gray-100">
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
                          <td className="px-4 py-4 border-b border-gray-100 flex gap-2">
                            <TooltipProvider delayDuration={300}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="border border-blue-200 text-blue-500 bg-white hover:bg-blue-50 hover:text-blue-600 focus:ring-blue-200 rounded-md"
                                    onClick={() => abrirModalDetalles(mov)}
                                    aria-label="Ver detalles"
                                  >
                                    <Eye size={20} />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Ver detalles</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            {mov.anulado && filtroTipo === "anulados" ? (
                              <TooltipProvider delayDuration={300}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="inline-flex items-center justify-center rounded-full bg-gray-200 text-red-500 px-2 py-1 text-xs font-semibold ml-2">
                                      <Ban size={16} />
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent>Movimiento anulado</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ) : (
                              <TooltipProvider delayDuration={300}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="border border-red-200 text-red-500 bg-white hover:bg-red-50 hover:text-red-600 focus:ring-red-200 rounded-md ml-2"
                                      onClick={() => abrirModalAnular(mov)}
                                      aria-label="Anular movimiento"
                                    >
                                      <Ban size={20} />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Anular movimiento</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            {/* Paginación en desktop */}
            {renderPaginacion({ paginaActual, totalPaginas, setPaginaActual })}
          </>
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
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-700 font-medium">Fecha del movimiento</label>
                <div className="flex gap-2 items-center">
                  <Input
                    type="date"
                    value={fechaMovimiento}
                    onChange={e => setFechaMovimiento(e.target.value)}
                    className="w-40"
                    max={new Date().toISOString().slice(0, 10)}
                  />
                  <label className="flex items-center gap-1 text-sm">
                    <input
                      type="checkbox"
                      checked={usarHora}
                      onChange={e => setUsarHora(e.target.checked)}
                      className="accent-blue-600"
                    />
                    ¿Hora específica?
                  </label>
                  {usarHora && (
                    <Input
                      type="time"
                      value={horaMovimiento}
                      onChange={e => setHoraMovimiento(e.target.value)}
                      className="w-32 ml-2"
                    />
                  )}
                </div>
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

        {/* Modal de anulación */}
        <Dialog open={modalAnular} onOpenChange={setModalAnular}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <Trash2 size={22} /> Anular movimiento
              </DialogTitle>
            </DialogHeader>
            <div className="mb-2 text-gray-700">
              ¿Estás seguro de que deseas anular este movimiento? Esta acción revertirá el stock y no se puede deshacer.<br />
              <span className="font-semibold">Producto:</span> {movimientoAAnular?.producto?.nombre || ""}<br />
              <span className="font-semibold">Cantidad:</span> {movimientoAAnular?.cantidad} ({movimientoAAnular?.tipo})
            </div>
            <div className="mb-2">
              <Label htmlFor="motivoAnulacion">Motivo de anulación</Label>
              <Textarea id="motivoAnulacion" value={motivoAnulacion} onChange={e => setMotivoAnulacion(e.target.value)} rows={2} className="rounded-lg border-blue-200 focus:border-blue-400 focus:ring-blue-300" placeholder="Explica el motivo de la anulación..." />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setModalAnular(false)} disabled={anulando}>Cancelar</Button>
              <Button variant="destructive" onClick={anularMovimiento} disabled={anulando}>
                {anulando ? "Anulando..." : "Anular"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de detalles de movimiento */}
        <Dialog open={modalDetalles} onOpenChange={setModalDetalles}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-blue-600">
                <Eye size={22} /> Detalles del movimiento
              </DialogTitle>
            </DialogHeader>
            {movimientoAAnular ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4 border-b pb-3 mb-2">
                  {(productoDetalle?.imagen || movimientoAAnular.producto?.imagen) ? (
                    <img src={productoDetalle?.imagen || movimientoAAnular.producto?.imagen} alt={productoDetalle?.nombre || movimientoAAnular.producto?.nombre} className="w-16 h-16 object-cover rounded border bg-gray-50" />
                  ) : (
                    <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center border">
                      <Package className="text-gray-400" size={28} />
                    </div>
                  )}
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-lg text-gray-800 truncate">{productoDetalle?.nombre || movimientoAAnular.producto?.nombre}</span>
                    <span className="text-xs text-gray-500">{typeof (productoDetalle?.categoria || movimientoAAnular.producto?.categoria) === 'object' ? (productoDetalle?.categoria as any)?.nombre || (movimientoAAnular.producto?.categoria as any)?.nombre : (productoDetalle?.categoria || movimientoAAnular.producto?.categoria)}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div className="text-gray-500">Tipo de movimiento:</div>
                  <div className="font-medium flex items-center gap-1">
                    {movimientoAAnular.tipo === 'entrada' ? <BadgeCheck size={16} className="text-green-500" /> : <AlertTriangle size={16} className="text-red-500" />} {movimientoAAnular.tipo.charAt(0).toUpperCase() + movimientoAAnular.tipo.slice(1)}
                  </div>
                  <div className="text-gray-500">Cantidad:</div>
                  <div className="font-medium">{movimientoAAnular.cantidad}</div>
                  <div className="text-gray-500">Motivo:</div>
                  <div className="font-medium">{movimientoAAnular.motivo}</div>
                  <div className="text-gray-500">Fecha del movimiento:</div>
                  <div className="font-medium">{formatearFecha(movimientoAAnular.fecha)}</div>
                  <div className="text-gray-500">Proveedor:</div>
                  <div className="font-medium">{typeof (productoDetalle?.proveedor || movimientoAAnular.producto?.proveedor) === 'object' ? (productoDetalle?.proveedor as any)?.nombre || (movimientoAAnular.producto?.proveedor as any)?.nombre : (productoDetalle?.proveedor || movimientoAAnular.producto?.proveedor)}</div>
                  <div className="text-gray-500">Precio unitario:</div>
                  <div className="font-medium">C$ {productoDetalle?.precio || movimientoAAnular.producto?.precio}</div>
                  <div className="text-gray-500">Stock actual:</div>
                  <div className="font-medium">{productoDetalle?.stock || movimientoAAnular.producto?.stock}</div>
                  <div className="text-gray-500">Estado:</div>
                  <div className="font-medium flex items-center gap-1">
                    {movimientoAAnular.anulado ? (
                      <span className="flex items-center gap-1 text-red-500 font-semibold">Anulado <Ban size={16} /></span>
                    ) : (
                      <span className="flex items-center gap-1 text-green-600 font-semibold">Vigente <BadgeCheck size={16} /></span>
                    )}
                  </div>
                  {movimientoAAnular.anulado && (
                    <>
                      <div className="text-gray-500">Motivo de anulación:</div>
                      <div className="font-medium text-red-500">{movimientoAAnular.motivo_anulacion}</div>
                      <div className="text-gray-500">Fecha de anulación:</div>
                      <div className="font-medium text-red-500">{formatearFecha(movimientoAAnular.fecha_anulacion)}</div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-gray-500">No se encontró información del movimiento.</div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
