"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, Package, Search, Filter, Table } from "lucide-react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { useToast, ToastContainer } from "@/components/ui/toast";

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

  useEffect(() => {
    const user = localStorage.getItem("usuario");
    if (!user) {
      router.replace("/login");
    }
  }, [router]);

  useEffect(() => {
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
      });
  }, []);

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

  // Calcular proveedores a mostrar según paginación
  const proveedoresFiltrados = proveedores.filter((p) =>
    `${p.nombre} ${p.contacto}`.toLowerCase().includes(busqueda.toLowerCase())
  );
  const totalPaginas = Math.max(1, Math.ceil(proveedoresFiltrados.length / proveedoresPorPagina));
  const proveedoresPaginados = proveedoresFiltrados.slice((paginaActual - 1) * proveedoresPorPagina, paginaActual * proveedoresPorPagina);

  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda, proveedoresPorPagina]);

  return (
    <div className="min-h-screen bg-[#f6f8fa] flex flex-col items-center justify-start py-4">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl border border-gray-200 p-4 sm:p-8 mx-auto">
        <ToastContainer toasts={toasts} onClose={removeToast} />
        {/* Encabezado */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Package className="text-blue-500" size={32} />
            <h2 className="text-3xl font-bold text-gray-800">Proveedores</h2>
            <span className="text-sm font-normal text-gray-500 ml-2">({proveedoresFiltrados.length} de {proveedores.length})</span>
          </div>
        </div>
        {/* Filtros y buscador */}
        <div className="mb-6 bg-[#f8fafc] rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex flex-wrap items-center gap-2 mb-2 justify-between">
            <div className="flex items-center gap-2">
              <Table size={18} className="text-blue-500" />
              <h3 className="font-semibold text-gray-700 ml-2">Listado</h3>
              <span className="ml-2 text-xs text-gray-500">{proveedoresFiltrados.length} resultado(s)</span>
            </div>
            <div className="flex items-center gap-2 mt-2 sm:mt-0">
              <label className="text-xs text-gray-500">Mostrar</label>
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
            </div>
          </div>
          <div className="relative w-full mt-2">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 pointer-events-none">
              <Search size={16} />
            </span>
            <Input
              placeholder="Buscar por nombre o contacto"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-10 rounded-md border border-blue-200 focus:border-blue-400 focus:ring-blue-300 bg-white h-10 sm:h-11 text-base w-full text-sm sm:text-base"
            />
          </div>
        </div>
        {/* Tabla moderna y responsive */}
        <div className="overflow-x-auto rounded-xl shadow bg-white">
          <table className="min-w-full text-sm text-left text-gray-700 bg-white border-separate border-spacing-0">
            <thead className="bg-gray-200 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-6 py-4 border-b border-gray-300">Nombre</th>
                <th className="px-6 py-4 border-b border-gray-300">Contacto</th>
                <th className="px-6 py-4 border-b border-gray-300">Teléfono</th>
                <th className="px-6 py-4 border-b border-gray-300">Correo</th>
                <th className="px-6 py-4 border-b border-gray-300">Dirección</th>
                <th className="px-6 py-4 border-b border-gray-300">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {proveedoresPaginados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-blue-500">
                    <Package size={32} className="mx-auto mb-2" />
                    <div>No hay proveedores para mostrar</div>
                    <div className="text-sm text-gray-500 mt-1">
                      {proveedores.length > 0 ? "Intenta ajustar los filtros" : "Agrega tu primer proveedor"}
                    </div>
                  </td>
                </tr>
              ) : (
                proveedoresPaginados.map((prov) => (
                  <tr key={prov.id} className="border-t border-gray-200 hover:bg-blue-50/40 transition">
                    <td className="px-6 py-4 font-medium">
                      <TooltipProvider delayDuration={300}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="truncate max-w-[140px] block cursor-pointer">{prov.nombre}</span>
                          </TooltipTrigger>
                          <TooltipContent>{prov.nombre}</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </td>
                    <td className="px-6 py-4">
                      <TooltipProvider delayDuration={300}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="truncate max-w-[120px] block cursor-pointer">{prov.contacto}</span>
                          </TooltipTrigger>
                          <TooltipContent>{prov.contacto}</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </td>
                    <td className="px-6 py-4">{prov.telefono}</td>
                    <td className="px-6 py-4">
                      <TooltipProvider delayDuration={300}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="truncate max-w-[140px] block cursor-pointer">{prov.correo}</span>
                          </TooltipTrigger>
                          <TooltipContent>{prov.correo}</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </td>
                    <td className="px-6 py-4">
                      <TooltipProvider delayDuration={300}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="truncate max-w-[140px] block cursor-pointer">{prov.direccion}</span>
                          </TooltipTrigger>
                          <TooltipContent>{prov.direccion}</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
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
                          onClick={() => eliminarProveedor(prov.id)}
                          title="Eliminar proveedor"
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
        {/* Paginador debajo de la tabla */}
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
                <Package size={22} /> {modoEdicion ? "Editar Proveedor" : "Agregar Proveedor"}
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
      </div>
    </div>
  );
}
