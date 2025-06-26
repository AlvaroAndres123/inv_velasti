"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, Truck, Search, Filter, Table, LayoutGrid, X, Mail, User, Phone } from "lucide-react";
import { useRouter } from "next/navigation";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { useToast, ToastContainer } from "@/components/ui/toast";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ExcelJS from "exceljs";
import { MultiSelect } from "@/components/ui/MultiSelect";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ExportButton } from "@/components/ui/ExportButton";
import { useMediaQuery } from "@/hooks/useMediaQuery";

interface Proveedor {
  id: number;
  nombre: string;
  contacto: string;
  telefono: string;
  correo: string;
  direccion: string;
}

export default function ProveedoresPage() {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [proveedorActual, setProveedorActual] = useState<Proveedor | null>(
    null
  );
  const [busqueda, setBusqueda] = useState("");
  const router = useRouter();

  // Estados para paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [proveedoresPorPagina, setProveedoresPorPagina] = useState(10);
  const opcionesPorPagina = [5, 10, 20, 30, 50];

  // Estados para feedback
  const { toasts, success, error: showError, removeToast } = useToast();

  // Estado para selección masiva
  const [seleccionados, setSeleccionados] = useState<number[]>([]);
  
  const toggleSeleccion = (id: number) => {
    setSeleccionados(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };
  
  const toggleSeleccionTodos = () => {
    if (todosSeleccionados) {
      setSeleccionados(prev => prev.filter(id => !proveedoresPaginados.some((p: Proveedor) => p.id === id)));
    } else {
      setSeleccionados(prev => [...prev, ...proveedoresPaginados.filter((p: Proveedor) => !prev.includes(p.id)).map((p: Proveedor) => p.id)]);
    }
  };
  
  const limpiarSeleccion = () => setSeleccionados([]);
  
  // Acción masiva - eliminar seleccionados
  const eliminarSeleccionados = async () => {
    if (seleccionados.length === 0) return;
    if (!window.confirm(`¿Seguro que deseas eliminar ${seleccionados.length} proveedor(es)? Esta acción no se puede deshacer.`)) return;
    
    for (const id of seleccionados) {
      try {
        const res = await fetch(`/api/proveedores/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error(`Error al eliminar proveedor ${id}`);
      } catch (error) {
        console.error(`Error eliminando proveedor ${id}:`, error);
      }
    }
    
    limpiarSeleccion();
    // Recargar la lista de proveedores
    const res = await fetch("/api/proveedores");
    if (res.ok) {
      const data = await res.json();
      setProveedores(data);
    }
    success('Proveedores eliminados', 'Los proveedores seleccionados han sido eliminados.');
  };

  // Estados para confirmación de eliminación
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [proveedorAEliminar, setProveedorAEliminar] = useState<Proveedor | null>(null);
  const [eliminando, setEliminando] = useState(false);

  const [cargando, setCargando] = useState(true);

  const isMobile = useMediaQuery('(max-width: 768px)');
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(!isMobile);
  const [vista, setVista] = useState<'tabla' | 'tarjetas'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('vistaProveedores') as 'tabla' | 'tarjetas') || (isMobile ? 'tarjetas' : 'tabla');
    }
    return isMobile ? 'tarjetas' : 'tabla';
  });

  // Estados de filtro avanzados para proveedores
  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroContacto, setFiltroContacto] = useState("");
  const [filtroCorreo, setFiltroCorreo] = useState("");
  const [filtroTelefono, setFiltroTelefono] = useState("");
  const [filtroCiudad, setFiltroCiudad] = useState("");

  // Sugerencias únicas para autocompletado
  const nombresUnicos = useMemo(() => Array.from(new Set(proveedores.map(p => p.nombre).filter(Boolean))), [proveedores]);
  const contactosUnicos = useMemo(() => Array.from(new Set(proveedores.map(p => p.contacto).filter(Boolean))), [proveedores]);
  const correosUnicos = useMemo(() => Array.from(new Set(proveedores.map(p => p.correo).filter(Boolean))), [proveedores]);

  // Extraer ciudades únicas si existe el campo direccion
  const ciudadesUnicas = Array.from(new Set(proveedores.map(p => (p.direccion?.split(",")[1]?.trim() || "")).filter(Boolean)));

  useEffect(() => {
    const user = localStorage.getItem("usuario");
    if (!user) {
      router.replace("/login");
    }
  }, [router]);

  useEffect(() => {
    setCargando(true);
    fetch("/api/proveedores")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProveedores(data);
        } else {
          console.error("La respuesta no es un array:", data);
        }
      })
      .catch((err) => {
        console.error("Error al cargar proveedores", err);
      })
      .finally(() => setCargando(false));
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('vistaProveedores', vista);
    }
  }, [vista]);

  useEffect(() => {
    if (isMobile) setVista('tarjetas');
  }, [isMobile]);

  const abrirModalAgregar = () => {
    setProveedorActual(null);
    setModoEdicion(false);
    setModalAbierto(true);
  };

  const abrirModalEditar = (prov: Proveedor) => {
    setProveedorActual(prov);
    setModoEdicion(true);
    setModalAbierto(true);
  };

  const guardarProveedor = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const proveedor = {
      nombre: (form.nombre as any).value,
      contacto: (form.contacto as any).value,
      telefono: (form.telefono as any).value,
      correo: (form.correo as any).value,
      direccion: (form.direccion as any).value,
    };
    try {
      const res = await fetch(
        proveedorActual
          ? `/api/proveedores/${proveedorActual.id}`
          : '/api/proveedores',
        {
          method: proveedorActual ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(proveedor),
        }
      );
      const data = await res.json();
      if (res.ok) {
        if (proveedorActual) {
          setProveedores((prev) => prev.map((p) => (p.id === data.id ? data : p)));
          success('Proveedor actualizado correctamente');
        } else {
          setProveedores((prev) => [...prev, data]);
          success('Proveedor agregado correctamente');
        }
        setModalAbierto(false);
      } else {
        showError(data.error || 'Error al guardar proveedor');
      }
    } catch (error) {
      console.error('Error al guardar proveedor:', error);
      showError('Error al guardar proveedor');
    }
  };

  const eliminarProveedor = async (id: number) => {
    try {
      const res = await fetch(`/api/proveedores/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProveedores((prev) => prev.filter((p) => p.id !== id));
        success('Proveedor eliminado correctamente');
      } else {
        const data = await res.json();
        showError(data.error || 'Error al eliminar proveedor');
      }
    } catch (error) {
      console.error('Error al eliminar proveedor:', error);
      showError('Error al eliminar proveedor');
    }
  };

  // Lógica de filtrado avanzada
  const proveedoresFiltrados = proveedores.filter((p) => {
    const coincideNombre = filtroNombre === "" || p.nombre.toLowerCase().includes(filtroNombre.toLowerCase());
    const coincideContacto = filtroContacto === "" || p.contacto.toLowerCase().includes(filtroContacto.toLowerCase());
    const coincideCorreo = filtroCorreo === "" || p.correo.toLowerCase().includes(filtroCorreo.toLowerCase());
    const coincideTelefono = filtroTelefono === "" || p.telefono.toLowerCase().includes(filtroTelefono.toLowerCase());
    const coincideCiudad = filtroCiudad === "" || (p.direccion?.toLowerCase().includes(filtroCiudad.toLowerCase()));
    return coincideNombre && coincideContacto && coincideCorreo && coincideTelefono && coincideCiudad;
  });

  // Calcular proveedores a mostrar según paginación
  const totalPaginas = Math.max(1, Math.ceil(proveedoresFiltrados.length / proveedoresPorPagina));
  const proveedoresPaginados = proveedoresFiltrados.slice((paginaActual - 1) * proveedoresPorPagina, paginaActual * proveedoresPorPagina);
  const todosSeleccionados = proveedoresPaginados.length > 0 && proveedoresPaginados.every((p: Proveedor) => seleccionados.includes(p.id));

  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda, proveedoresPorPagina]);

  // Exportar a Excel
  function nombreArchivoExportacion(tipo: 'Seleccionados' | 'Filtrados', extension: 'xlsx' | 'pdf') {
    const fecha = new Date();
    const yyyy = fecha.getFullYear();
    const mm = String(fecha.getMonth() + 1).padStart(2, '0');
    const dd = String(fecha.getDate()).padStart(2, '0');
    return `AlmaSoft_Proveedores_${yyyy}${mm}${dd}_${tipo}.${extension}`;
  }
  function exportarProveedoresAExcel(proveedoresExportar: Proveedor[], nombreArchivo: string) {
    if (!proveedoresExportar.length) return;
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Proveedores");
    worksheet.mergeCells("A1:E1");
    const logoCell = worksheet.getCell("A1");
    logoCell.value = "Proveedores";
    logoCell.font = { name: "Calibri", bold: true, size: 22, color: { argb: "FF2196F3" } };
    logoCell.alignment = { horizontal: "center", vertical: "middle" };
    worksheet.addRow([]);
    worksheet.columns = [
      { header: "Nombre", key: "nombre", width: 24 },
      { header: "Contacto", key: "contacto", width: 20 },
      { header: "Teléfono", key: "telefono", width: 16 },
      { header: "Correo", key: "correo", width: 28 },
      { header: "Dirección", key: "direccion", width: 32 },
    ];
    proveedoresExportar.forEach((p) => {
      worksheet.addRow({
        nombre: p.nombre,
        contacto: p.contacto,
        telefono: p.telefono,
        correo: p.correo,
        direccion: p.direccion,
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
  function exportarProveedoresAPDF(proveedoresExportar: Proveedor[], nombreArchivo: string) {
    if (!proveedoresExportar.length) return;
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.setTextColor(33, 150, 243);
    doc.setFont('helvetica', 'bold');
    doc.text('Proveedores', doc.internal.pageSize.getWidth() / 2, 22, { align: 'center' });
    doc.setDrawColor(33, 150, 243);
    doc.setLineWidth(1);
    doc.line(20, 28, doc.internal.pageSize.getWidth() - 20, 28);
    const columns = [
      { header: "Nombre", dataKey: "nombre" },
      { header: "Contacto", dataKey: "contacto" },
      { header: "Teléfono", dataKey: "telefono" },
      { header: "Correo", dataKey: "correo" },
      { header: "Dirección", dataKey: "direccion" },
    ];
    const data = proveedoresExportar.map((p) => ({
      nombre: p.nombre,
      contacto: p.contacto,
      telefono: p.telefono,
      correo: p.correo,
      direccion: p.direccion,
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

  const pedirConfirmacionEliminar = (prov: Proveedor) => {
    setProveedorAEliminar(prov);
    setConfirmOpen(true);
  };
  const confirmarEliminarProveedor = async () => {
    if (!proveedorAEliminar) return;
    setEliminando(true);
    await eliminarProveedor(proveedorAEliminar.id);
    setEliminando(false);
    setConfirmOpen(false);
    setProveedorAEliminar(null);
  };

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
            ? <span key={idx} className="px-2 text-gray-400">...</span>
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

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin h-20 w-20 text-blue-500" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          <span className="text-blue-600 font-medium">Cargando proveedores...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f8fa] flex flex-col items-center justify-start py-4">
      <div className="w-full max-w-7xl px-4 sm:px-8 mx-auto">
        <ToastContainer toasts={toasts} onClose={removeToast} />
        {/* Encabezado y switch de vista */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Truck className="text-blue-500" size={32} />
            <h2 className="text-3xl font-bold text-gray-800">Proveedores</h2>
            <span className="text-sm font-normal text-gray-500 ml-2">({proveedoresFiltrados.length} de {proveedores.length})</span>
          </div>
          <div className="flex gap-2 items-center">
            <Button
              variant={vista === 'tabla' ? 'default' : 'outline'}
              size="icon"
              aria-label="Vista tabla"
              className={vista === 'tabla' ? 'bg-blue-600 text-white' : ''}
              onClick={() => setVista('tabla')}
              disabled={isMobile}
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
        {/* Filtros avanzados con grid responsivo y lógica igual a movimientos */}
        <div className="mb-4">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Filter className="text-blue-500" size={20} />
            <h3 className="font-semibold text-gray-700">Filtros</h3>
            <span className="ml-2 text-xs text-gray-500">{proveedoresFiltrados.length} resultado(s)</span>
            <label className="ml-4 text-xs text-gray-500">Mostrar</label>
            <select
              className="rounded-md border border-blue-200 focus:border-blue-400 focus:ring-blue-300 bg-white h-8 text-sm px-2"
              value={proveedoresPorPagina}
              onChange={e => {
                setProveedoresPorPagina(Number(e.target.value));
                setPaginaActual(1);
              }}
            >
              {opcionesPorPagina.map(op => (
                <option key={op} value={op}>{op}</option>
              ))}
            </select>
            <span className="text-xs text-gray-500">por página</span>
            <ExportButton
              onClick={() => exportarProveedoresAExcel(
                seleccionados.length > 0 ? proveedores.filter(p => seleccionados.includes(p.id)) : proveedoresFiltrados,
                nombreArchivoExportacion(seleccionados.length > 0 ? 'Seleccionados' : 'Filtrados', 'xlsx')
              )}
              icon={
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M16 16v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M7 9h6M7 13h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M20 7v6m0 0l2-2m-2 2l-2-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              }
              title={seleccionados.length > 0 ? "Exportar seleccionados a Excel" : "Exportar proveedores filtrados a Excel"}
            >
              Exportar Excel
            </ExportButton>
            <ExportButton
              onClick={() => exportarProveedoresAPDF(
                seleccionados.length > 0 ? proveedores.filter(p => seleccionados.includes(p.id)) : proveedoresFiltrados,
                nombreArchivoExportacion(seleccionados.length > 0 ? 'Seleccionados' : 'Filtrados', 'pdf')
              )}
              icon={
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M16 16v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M7 9h6M7 13h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M20 7v6m0 0l2-2m-2 2l-2-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              }
              title={seleccionados.length > 0 ? "Exportar seleccionados a PDF" : "Exportar proveedores filtrados a PDF"}
            >
              Exportar PDF
            </ExportButton>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFiltroNombre("");
                setFiltroContacto("");
                setFiltroCorreo("");
                setFiltroTelefono("");
                setFiltroCiudad("");
                limpiarSeleccion();
              }}
              className="ml-2 text-gray-500 hover:text-gray-700"
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
        {/* Filtros colapsables en móvil */}
        <div className={`${isMobile && !filtrosAbiertos ? 'hidden' : ''}`}>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2 md:gap-2 w-full mb-4">
            {/* Buscar por nombre */}
            <div className="flex flex-col relative w-full">
              <label htmlFor="filtroNombre" className="text-sm text-gray-700 mb-1 font-medium">Nombre</label>
              <span className="absolute left-3 top-[70%] -translate-y-1/2 text-blue-400 pointer-events-none">
                <Search size={20} />
              </span>
              <input
                id="filtroNombre"
                placeholder="Buscar nombre"
                value={filtroNombre}
                onChange={e => setFiltroNombre(e.target.value)}
                className="pl-10 rounded-md border border-blue-200 focus:border-blue-500 focus:ring-blue-300 bg-white h-11 text-base w-full"
                list="nombres-proveedores"
              />
              <datalist id="nombres-proveedores">
                {nombresUnicos.map(nombre => (
                  <option key={nombre} value={nombre} />
                ))}
              </datalist>
            </div>
            {/* Buscar por contacto */}
            <div className="flex flex-col relative w-full">
              <label htmlFor="filtroContacto" className="text-sm text-gray-700 mb-1 font-medium">Contacto</label>
              <span className="absolute left-3 top-[70%] -translate-y-1/2 text-blue-400 pointer-events-none">
                <Search size={20} />
              </span>
              <input
                id="filtroContacto"
                placeholder="Buscar contacto"
                value={filtroContacto}
                onChange={e => setFiltroContacto(e.target.value)}
                className="pl-10 rounded-md border border-blue-200 focus:border-blue-500 focus:ring-blue-300 bg-white h-11 text-base w-full"
                list="contactos-proveedores"
              />
              <datalist id="contactos-proveedores">
                {contactosUnicos.map(contacto => (
                  <option key={contacto} value={contacto} />
                ))}
              </datalist>
            </div>
            {/* Buscar por correo */}
            <div className="flex flex-col relative w-full">
              <label htmlFor="filtroCorreo" className="text-sm text-gray-700 mb-1 font-medium">Correo</label>
              <span className="absolute left-3 top-[70%] -translate-y-1/2 text-blue-400 pointer-events-none">
                <Search size={20} />
              </span>
              <input
                id="filtroCorreo"
                placeholder="Buscar correo"
                value={filtroCorreo}
                onChange={e => setFiltroCorreo(e.target.value)}
                className="pl-10 rounded-md border border-blue-200 focus:border-blue-500 focus:ring-blue-300 bg-white h-11 text-base w-full"
                list="correos-proveedores"
              />
              <datalist id="correos-proveedores">
                {correosUnicos.map(correo => (
                  <option key={correo} value={correo} />
                ))}
              </datalist>
            </div>
            {/* Buscar por teléfono */}
            <div className="flex flex-col relative w-full">
              <label htmlFor="filtroTelefono" className="text-sm text-gray-700 mb-1 font-medium">Teléfono</label>
              <span className="absolute left-3 top-[70%] -translate-y-1/2 text-blue-400 pointer-events-none">
                <Search size={20} />
              </span>
              <input
                id="filtroTelefono"
                placeholder="Buscar teléfono"
                value={filtroTelefono}
                onChange={e => setFiltroTelefono(e.target.value)}
                className="pl-10 rounded-md border border-blue-200 focus:border-blue-500 focus:ring-blue-300 bg-white h-11 text-base w-full"
              />
            </div>
            {/* Filtrar por ciudad */}
            <div className="flex flex-col relative w-full">
              <label htmlFor="filtroCiudad" className="text-sm text-gray-700 mb-1 font-medium">Ciudad</label>
              <span className="absolute left-3 top-[70%] -translate-y-1/2 text-blue-400 pointer-events-none">
                <Filter size={20} />
              </span>
              <select
                id="filtroCiudad"
                value={filtroCiudad}
                onChange={e => setFiltroCiudad(e.target.value)}
                className="pl-10 rounded-md border border-blue-200 focus:border-blue-500 focus:ring-blue-300 bg-white h-11 text-base w-full"
              >
                <option value="">Todas las ciudades</option>
                {ciudadesUnicas.map(ciudad => (
                  <option key={ciudad} value={ciudad}>{ciudad}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        {/* Indicador de selección masiva barra fija arriba */}
        {seleccionados.length > 0 && (
          <div className="fixed top-0 left-0 w-full z-40 bg-white border-b shadow flex flex-wrap items-center gap-4 px-6 py-3 animate-fade-in pt-14 md:pt-0">
            <span className="font-semibold text-blue-700">{seleccionados.length} seleccionado(s)</span>
            <Button variant="destructive" size="sm" onClick={eliminarSeleccionados}>
              <Trash2 size={16} /> Eliminar
            </Button>
            <Button variant="secondary" size="sm" onClick={limpiarSeleccion}>
              Cancelar
            </Button>
          </div>
        )}
        {/* Renderizado condicional según vista */}
        {proveedoresFiltrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[180px] w-full text-blue-500 bg-white rounded-xl shadow p-6 my-8">
            <Truck size={40} className="mb-2" />
            <span className="text-lg font-semibold">No hay proveedores para mostrar</span>
            <span className="text-sm text-gray-500 mt-1">
              {proveedores.length > 0 ? "Intenta ajustar los filtros" : "Agrega tu primer proveedor"}
            </span>
          </div>
        ) : vista === 'tabla' ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left text-gray-700 bg-white border-separate border-spacing-0">
              <thead className="bg-gray-200 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-6 py-4 border-b border-gray-300">
                    <input
                      type="checkbox"
                      checked={todosSeleccionados}
                      onChange={toggleSeleccionTodos}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-4 border-b border-gray-300">ID</th>
                  <th className="px-6 py-4 border-b border-gray-300">Nombre</th>
                  <th className="px-6 py-4 border-b border-gray-300">Contacto</th>
                  <th className="px-6 py-4 border-b border-gray-300">Correo</th>
                  <th className="px-6 py-4 border-b border-gray-300">Teléfono</th>
                  <th className="px-6 py-4 border-b border-gray-300">Dirección</th>
                  <th className="px-6 py-4 border-b border-gray-300">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {proveedoresPaginados.map((proveedor) => (
                  <tr key={proveedor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 border-b border-gray-200">
                      <input
                        type="checkbox"
                        checked={seleccionados.includes(proveedor.id)}
                        onChange={() => toggleSeleccion(proveedor.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 border-b border-gray-200">{proveedor.id}</td>
                    <td className="px-6 py-4 border-b border-gray-200 font-medium">{proveedor.nombre}</td>
                    <td className="px-6 py-4 border-b border-gray-200">{proveedor.contacto}</td>
                    <td className="px-6 py-4 border-b border-gray-200">{proveedor.correo}</td>
                    <td className="px-6 py-4 border-b border-gray-200">{proveedor.telefono}</td>
                    <td className="px-6 py-4 border-b border-gray-200">{proveedor.direccion}</td>
                    <td className="px-6 py-4 border-b border-gray-200">
                      <div className="flex gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => abrirModalEditar(proveedor)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <Pencil size={16} />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Editar proveedor</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => pedirConfirmacionEliminar(proveedor)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 size={16} />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Eliminar proveedor</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          // Vista tarjetas
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 my-8">
            {proveedoresPaginados.map((prov) => (
              <div key={prov.id} className="bg-white rounded-xl shadow p-6 flex flex-col gap-2 border border-gray-100">
                {/* Checkbox de selección */}
                <div className="flex items-center justify-between">
                  <input
                    type="checkbox"
                    checked={seleccionados.includes(prov.id)}
                    onChange={() => toggleSeleccion(prov.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => abrirModalEditar(prov)}
                      title="Editar proveedor"
                    >
                      <Pencil size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500"
                      onClick={() => pedirConfirmacionEliminar(prov)}
                      title="Eliminar proveedor"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mb-2">
                  <Truck className="text-blue-400" size={28} />
                  <span className="font-semibold text-lg text-blue-900 truncate">{prov.nombre}</span>
                </div>
                <div className="text-gray-700 text-sm"><b>Contacto:</b> {prov.contacto}</div>
                <div className="text-gray-700 text-sm"><b>Teléfono:</b> {prov.telefono}</div>
                <div className="text-gray-700 text-sm"><b>Correo:</b> {prov.correo}</div>
                <div className="text-gray-700 text-sm"><b>Dirección:</b> {prov.direccion}</div>
              </div>
            ))}
          </div>
        )}
        {/* Controles de paginación debajo de la lista */}
        {isMobile ? (
          <>
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
          // Desktop: todo en una sola fila
          renderPaginacion({ paginaActual, totalPaginas, setPaginaActual })
        )}
        {/* FAB flotante para agregar proveedor */}
        <div className="fixed bottom-6 right-6 z-50 w-14 h-14 flex items-end">
          <Button
            size="icon"
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg w-14 h-14 flex items-center justify-center text-3xl transition-transform hover:scale-110"
            onClick={abrirModalAgregar}
            title="Agregar proveedor"
            aria-label="Agregar proveedor"
            style={{ boxShadow: '0 4px 24px 0 rgba(33,150,243,0.18)' }}
          >
            <Plus size={32} />
          </Button>
        </div>
        {/* Modal de registro/edición */}
        <Dialog open={modalAbierto} onOpenChange={setModalAbierto}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-blue-700">
                <Truck size={22} /> {modoEdicion ? "Editar Proveedor" : "Agregar Proveedor"}
              </DialogTitle>
            </DialogHeader>
            <form className="space-y-4" onSubmit={guardarProveedor}>
              <div>
                <Label htmlFor="nombre">Nombre</Label>
                <Input
                  id="nombre"
                  name="nombre"
                  defaultValue={proveedorActual?.nombre}
                  required
                  className="rounded-lg border-blue-200 focus:border-blue-400 focus:ring-blue-300"
                  placeholder="Nombre del proveedor"
                />
              </div>
              <div>
                <Label htmlFor="contacto">Contacto</Label>
                <Input
                  id="contacto"
                  name="contacto"
                  defaultValue={proveedorActual?.contacto}
                  required
                  className="rounded-lg border-blue-200 focus:border-blue-400 focus:ring-blue-300"
                  placeholder="Nombre del contacto"
                />
              </div>
              <div>
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  name="telefono"
                  defaultValue={proveedorActual?.telefono}
                  required
                  className="rounded-lg border-blue-200 focus:border-blue-400 focus:ring-blue-300"
                  placeholder="Teléfono"
                />
              </div>
              <div>
                <Label htmlFor="correo">Correo</Label>
                <Input
                  id="correo"
                  name="correo"
                  type="email"
                  defaultValue={proveedorActual?.correo}
                  required
                  className="rounded-lg border-blue-200 focus:border-blue-400 focus:ring-blue-300"
                  placeholder="Correo electrónico"
                />
              </div>
              <div>
                <Label htmlFor="direccion">Dirección</Label>
                <Input
                  id="direccion"
                  name="direccion"
                  defaultValue={proveedorActual?.direccion}
                  required
                  className="rounded-lg border-blue-200 focus:border-blue-400 focus:ring-blue-300"
                  placeholder="Dirección"
                />
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md flex items-center justify-center gap-2">
                {modoEdicion ? <><Pencil size={18}/> Actualizar</> : <><Plus size={18}/> Guardar</>}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
        {/* Confirmación de eliminación */}
        <ConfirmDialog
          open={confirmOpen}
          onConfirm={confirmarEliminarProveedor}
          onCancel={() => { setConfirmOpen(false); setProveedorAEliminar(null); }}
          title="Confirmar eliminación"
          message={`¿Estás seguro de que quieres eliminar el proveedor "${proveedorAEliminar?.nombre}"?`}
          confirmText="Eliminar"
          cancelText="Cancelar"
          loading={eliminando}
        />
      </div>
    </div>
  );
}
