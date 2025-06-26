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
import { Plus, Pencil, Trash2, BadgeCheck, AlertTriangle, Package, PlusCircle, Search, Filter, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

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

export default function ProductosPage() {
  const router = useRouter();
  const { productos, cargando, error, agregarProducto, actualizarProducto, eliminarProducto } = useProductos();
  const { categorias, proveedores } = useDatosAuxiliares();

  // Estados del formulario
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [productoActual, setProductoActual] = useState<Producto | null>(null);
  const [imagenPreview, setImagenPreview] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  // Estados de filtros
  const [busqueda, setBusqueda] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("");
  const [precioMin, setPrecioMin] = useState("");
  const [precioMax, setPrecioMax] = useState("");
  const [stockBajo, setStockBajo] = useState(false);

  // Estados de modales
  const [modalCategoria, setModalCategoria] = useState(false);
  const [nuevaCategoria, setNuevaCategoria] = useState("");
  const [errorCategoria, setErrorCategoria] = useState<string | null>(null);
  const [categoriasLocales, setCategoriasLocales] = useState<Categoria[]>([]);

  // Debounce para la búsqueda
  const busquedaDebounced = useDebounce(busqueda, 300);

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

  // Memoización de productos filtrados
  const productosFiltrados = useMemo(() => {
    return productos.filter((prod) => {
      const coincideBusqueda = busquedaDebounced === "" || 
        prod.nombre.toLowerCase().includes(busquedaDebounced.toLowerCase()) ||
        prod.categoria?.nombre.toLowerCase().includes(busquedaDebounced.toLowerCase()) ||
        prod.proveedor?.nombre.toLowerCase().includes(busquedaDebounced.toLowerCase());

      const coincideCategoria = categoriaFiltro === "todas" || categoriaFiltro === "" || prod.categoria?.nombre === categoriaFiltro;
      const coincidePrecioMin = precioMin === "" || prod.precio >= parseFloat(precioMin);
      const coincidePrecioMax = precioMax === "" || prod.precio <= parseFloat(precioMax);
      const coincideStock = !stockBajo || prod.stock <= 10;

      return coincideBusqueda && coincideCategoria && coincidePrecioMin && coincidePrecioMax && coincideStock;
    });
  }, [productos, busquedaDebounced, categoriaFiltro, precioMin, precioMax, stockBajo]);

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
      };

      // Validación
      if (!productoData.nombre || !productoData.descripcion || !productoData.categoriaId || 
          !productoData.proveedorId || productoData.precio <= 0 || productoData.stock < 0) {
        alert("Por favor completa todos los campos correctamente.");
        return;
      }

      const resultado = modoEdicion 
        ? await actualizarProducto(productoActual!.id, productoData)
        : await agregarProducto(productoData);

      if (resultado.success) {
        setModalAbierto(false);
        // Mostrar toast de éxito (implementar sistema de toasts)
        alert(modoEdicion ? "Producto actualizado exitosamente" : "Producto agregado exitosamente");
      } else {
        alert(resultado.error || "Error al guardar producto");
      }
    } catch (error) {
      alert("Error inesperado al guardar producto");
    } finally {
      setGuardando(false);
    }
  }, [modoEdicion, productoActual, imagenPreview, agregarProducto, actualizarProducto]);

  const handleEliminarProducto = useCallback(async (id: number, nombre: string) => {
    if (!confirm(`¿Estás seguro de eliminar "${nombre}"?`)) return;

    const resultado = await eliminarProducto(id);
    if (resultado.success) {
      alert("Producto eliminado exitosamente");
    } else {
      alert(resultado.error || "Error al eliminar producto");
    }
  }, [eliminarProducto]);

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
        alert("Categoría agregada exitosamente");
      } else {
        const data = await res.json();
        setErrorCategoria(data.error || "No se pudo agregar la categoría.");
      }
    } catch (error) {
      setErrorCategoria("Ocurrió un error inesperado al agregar la categoría.");
    }
  }, [nuevaCategoria]);

  const limpiarFiltros = useCallback(() => {
    setBusqueda("");
    setCategoriaFiltro("todas");
    setPrecioMin("");
    setPrecioMax("");
    setStockBajo(false);
  }, []);

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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Package className="text-blue-500" size={32} /> 
          Productos
          <span className="text-sm font-normal text-gray-500 ml-2">
            ({productosFiltrados.length} de {productos.length})
          </span>
        </h2>
        <Button
          onClick={abrirModalAgregar}
          className="flex gap-2 whitespace-nowrap bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow-md transition-transform hover:scale-105"
        >
          <PlusCircle size={20} /> Agregar producto
        </Button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="text-blue-500" size={20} />
          <h3 className="font-semibold text-gray-700">Filtros</h3>
          {(busqueda || categoriaFiltro || precioMin || precioMax || stockBajo) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={limpiarFiltros}
              className="ml-auto text-gray-500 hover:text-gray-700"
            >
              <X size={16} /> Limpiar
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <Input
              placeholder="Buscar productos..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-10 rounded-lg border-blue-200 focus:border-blue-400 focus:ring-blue-300"
            />
          </div>
          
          <Select onValueChange={setCategoriaFiltro} value={categoriaFiltro}>
            <SelectTrigger className="rounded-lg border-blue-200 focus:border-blue-400 focus:ring-blue-300">
              <SelectValue placeholder="Todas las categorías" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas las categorías</SelectItem>
              {categoriasLocales.map((cat) => (
                <SelectItem key={cat.id} value={cat.nombre}>
                  {cat.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Input
            type="number"
            placeholder="Precio mínimo"
            value={precioMin}
            onChange={(e) => setPrecioMin(e.target.value)}
            className="rounded-lg border-blue-200 focus:border-blue-400 focus:ring-blue-300"
          />
          
          <Input
            type="number"
            placeholder="Precio máximo"
            value={precioMax}
            onChange={(e) => setPrecioMax(e.target.value)}
            className="rounded-lg border-blue-200 focus:border-blue-400 focus:ring-blue-300"
          />
        </div>

        <div className="flex items-center mt-4 gap-2">
          <input
            type="checkbox"
            id="stockBajo"
            checked={stockBajo}
            onChange={() => setStockBajo(!stockBajo)}
            className="accent-blue-500"
          />
          <label htmlFor="stockBajo" className="text-sm text-gray-700">
            Mostrar solo productos con stock bajo (≤ 10)
          </label>
        </div>
      </div>

      {/* Grid de tarjetas en móvil/tablet */}
      <div className="block lg:hidden">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {productosFiltrados.map((prod) => (
                <motion.div
                  key={prod.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="bg-white rounded-xl shadow-md p-4 flex flex-col gap-2 border border-blue-50 hover:shadow-lg transition group"
                >
                  <div className="flex items-center gap-3">
                    {prod.imagen ? (
                      <img
                        src={prod.imagen}
                        alt={prod.nombre}
                        className="w-16 h-16 object-cover rounded-md border"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center">
                        <Package className="text-gray-400" size={28} />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-blue-900 text-lg">
                          {prod.nombre}
                        </span>
                        {prod.stock <= 0 ? (
                          <span className="ml-2 px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-xs font-semibold flex items-center gap-1">
                            <AlertTriangle size={14} /> Agotado
                          </span>
                        ) : prod.stock <= 10 ? (
                          <span className="ml-2 px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 text-xs font-semibold flex items-center gap-1">
                            <AlertTriangle size={14} /> Stock bajo
                          </span>
                        ) : (
                          <span className="ml-2 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold flex items-center gap-1">
                            <BadgeCheck size={14} /> Stock OK
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {prod.categoria?.nombre || "Sin categoría"} • {prod.proveedor?.nombre || "Sin proveedor"}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 mt-2">
                    <span className="text-gray-700 text-sm line-clamp-2">{prod.descripcion}</span>
                    <span className="text-blue-700 font-bold">C$ {prod.precio.toFixed(2)}</span>
                    <span className="text-xs text-gray-500">Stock: {prod.stock}</span>
                  </div>
                  <div className="flex gap-2 mt-2">
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
                      onClick={() => handleEliminarProducto(prod.id, prod.nombre)}
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Tabla en desktop */}
      <div className="hidden lg:block overflow-x-auto rounded-xl shadow">
        <table className="min-w-full text-sm text-left text-gray-700 bg-white">
          <thead className="bg-gray-100 text-xs uppercase text-gray-500">
            <tr>
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
              productosFiltrados.map((prod) => (
                <tr key={prod.id} className="border-t hover:bg-blue-50/40 transition">
                  <td className="px-6 py-4">
                    {prod.imagen ? (
                      <img
                        src={prod.imagen}
                        alt={prod.nombre}
                        className="w-16 h-16 object-cover rounded-md border"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center">
                        <Package className="text-gray-400" size={28} />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 font-medium">{prod.nombre}</td>
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
                        onClick={() => handleEliminarProducto(prod.id, prod.nombre)}
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
    </div>
  );
}
