"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, BadgeCheck, AlertTriangle, Package, PlusCircle, Search, Filter, X, LayoutGrid, Table, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useToast, ToastContainer } from "@/components/ui/toast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { useMediaQuery } from "@/lib/utils";
import { MultiSelect } from "@/components/ui/MultiSelect";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ExcelJS from "exceljs";

interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  categoriaId: number;
  proveedorId: number;
  precio: number;
  stock: number;
  imagen?: string;
  categoria?: { nombre: string };
  proveedor?: { nombre: string };
  destacado: boolean;
}

interface Categoria {
  id: number;
  nombre: string;
}

interface Proveedor {
  id: number;
  nombre: string;
}

// Hook personalizado para debounce
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Hook personalizado para manejo de productos
function useProductos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarProductos = useCallback(async () => {
    try {
      setCargando(true);
      setError(null);
      const res = await fetch("/api/productos");
      if (!res.ok) throw new Error("Error al cargar productos");
      const data = await res.json();
      setProductos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setCargando(false);
    }
  }, []);

  // Cargar productos automáticamente al montar el hook
  useEffect(() => {
    cargarProductos();
  }, [cargarProductos]);

  const agregarProducto = useCallback(async (productoData: Omit<Producto, 'id'>) => {
    try {
      const res = await fetch("/api/productos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productoData),
      });
      if (!res.ok) throw new Error("Error al agregar producto");
      const nuevo = await res.json();
      setProductos(prev => [...prev, nuevo]);
      return { success: true, data: nuevo };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Error desconocido" };
    }
  }, []);

  const actualizarProducto = useCallback(async (id: number, productoData: Partial<Producto>) => {
    try {
      const res = await fetch(`/api/productos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productoData),
      });
      if (!res.ok) throw new Error("Error al actualizar producto");
      const actualizado = await res.json();
      setProductos(prev => prev.map(p => p.id === id ? actualizado : p));
      return { success: true, data: actualizado };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Error desconocido" };
    }
  }, []);

  const eliminarProducto = useCallback(async (id: number) => {
    try {
      const res = await fetch(`/api/productos/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar producto");
      setProductos(prev => prev.filter(p => p.id !== id));
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Error desconocido" };
    }
  }, []);

  return {
    productos,
    cargando,
    error,
    cargarProductos,
    agregarProducto,
    actualizarProducto,
    eliminarProducto,
  };
}

// Hook personalizado para manejo de datos auxiliares
function useDatosAuxiliares() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setCargando(true);
        const [catRes, provRes] = await Promise.all([
          fetch("/api/categorias"),
          fetch("/api/proveedores")
        ]);

        const [catData, provData] = await Promise.all([
          catRes.json(),
          provRes.json()
        ]);

        if (catRes.ok && Array.isArray(catData)) setCategorias(catData);
        if (provRes.ok && Array.isArray(provData)) setProveedores(provData);
      } catch (err) {
        console.error("Error al cargar datos auxiliares:", err);
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, []);

  return { categorias, proveedores, cargando };
}

// Función para generar nombre de archivo exportado
function nombreArchivoExportacion(tipo: 'Seleccionados' | 'Filtrados', extension: 'xlsx' | 'pdf') {
  const fecha = new Date();
  const yyyy = fecha.getFullYear();
  const mm = String(fecha.getMonth() + 1).padStart(2, '0');
  const dd = String(fecha.getDate()).padStart(2, '0');
  return `AlmaSoft_Productos_${yyyy}${mm}${dd}_${tipo}.${extension}`;
}

// Función para exportar productos a Excel
function exportarProductosAExcel(productosExportar: Producto[], nombreArchivo: string) {
  if (!productosExportar.length) return;
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Productos");
  // LOGO: 'Productos' centrado arriba
  worksheet.mergeCells("A1:F1");
  const logoCell = worksheet.getCell("A1");
  logoCell.value = "Productos";
  logoCell.font = { name: "Calibri", bold: true, size: 22, color: { argb: "FF2196F3" } };
  logoCell.alignment = { horizontal: "center", vertical: "middle" };
  // Espacio entre logo y encabezado
  worksheet.addRow([]);
  // Definir columnas
  worksheet.columns = [
    { header: "Nombre", key: "nombre", width: 24 },
    { header: "Descripción", key: "descripcion", width: 40 },
    { header: "Categoría", key: "categoria", width: 18 },
    { header: "Proveedor", key: "proveedor", width: 18 },
    { header: "Precio", key: "precio", width: 10 },
    { header: "Stock", key: "stock", width: 8 },
  ];
  // Agregar filas
  productosExportar.forEach((p) => {
    worksheet.addRow({
      nombre: p.nombre,
      descripcion: p.descripcion,
      categoria: p.categoria?.nombre || "",
      proveedor: p.proveedor?.nombre || "",
      precio: p.precio,
      stock: p.stock,
    });
  });
  // Estilos de encabezado
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
  // Bordes para todas las celdas
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber < headerRowIdx) return; // No bordes en logo ni fila vacía
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
  // Autofiltro
  const colCount = worksheet.getRow(headerRowIdx).cellCount;
  const lastCol = String.fromCharCode(64 + colCount);
  worksheet.autoFilter = {
    from: `A${headerRowIdx}`,
    to: `${lastCol}${headerRowIdx}`,
  };
  // Pie de página
  const fecha = new Date().toLocaleDateString();
  const pieRow = worksheet.addRow([]);
  pieRow.getCell(1).value = `Exportado desde AlmaSoft - Fecha: ${fecha}`;
  worksheet.mergeCells(`A${pieRow.number}:F${pieRow.number}`);
  pieRow.getCell(1).alignment = { horizontal: "center" };
  pieRow.getCell(1).font = { color: { argb: "FF888888" }, italic: true, size: 11 };
  // Descargar archivo
  workbook.xlsx.writeBuffer().then((buffer) => {
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    saveAs(blob, nombreArchivo);
  });
}

// Función para exportar productos a PDF
function exportarProductosAPDF(productosExportar: Producto[], nombreArchivo: string) {
  if (!productosExportar.length) return;
  const doc = new jsPDF();
  // Título grande y azul
  doc.setFontSize(22);
  doc.setTextColor(33, 150, 243);
  doc.setFont('helvetica', 'bold');
  doc.text('Productos', doc.internal.pageSize.getWidth() / 2, 22, { align: 'center' });
  // Línea divisoria
  doc.setDrawColor(33, 150, 243);
  doc.setLineWidth(1);
  doc.line(20, 28, doc.internal.pageSize.getWidth() - 20, 28);
  // Tabla
  const columns = [
    { header: "Nombre", dataKey: "nombre" },
    { header: "Descripción", dataKey: "descripcion" },
    { header: "Categoría", dataKey: "categoria" },
    { header: "Proveedor", dataKey: "proveedor" },
    { header: "Precio", dataKey: "precio" },
    { header: "Stock", dataKey: "stock" },
  ] as const;
  const data = productosExportar.map((p) => ({
    nombre: p.nombre,
    descripcion: p.descripcion,
    categoria: p.categoria?.nombre || "",
    proveedor: p.proveedor?.nombre || "",
    precio: p.precio,
    stock: p.stock,
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
  // Pie de página
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

export default function ProductosPage() {
  const router = useRouter();
  const { productos, cargando, error, agregarProducto, actualizarProducto, eliminarProducto } = useProductos();
  const { categorias, proveedores } = useDatosAuxiliares();
  const { toasts, success, error: showError, removeToast } = useToast();

  // Estados del formulario
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [productoActual, setProductoActual] = useState<Producto | null>(null);
  const [imagenPreview, setImagenPreview] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  // Estados de filtros
  const [busqueda, setBusqueda] = useState("");
  const [proveedorFiltro, setProveedorFiltro] = useState<string[]>([]);
  const [categoriaFiltro, setCategoriaFiltro] = useState<string[]>([]);
  const [stockFiltro, setStockFiltro] = useState<'todos' | 'agotado' | 'bajo' | 'ok'>('todos');
  const [nombreExacto, setNombreExacto] = useState(false);
  const [orden, setOrden] = useState<'nombre' | 'precio' | 'stock'>('nombre');
  const [asc, setAsc] = useState(true);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(!isMobile);
  const [precioMin, setPrecioMin] = useState("");
  const [precioMax, setPrecioMax] = useState("");

  // Estados de modales
  const [modalCategoria, setModalCategoria] = useState(false);
  const [nuevaCategoria, setNuevaCategoria] = useState("");
  const [errorCategoria, setErrorCategoria] = useState<string | null>(null);
  const [categoriasLocales, setCategoriasLocales] = useState<Categoria[]>([]);

  // Estado para el modal de confirmación de eliminación
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [productoAEliminar, setProductoAEliminar] = useState<Producto | null>(null);
  const [eliminando, setEliminando] = useState(false);

  // Debounce para la búsqueda
  const busquedaDebounced = useDebounce(busqueda, 300);

  // Estado para el tipo de vista
  const [vista, setVista] = useState<'tabla' | 'tarjetas'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('vistaProductos') as 'tabla' | 'tarjetas') || 'tabla';
    }
    return 'tabla';
  });

  // Guardar preferencia en localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('vistaProductos', vista);
    }
  }, [vista]);

  // Verificar autenticación
  useEffect(() => {
    const user = localStorage.getItem("usuario");
    if (!user) {
      router.replace("/login");
    }
  }, [router]);

  // Sincronizar categorías locales con las del hook
  useEffect(() => {
    setCategoriasLocales(categorias);
  }, [categorias]);

  // Estado para filtro de destacados
  const [soloDestacados, setSoloDestacados] = useState(false);

  // Estado para paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [productosPorPagina, setProductosPorPagina] = useState(12);
  const opcionesPorPagina = [8, 12, 16, 24, 32];

  // Estado para selección masiva
  const [seleccionados, setSeleccionados] = useState<number[]>([]);
  const productosPaginados = productos.slice((paginaActual - 1) * productosPorPagina, paginaActual * productosPorPagina);
  const todosSeleccionados = productosPaginados.length > 0 && productosPaginados.every((p: Producto) => seleccionados.includes(p.id));
  const toggleSeleccion = (id: number) => {
    setSeleccionados(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };
  const toggleSeleccionTodos = () => {
    if (todosSeleccionados) {
      setSeleccionados(prev => prev.filter(id => !productosPaginados.some((p: Producto) => p.id === id)));
    } else {
      setSeleccionados(prev => [...prev, ...productosPaginados.filter((p: Producto) => !prev.includes(p.id)).map((p: Producto) => p.id)]);
    }
  };
  const limpiarSeleccion = () => setSeleccionados([]);
  // Acciones masivas
  const eliminarSeleccionados = async () => {
    if (seleccionados.length === 0) return;
    if (!window.confirm(`¿Seguro que deseas eliminar ${seleccionados.length} producto(s)? Esta acción no se puede deshacer.`)) return;
    for (const id of seleccionados) {
      await eliminarProducto(id);
    }
    limpiarSeleccion();
    success('Productos eliminados', 'Los productos seleccionados han sido eliminados.');
  };
  const destacarSeleccionados = async (destacar: boolean) => {
    for (const id of seleccionados) {
      const prod = productos.find(p => p.id === id);
      if (prod && prod.destacado !== destacar) {
        await actualizarProducto(id, { destacado: destacar });
      }
    }
    limpiarSeleccion();
    success(destacar ? 'Productos destacados' : 'Destacado removido', destacar ? 'Los productos seleccionados ahora son destacados.' : 'Los productos seleccionados ya no son destacados.');
  };

  // Estados para selección masiva de categoría y proveedor
  const [categoriaMasiva, setCategoriaMasiva] = useState<string>("");
  const [proveedorMasiva, setProveedorMasiva] = useState<string>("");
  const aplicarCategoriaProveedor = async () => {
    if (!categoriaMasiva && !proveedorMasiva) return;
    for (const id of seleccionados) {
      const data: any = {};
      if (categoriaMasiva) data.categoria = parseInt(categoriaMasiva);
      if (proveedorMasiva) data.proveedor = parseInt(proveedorMasiva);
      await actualizarProducto(id, data);
    }
    limpiarSeleccion();
    setCategoriaMasiva("");
    setProveedorMasiva("");
    success('Actualización masiva', 'Los productos seleccionados han sido actualizados.');
  };

  // Memoización de productos filtrados y ordenados
  const productosFiltrados = useMemo(() => {
    let filtrados = productos.filter((prod) => {
      // Filtro por nombre
      if (busqueda) {
        if (nombreExacto) {
          if (prod.nombre.toLowerCase() !== busqueda.toLowerCase()) return false;
        } else {
          if (!prod.nombre.toLowerCase().includes(busqueda.toLowerCase())) return false;
        }
      }
      // Filtro por categoría (multi)
      if (categoriaFiltro.length && !categoriaFiltro.includes(String(prod.categoriaId))) return false;
      // Filtro por proveedor (multi)
      if (proveedorFiltro.length && !proveedorFiltro.includes(String(prod.proveedorId))) return false;
      // Filtro por stock
      if (stockFiltro === 'agotado' && prod.stock > 0) return false;
      if (stockFiltro === 'bajo' && (prod.stock > 10 || prod.stock <= 0)) return false;
      if (stockFiltro === 'ok' && prod.stock <= 10) return false;
      // Filtro por precio
      if (precioMin && prod.precio < parseFloat(precioMin)) return false;
      if (precioMax && prod.precio > parseFloat(precioMax)) return false;
      // Filtro por destacado
      if (soloDestacados && !prod.destacado) return false;
      return true;
    });
    // Orden
    filtrados = filtrados.sort((a, b) => {
      let valA = a[orden];
      let valB = b[orden];
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      if (valA < valB) return asc ? -1 : 1;
      if (valA > valB) return asc ? 1 : -1;
      return 0;
    });
    return filtrados;
  }, [productos, busqueda, nombreExacto, categoriaFiltro, proveedorFiltro, stockFiltro, precioMin, precioMax, orden, asc, soloDestacados]);

  // Calcular productos a mostrar según paginación
  const totalPaginas = Math.max(1, Math.ceil(productosFiltrados.length / productosPorPagina));
  const productosPaginadosFiltrados = productosFiltrados.slice((paginaActual - 1) * productosPorPagina, paginaActual * productosPorPagina);

  // Funciones de manejo
  const abrirModalAgregar = useCallback(() => {
    setProductoActual(null);
    setImagenPreview(null);
    setModoEdicion(false);
    setModalAbierto(true);
  }, []);

  const abrirModalEditar = useCallback((producto: Producto) => {
    setProductoActual(producto);
    setImagenPreview(producto.imagen || null);
    setModoEdicion(true);
    setModalAbierto(true);
  }, []);

  const handleImagenChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagenPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  }, []);

  const guardarProducto = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setGuardando(true);

    try {
      const formData = new FormData(e.currentTarget);
      const productoData = {
        nombre: formData.get("nombre")?.toString().trim() || "",
        descripcion: formData.get("descripcion")?.toString().trim() || "",
        categoriaId: parseInt(formData.get("categoria")?.toString() || "0"),
        proveedorId: parseInt(formData.get("proveedor")?.toString() || "0"),
        precio: parseFloat(formData.get("precio")?.toString() || "0"),
        stock: parseInt(formData.get("stock")?.toString() || "0"),
        imagen: imagenPreview || "",
        destacado: productoActual?.destacado || false,
      };

      // Validación
      if (!productoData.nombre || !productoData.descripcion || !productoData.categoriaId || 
          !productoData.proveedorId || productoData.precio <= 0 || productoData.stock < 0) {
        showError("Error de validación", "Por favor completa todos los campos correctamente.");
        return;
      }

      const resultado = modoEdicion 
        ? await actualizarProducto(productoActual!.id, productoData)
        : await agregarProducto(productoData);

      if (resultado.success) {
        setModalAbierto(false);
        success(
          modoEdicion ? "Producto actualizado" : "Producto agregado",
          modoEdicion 
            ? `"${productoData.nombre}" ha sido actualizado exitosamente`
            : `"${productoData.nombre}" ha sido agregado exitosamente`
        );
      } else {
        showError("Error al guardar", resultado.error || "Error al guardar producto");
      }
    } catch (error) {
      showError("Error inesperado", "Ocurrió un error inesperado al guardar el producto");
    } finally {
      setGuardando(false);
    }
  }, [modoEdicion, productoActual, imagenPreview, agregarProducto, actualizarProducto, success, showError]);

  // Nueva función para abrir el modal de confirmación
  const pedirConfirmacionEliminar = (producto: Producto) => {
    setProductoAEliminar(producto);
    setConfirmOpen(true);
  };

  // Nueva función para confirmar eliminación
  const confirmarEliminarProducto = async () => {
    if (!productoAEliminar) return;
    setEliminando(true);
    const resultado = await eliminarProducto(productoAEliminar.id);
    setEliminando(false);
    setConfirmOpen(false);
    setProductoAEliminar(null);
    if (resultado.success) {
      success("Producto eliminado", `"${productoAEliminar.nombre}" ha sido eliminado exitosamente`);
    } else {
      showError("Error al eliminar", resultado.error || "Error al eliminar producto");
    }
  };

  const agregarCategoria = useCallback(async () => {
    const nueva = nuevaCategoria.trim();
    if (!nueva) return;

    try {
      setErrorCategoria(null);
      const res = await fetch("/api/categorias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: nueva }),
      });

      if (res.ok) {
        const nuevaCat = await res.json();
        setCategoriasLocales((prev: Categoria[]) => [...prev, nuevaCat]);
        setNuevaCategoria("");
        setModalCategoria(false);
        success("Categoría agregada", `"${nueva}" ha sido agregada exitosamente`);
      } else {
        const data = await res.json();
        setErrorCategoria(data.error || "No se pudo agregar la categoría.");
        showError("Error al agregar categoría", data.error || "No se pudo agregar la categoría.");
      }
    } catch (error) {
      setErrorCategoria("Ocurrió un error inesperado al agregar la categoría.");
      showError("Error inesperado", "Ocurrió un error inesperado al agregar la categoría.");
    }
  }, [nuevaCategoria, success, showError]);

  const limpiarFiltros = useCallback(() => {
    setBusqueda("");
    setProveedorFiltro([]);
    setCategoriaFiltro([]);
    setStockFiltro('todos');
    setNombreExacto(false);
    setOrden('nombre');
    setAsc(true);
    setPrecioMin("");
    setPrecioMax("");
    setSoloDestacados(false);
  }, []);

  // En la función ProductosPage, agrega función para alternar destacado
  const toggleDestacado = async (producto: Producto) => {
    const resultado = await actualizarProducto(producto.id, {
      destacado: !producto.destacado,
    });
    if (resultado.success) {
      success(
        !producto.destacado ? "Producto destacado" : "Destacado removido",
        !producto.destacado
          ? `"${producto.nombre}" ahora es destacado.`
          : `"${producto.nombre}" ya no es destacado.`
      );
    } else {
      showError("Error", resultado.error || "No se pudo actualizar el destacado");
    }
  };

  // Al cambiar filtros, resetear a la primera página
  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda, categoriaFiltro, proveedorFiltro, stockFiltro, nombreExacto, precioMin, precioMax, orden, asc, soloDestacados, productosPorPagina]);

  // Spinner de carga
  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin h-20 w-20 text-blue-500" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          <span className="text-blue-600 font-medium">Cargando productos...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar productos</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700">
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Toast Container */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Package className="text-blue-500" size={32} /> 
            Productos
            <span className="text-sm font-normal text-gray-500 ml-2">
              ({productosFiltrados.length} de {productos.length})
            </span>
          </h2>
        </div>
        {/* Switch de vista */}
        <div className="flex gap-2 items-center">
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

      {/* Filtros avanzados */}
      <div className="mb-4">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <Filter className="text-blue-500" size={20} />
          <h3 className="font-semibold text-gray-700">Filtros</h3>
          <span className="ml-2 text-xs text-gray-500">{productosFiltrados.length} resultado(s)</span>
          {/* Filtro solo destacados */}
          <button
            type="button"
            onClick={() => setSoloDestacados((v) => !v)}
            className={`ml-2 p-2 rounded-full border transition ${soloDestacados ? 'bg-yellow-100 border-yellow-300' : 'bg-white border-gray-200 hover:bg-gray-100'}`}
            title="Mostrar solo destacados"
          >
            <Star
              size={20}
              className={soloDestacados ? 'text-yellow-400 fill-yellow-300' : 'text-gray-300'}
              strokeWidth={2}
              fill={soloDestacados ? '#fde047' : 'none'}
            />
          </button>
          {/* Selector de productos por página */}
          <label className="ml-4 text-xs text-gray-500">Mostrar</label>
          <select
            className="rounded-md border border-blue-200 focus:border-blue-400 focus:ring-blue-300 bg-white h-8 text-sm px-2"
            value={productosPorPagina}
            onChange={e => {
              setProductosPorPagina(Number(e.target.value));
              setPaginaActual(1);
            }}
          >
            {opcionesPorPagina.map(op => (
              <option key={op} value={op}>{op}</option>
            ))}
          </select>
          <span className="text-xs text-gray-500">por página</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={limpiarFiltros}
            className="ml-auto text-gray-500 hover:text-gray-700"
          >
            <X size={16} /> Limpiar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFiltrosAbiertos((v) => !v)}
            className="md:hidden"
          >
            {filtrosAbiertos ? 'Ocultar' : 'Mostrar'} filtros
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportarProductosAExcel(
              seleccionados.length > 0 ? productos.filter(p => seleccionados.includes(p.id)) : productosFiltrados,
              nombreArchivoExportacion(seleccionados.length > 0 ? 'Seleccionados' : 'Filtrados', 'xlsx')
            )}
            className="ml-2 flex items-center gap-1"
            title={seleccionados.length > 0 ? "Exportar seleccionados a Excel" : "Exportar productos filtrados a Excel"}
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M16 16v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M7 9h6M7 13h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M20 7v6m0 0l2-2m-2 2l-2-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Exportar Excel
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportarProductosAPDF(
              seleccionados.length > 0 ? productos.filter(p => seleccionados.includes(p.id)) : productosFiltrados,
              nombreArchivoExportacion(seleccionados.length > 0 ? 'Seleccionados' : 'Filtrados', 'pdf')
            )}
            className="ml-2 flex items-center gap-1"
            title={seleccionados.length > 0 ? "Exportar seleccionados a PDF" : "Exportar productos filtrados a PDF"}
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M16 16v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M7 9h6M7 13h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M20 7v6m0 0l2-2m-2 2l-2-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Exportar PDF
          </Button>
        </div>
        {/* Filtros colapsables en móvil */}
        <div className={`${isMobile && !filtrosAbiertos ? 'hidden' : ''}`}>
          {/* Fila principal de filtros alineados */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Buscar productos */}
            <div className="w-full flex flex-col relative">
              <label className="text-sm text-gray-700 mb-1 font-medium opacity-0 select-none">.</label>
              {/* Icono de búsqueda */}
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 pointer-events-none">
                <Search size={20} />
              </span>
              <Input
                placeholder="Buscar productos..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-10 rounded-md border border-blue-200 focus:border-blue-400 focus:ring-blue-300 bg-white h-11 text-base w-full"
              />
              <div className="flex items-center gap-2 mt-1">
                <input type="checkbox" id="nombreExacto" checked={nombreExacto} onChange={() => setNombreExacto(!nombreExacto)} />
                <label htmlFor="nombreExacto" className="text-xs text-gray-500">Coincidencia exacta</label>
              </div>
            </div>
            {/* Categoría */}
            <div className="w-full flex flex-col">
              <label className="text-sm text-gray-700 mb-1 font-medium">Categoría</label>
              <MultiSelect
                options={categoriasLocales.map(cat => ({ label: cat.nombre, value: String(cat.id) }))}
                value={categoriaFiltro}
                onChange={setCategoriaFiltro}
                placeholder="Seleccionar categoría..."
                className="mb-2 w-full rounded-md border border-blue-200 focus:border-blue-400 focus:ring-blue-300 bg-white h-11 text-base"
              />
            </div>
            {/* Proveedor */}
            <div className="w-full flex flex-col">
              <label className="text-sm text-gray-700 mb-1 font-medium">Proveedor</label>
              <MultiSelect
                options={proveedores.map(prov => ({ label: prov.nombre, value: String(prov.id) }))}
                value={proveedorFiltro}
                onChange={setProveedorFiltro}
                placeholder="Seleccionar proveedor..."
                className="mb-2 w-full rounded-md border border-blue-200 focus:border-blue-400 focus:ring-blue-300 bg-white h-11 text-base"
              />
            </div>
          </div>
          {/* Resto de filtros */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Filtro por stock */}
            <div className="w-full">
              <label className="text-xs text-gray-500">Stock</label>
              <div className="flex gap-2 flex-wrap mt-1">
                <label className="flex items-center gap-1 text-xs">
                  <input type="radio" name="stockFiltro" value="todos" checked={stockFiltro === 'todos'} onChange={() => setStockFiltro('todos')} /> Todos
                </label>
                <label className="flex items-center gap-1 text-xs">
                  <input type="radio" name="stockFiltro" value="agotado" checked={stockFiltro === 'agotado'} onChange={() => setStockFiltro('agotado')} /> Agotados
                </label>
                <label className="flex items-center gap-1 text-xs">
                  <input type="radio" name="stockFiltro" value="bajo" checked={stockFiltro === 'bajo'} onChange={() => setStockFiltro('bajo')} /> Bajo (&le;10)
                </label>
                <label className="flex items-center gap-1 text-xs">
                  <input type="radio" name="stockFiltro" value="ok" checked={stockFiltro === 'ok'} onChange={() => setStockFiltro('ok')} /> OK (&gt;10)
                </label>
              </div>
            </div>
            {/* Filtro por precio */}
            <div className="w-full">
              <label className="text-xs text-gray-500">Precio</label>
              <div className="flex gap-2 mt-1">
                <Input
                  type="number"
                  placeholder="Mínimo"
                  value={precioMin}
                  onChange={(e) => setPrecioMin(e.target.value)}
                  className="rounded-md border border-blue-200 focus:border-blue-400 focus:ring-blue-300 bg-white h-11 text-base w-full"
                />
                <Input
                  type="number"
                  placeholder="Máximo"
                  value={precioMax}
                  onChange={(e) => setPrecioMax(e.target.value)}
                  className="rounded-md border border-blue-200 focus:border-blue-400 focus:ring-blue-300 bg-white h-11 text-base w-full"
                />
              </div>
            </div>
            {/* Filtro de orden */}
            <div className="w-full">
              <label className="text-xs text-gray-500">Ordenar por</label>
              <div className="flex gap-2 mt-1 items-center">
                <select
                  className="rounded-md border border-blue-200 focus:border-blue-400 focus:ring-blue-300 bg-white h-11 text-base w-full font-['Adam',_sans-serif] text-blue-900 pr-8 pl-4"
                  value={orden}
                  onChange={e => setOrden(e.target.value as any)}
                >
                  <option value="nombre">Nombre</option>
                  <option value="precio">Precio</option>
                  <option value="stock">Stock</option>
                </select>
                <Button type="button" variant="outline" size="icon" onClick={() => setAsc(a => !a)} title={asc ? 'Ascendente' : 'Descendente'}>
                  {asc ? <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M7 14l5-5 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> : <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de tarjetas o tabla según la vista elegida */}
      {vista === 'tarjetas' ? (
        <TooltipProvider delayDuration={300}>
          <div className="w-full">
            <AnimatePresence>
              {productosFiltrados.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center min-h-[200px] text-blue-500"
                >
                  <Package size={48} className="mb-2" />
                  <span className="text-lg font-semibold">No hay productos para mostrar</span>
                  <span className="text-sm text-gray-500 mt-1">
                    {productos.length > 0 ? "Intenta ajustar los filtros" : "Agrega tu primer producto"}
                  </span>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {productosPaginadosFiltrados.map((prod) => (
                    <motion.div
                      key={prod.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      className="relative bg-white rounded-2xl shadow-lg p-6 flex flex-col h-full border border-blue-50 hover:shadow-xl transition group"
                    >
                      {/* Contenedor de estrella y checkbox, siempre visible, alineados arriba a la izquierda */}
                      <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleDestacado(prod)}
                          className="p-1 rounded-full bg-white shadow-md hover:bg-yellow-100 transition"
                          title={prod.destacado ? "Quitar destacado" : "Destacar"}
                        >
                          <Star
                            size={22}
                            className={prod.destacado ? "text-yellow-400 fill-yellow-300" : "text-gray-300"}
                            strokeWidth={2}
                            fill={prod.destacado ? "#fde047" : "none"}
                          />
                        </button>
                        <input type="checkbox" checked={seleccionados.includes(prod.id)} onChange={() => toggleSeleccion(prod.id)} className="w-5 h-5 rounded border-gray-300 focus:ring-blue-400" />
                      </div>
                      {/* Etiqueta de stock pegada */}
                      <div className="absolute top-3 -right-4 z-10 shadow-md rounded-l-full px-3 py-1 text-xs font-semibold flex items-center gap-1
                        bg-green-100 text-green-700"
                        style={{ minWidth: '90px' }}
                      >
                        <BadgeCheck size={12} /> Stock OK
                      </div>
                      {/* Si stock bajo o agotado, cambia color y texto */}
                      {prod.stock <= 10 && prod.stock > 0 && (
                        <div className="absolute top-3 -right-4 z-10 shadow-md rounded-l-full px-3 py-1 text-xs font-semibold flex items-center gap-1
                          bg-yellow-100 text-yellow-700"
                          style={{ minWidth: '90px' }}
                        >
                          <AlertTriangle size={12} /> Stock bajo
                        </div>
                      )}
                      {prod.stock <= 0 && (
                        <div className="absolute top-3 -right-4 z-10 shadow-md rounded-l-full px-3 py-1 text-xs font-semibold flex items-center gap-1
                          bg-red-100 text-red-600"
                          style={{ minWidth: '90px' }}
                        >
                          <AlertTriangle size={12} /> Agotado
                        </div>
                      )}
                      <div className="flex items-start gap-3 mb-2 mt-8">
                        {prod.imagen ? (
                          <img
                            src={prod.imagen}
                            alt={prod.nombre}
                            className="w-16 h-16 aspect-square object-cover rounded-md border"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-16 h-16 aspect-square bg-gray-200 rounded-md flex items-center justify-center">
                            <Package className="text-gray-400" size={28} />
                          </div>
                        )}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="font-bold text-blue-900 text-lg line-clamp-2 max-w-[200px] cursor-help">
                              {prod.nombre}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>{prod.nombre}</TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="truncate line-clamp-1 max-w-[140px] cursor-help">
                              {prod.categoria?.nombre || "Sin categoría"}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>{prod.categoria?.nombre || "Sin categoría"}</TooltipContent>
                        </Tooltip>
                        <span className="mx-[1px] text-gray-400">·</span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="truncate line-clamp-1 max-w-[140px] cursor-help">
                              {prod.proveedor?.nombre || "Sin proveedor"}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>{prod.proveedor?.nombre || "Sin proveedor"}</TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="text-gray-700 text-sm mb-4 min-h-[40px]">
                        {prod.descripcion}
                      </div>
                      <div className="flex flex-col flex-1 justify-end">
                        <span className="text-blue-700 font-bold text-xl mb-2">C$ {prod.precio.toFixed(2)}</span>
                        <div className="flex items-center justify-between mt-auto">
                          <span className="text-xs text-gray-500">Stock: {prod.stock}</span>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => abrirModalEditar(prod)}
                              className="hover:bg-blue-100 p-2"
                              title="Editar"
                            >
                              <Pencil size={15} />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="hover:bg-red-100 text-red-500 p-2"
                              onClick={() => pedirConfirmacionEliminar(prod)}
                              title="Eliminar"
                            >
                              <Trash2 size={15} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </div>
        </TooltipProvider>
      ) : (
        <div className="w-full overflow-x-auto rounded-xl shadow">
          <table className="min-w-full text-sm text-left text-gray-700 bg-white">
            <thead className="bg-gray-100 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-4 w-8 text-center">
                  <input type="checkbox" checked={todosSeleccionados} onChange={toggleSeleccionTodos} />
                </th>
                <th className="px-6 py-4">Imagen</th>
                <th className="px-6 py-4">Nombre</th>
                <th className="px-6 py-4">Categoría</th>
                <th className="px-6 py-4">Proveedor</th>
                <th className="px-6 py-4">Precio</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-blue-500">
                    <Package size={32} className="mx-auto mb-2" />
                    <div>No hay productos para mostrar</div>
                    <div className="text-sm text-gray-500 mt-1">
                      {productos.length > 0 ? "Intenta ajustar los filtros" : "Agrega tu primer producto"}
                    </div>
                  </td>
                </tr>
              ) : (
                productosPaginadosFiltrados.map((prod) => (
                  <tr key={prod.id} className="border-t hover:bg-blue-50/40 transition">
                    <td className="px-4 py-4 text-center">
                      <input type="checkbox" checked={seleccionados.includes(prod.id)} onChange={() => toggleSeleccion(prod.id)} />
                    </td>
                    <td className="px-6 py-4">
                      {prod.imagen ? (
                        <img
                          src={prod.imagen}
                          alt={prod.nombre}
                          className="w-16 h-16 aspect-square object-cover rounded-md border"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-16 h-16 aspect-square bg-gray-200 rounded-md flex items-center justify-center">
                          <Package className="text-gray-400" size={28} />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium flex items-center gap-2 h-20">
                      <button
                        type="button"
                        onClick={() => toggleDestacado(prod)}
                        className="p-1 rounded-full hover:bg-yellow-100 transition"
                        title={prod.destacado ? "Quitar destacado" : "Destacar"}
                      >
                        <Star
                          size={18}
                          className={prod.destacado ? "text-yellow-400 fill-yellow-300" : "text-gray-300"}
                          strokeWidth={2}
                          fill={prod.destacado ? "#fde047" : "none"}
                        />
                      </button>
                      {prod.nombre}
                    </td>
                    <td className="px-6 py-4">{prod.categoria?.nombre || "Sin categoría"}</td>
                    <td className="px-6 py-4">{prod.proveedor?.nombre || "Sin proveedor"}</td>
                    <td className="px-6 py-4">C${prod.precio.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      {prod.stock <= 0 ? (
                        <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-xs font-semibold flex items-center gap-1">
                          <AlertTriangle size={14} /> Agotado
                        </span>
                      ) : prod.stock <= 10 ? (
                        <span className="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 text-xs font-semibold flex items-center gap-1">
                          <AlertTriangle size={14} /> Stock bajo
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold flex items-center gap-1">
                          <BadgeCheck size={14} /> Stock OK
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => abrirModalEditar(prod)}
                          className="hover:bg-blue-100"
                          title="Editar"
                        >
                          <Pencil size={16} />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="hover:bg-red-100 text-red-500"
                          onClick={() => pedirConfirmacionEliminar(prod)}
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

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

      {/* Modal de producto */}
      <Dialog open={modalAbierto} onOpenChange={setModalAbierto}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {modoEdicion ? "Editar Producto" : "Agregar Producto"}
            </DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={guardarProducto}>
            <div>
              <Label htmlFor="nombre">Nombre *</Label>
              <Input
                id="nombre"
                name="nombre"
                defaultValue={productoActual?.nombre}
                required
                className="rounded-lg border-blue-200 focus:border-blue-400 focus:ring-blue-300"
                placeholder="Nombre del producto"
              />
            </div>

            <div>
              <Label htmlFor="descripcion">Descripción *</Label>
              <Textarea
                id="descripcion"
                name="descripcion"
                defaultValue={productoActual?.descripcion}
                required
                className="rounded-lg border-blue-200 focus:border-blue-400 focus:ring-blue-300"
                placeholder="Descripción del producto"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="categoria">Categoría *</Label>
                <div className="flex items-center gap-2">
                  <Select
                    name="categoria"
                    defaultValue={productoActual?.categoriaId?.toString() || ""}
                  >
                    <SelectTrigger className="flex-1 rounded-lg border-blue-200 focus:border-blue-400 focus:ring-blue-300">
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoriasLocales.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>
                          {cat.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setModalCategoria(true)}
                    title="Agregar categoría"
                  >
                    <Plus size={18} />
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="proveedor">Proveedor *</Label>
                <Select
                  name="proveedor"
                  defaultValue={productoActual?.proveedorId?.toString() || ""}
                >
                  <SelectTrigger className="rounded-lg border-blue-200 focus:border-blue-400 focus:ring-blue-300">
                    <SelectValue placeholder="Seleccionar proveedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {proveedores.map((prov) => (
                      <SelectItem key={prov.id} value={prov.id.toString()}>
                        {prov.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="precio">Precio (C$) *</Label>
                <Input
                  id="precio"
                  name="precio"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={productoActual?.precio}
                  required
                  className="rounded-lg border-blue-200 focus:border-blue-400 focus:ring-blue-300"
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="stock">Stock *</Label>
                <Input
                  id="stock"
                  name="stock"
                  type="number"
                  min="0"
                  defaultValue={productoActual?.stock}
                  required
                  className="rounded-lg border-blue-200 focus:border-blue-400 focus:ring-blue-300"
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="imagen">Imagen</Label>
              <Input
                id="imagen"
                name="imagen"
                type="file"
                accept="image/*"
                onChange={handleImagenChange}
                className="rounded-lg border-blue-200 focus:border-blue-400 focus:ring-blue-300"
              />
              {imagenPreview && (
                <img
                  src={imagenPreview}
                  alt="Preview"
                  className="w-24 h-24 object-cover rounded-md mt-2 border"
                />
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md"
              disabled={guardando}
            >
              {guardando ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Guardando...
                </div>
              ) : (
                modoEdicion ? "Guardar cambios" : "Agregar producto"
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal para agregar categoría */}
      <Dialog open={modalCategoria} onOpenChange={setModalCategoria}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Agregar nueva categoría</DialogTitle>
          </DialogHeader>
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              agregarCategoria();
            }}
          >
            <Input
              placeholder="Nombre de la categoría"
              value={nuevaCategoria}
              onChange={(e) => setNuevaCategoria(e.target.value)}
              className="rounded-lg border-blue-200 focus:border-blue-400 focus:ring-blue-300"
            />
            {errorCategoria && (
              <span className="text-red-500 text-sm">{errorCategoria}</span>
            )}
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
              Agregar
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de confirmación de eliminación */}
      <ConfirmDialog
        open={confirmOpen}
        title="¿Eliminar producto?"
        message={productoAEliminar ? `¿Estás seguro de eliminar "${productoAEliminar.nombre}"? Esta acción no se puede deshacer.` : ""}
        confirmText="Eliminar"
        cancelText="Cancelar"
        loading={eliminando}
        onConfirm={confirmarEliminarProducto}
        onCancel={() => { setConfirmOpen(false); setProductoAEliminar(null); }}
      />

      {/* Panel de acciones masivas fijo arriba */}
      {seleccionados.length > 0 && (
        <div className="fixed top-0 left-0 w-full z-40 bg-white border-b shadow flex flex-wrap items-center gap-4 px-6 py-3 animate-fade-in pt-14 md:pt-0">
          <span className="font-semibold text-blue-700">{seleccionados.length} seleccionado(s)</span>
          <Button variant="destructive" size="sm" onClick={eliminarSeleccionados}>
            <Trash2 size={16} /> Eliminar
          </Button>
          <Button variant="outline" size="sm" onClick={() => destacarSeleccionados(true)}>
            <Star size={16} className="text-yellow-400" fill="#fde047" /> Destacar
          </Button>
          <Button variant="outline" size="sm" onClick={() => destacarSeleccionados(false)}>
            <Star size={16} className="text-gray-300" /> Quitar destacado
          </Button>
          {/* Select de categoría masiva */}
          <select
            className="rounded-md border border-blue-200 focus:border-blue-400 focus:ring-blue-300 bg-white h-9 text-sm px-2"
            value={categoriaMasiva}
            onChange={e => setCategoriaMasiva(e.target.value)}
          >
            <option value="">Cambiar categoría</option>
            {categoriasLocales.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.nombre}</option>
            ))}
          </select>
          {/* Select de proveedor masivo */}
          <select
            className="rounded-md border border-blue-200 focus:border-blue-400 focus:ring-blue-300 bg-white h-9 text-sm px-2"
            value={proveedorMasiva}
            onChange={e => setProveedorMasiva(e.target.value)}
          >
            <option value="">Cambiar proveedor</option>
            {proveedores.map(prov => (
              <option key={prov.id} value={prov.id}>{prov.nombre}</option>
            ))}
          </select>
          <Button variant="default" size="sm" onClick={aplicarCategoriaProveedor} disabled={!categoriaMasiva && !proveedorMasiva}>
            Aplicar
          </Button>
          <Button variant="ghost" size="sm" onClick={limpiarSeleccion}>Cancelar</Button>
        </div>
      )}
    </div>
  );
}
