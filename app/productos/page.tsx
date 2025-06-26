"use client";

import { useState } from "react";
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
import { Plus, Pencil, Trash2, BadgeCheck, AlertTriangle, Package, PlusCircle } from "lucide-react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { List } from "lucide-react";
import AutoCompleteProveedor from "@/components/AutoCompleteProveedor";
import ModalSeleccionarProveedor from "@/components/modales/ModalSeleccionarProveedor";
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


export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [errorCategoria, setErrorCategoria] = useState<string | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    categoria: "",
    proveedor: 0,
    precio: "",
    stock: "",
    imagen: null,
  });

  const [proveedores, setProveedores] = useState<
    { id: number; nombre: string }[]
  >([]);

  const [productoActual, setProductoActual] = useState<Producto | null>(null);
  const [imagenPreview, setImagenPreview] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");

  const [categorias, setCategorias] = useState<
    { id: number; nombre: string }[]
  >([]);

  const [modalCategoria, setModalCategoria] = useState(false);
  const [nuevaCategoria, setNuevaCategoria] = useState("");

  const [modalProveedor, setModalProveedor] = useState(false);

  const [categoriaFiltro, setCategoriaFiltro] = useState("");
  const [precioMin, setPrecioMin] = useState("");
  const [precioMax, setPrecioMax] = useState("");
  const [stockBajo, setStockBajo] = useState(false);
  const router = useRouter();
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const user = localStorage.getItem("usuario");
    if (!user) {
      router.replace("/login");
      return;
    }
    setCargando(true);
    fetch("/api/productos")
      .then((res) => res.json())
      .then(setProductos)
      .finally(() => setCargando(false));
  }, [router]);

useEffect(() => {
  fetch("/api/categorias")
    .then(async (res) => {
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setCategorias(data);
      } else {
        console.error("Error al obtener categorías:", data);
        setCategorias([]);
      }
    })
    .catch((err) => {
      console.error("Error al cargar categorías:", err);
      setCategorias([]);
    });
}, []);



  useEffect(() => {
    fetch("/api/proveedores")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProveedores(data);
        } else {
          console.error("La respuesta de proveedores no es un array:", data);
          setProveedores([]);
        }
      })
      .catch((err) => {
        console.error("Error al cargar proveedores:", err);
        setProveedores([]);
      });
  }, []);

  const abrirModalAgregar = () => {
    setProductoActual(null);
    setImagenPreview(null);
    setModoEdicion(false);
    setModalAbierto(true);
  };

  const abrirModalEditar = (producto: Producto) => {
    setProductoActual(producto);
    setImagenPreview(producto.imagen || null);
    setModoEdicion(true);
    setModalAbierto(true);
  };

  const handleImagenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagenPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

const guardarProducto = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  const formData = new FormData(e.currentTarget);

  const nombre = formData.get("nombre")?.toString().trim();
  const descripcion = formData.get("descripcion")?.toString().trim();
  const categoria = formData.get("categoria")?.toString();
  const proveedor = formData.get("proveedor")?.toString();
  const precio = formData.get("precio")?.toString();
  const stock = formData.get("stock")?.toString();

  // Validación básica
  if (!nombre || !descripcion || !categoria || !proveedor || !precio || !stock) {
    alert("Todos los campos son obligatorios.");
    return;
  }

  const productoData = {
    nombre,
    descripcion,
    categoriaId: parseInt(categoria),
    proveedorId: parseInt(proveedor),
    precio: parseFloat(precio),
    stock: parseInt(stock),
    imagen: imagenPreview ?? "",
  };

  try {
    const res = await fetch(
      modoEdicion ? `/api/productos/${productoActual?.id}` : "/api/productos",
      {
        method: modoEdicion ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productoData),
      }
    );

    if (res.ok) {
      const nuevo = await res.json();
      setProductos((prev) =>
        modoEdicion
          ? prev.map((p) => (p.id === nuevo.id ? nuevo : p))
          : [...prev, nuevo]
      );
      setModalAbierto(false);
    } else {
      const error = await res.json();
      alert(error?.message || "Error al guardar producto");
    }
  } catch (error) {
    console.error("Error al guardar producto:", error);
    alert("Ocurrió un error al guardar el producto.");
  }
};


  const eliminarProducto = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar este producto?")) return;

    const res = await fetch(`/api/productos/${id}`, { method: "DELETE" });
    if (res.ok) {
      setProductos((prev) => prev.filter((p) => p.id !== id));
    } else {
      console.error("Error al eliminar producto");
    }
  };

  const agregarCategoria = async () => {
    const nueva = nuevaCategoria.trim();
    if (!nueva) return;

    try {
      const res = await fetch("/api/categorias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: nueva }),
      });

      if (res.ok) {
        const nuevaCat = await res.json();
        setCategorias((prev) => [...prev, nuevaCat]);
        setNuevaCategoria("");
        setModalCategoria(false);
      } else {
        const data = await res.json();
        setErrorCategoria(data.error || "No se pudo agregar la categoría.");
      }
    } catch (error) {
      console.error("Error al agregar categoría", error);
      setErrorCategoria("Ocurrió un error inesperado al agregar la categoría.");
    }
  };

  const productosFiltrados = productos.filter((prod) => {
    const coincideBusqueda =
      prod.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      prod.categoria?.nombre.toLowerCase().includes(busqueda.toLowerCase());

    const coincideCategoria =
      categoriaFiltro === "todas" || categoriaFiltro === ""
        ? true
        : prod.categoria?.nombre === categoriaFiltro;
    const coincidePrecioMin = precioMin
      ? prod.precio >= parseFloat(precioMin)
      : true;
    const coincidePrecioMax = precioMax
      ? prod.precio <= parseFloat(precioMax)
      : true;
    const coincideStock = stockBajo ? prod.stock <= 10 : true;

    return (
      coincideBusqueda &&
      coincideCategoria &&
      coincidePrecioMin &&
      coincidePrecioMax &&
      coincideStock
    );
  });

  // Spinner de carga
  if (cargando) return (
    <div className="flex items-center justify-center min-h-screen">
      <svg className="animate-spin h-20 w-20 text-blue-500" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
      </svg>
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Package className="text-blue-500" size={32} /> Productos
        </h2>
        <Button
          onClick={abrirModalAgregar}
          className="flex gap-2 whitespace-nowrap bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow-md transition-transform hover:scale-105"
        >
          <PlusCircle size={20} /> Agregar producto
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Input
          placeholder="Buscar por nombre o categoría"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="rounded-lg border-blue-200 focus:border-blue-400 focus:ring-blue-300"
        />
        <Select onValueChange={setCategoriaFiltro} value={categoriaFiltro}>
          <SelectTrigger className="rounded-lg border-blue-200 focus:border-blue-400 focus:ring-blue-300">
            <SelectValue placeholder="Filtrar por categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas</SelectItem>
            {categorias.map((cat) => (
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

      <div className="flex items-center mb-4 gap-2">
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

      {/* Grid de tarjetas en móvil/tablet, tabla en desktop */}
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
                    <span className="text-gray-700 text-sm">{prod.descripcion}</span>
                    <span className="text-blue-700 font-bold">C$ {prod.precio}</span>
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
                      onClick={() => eliminarProducto(prod.id)}
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
                  No hay productos para mostrar
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
                  <td className="px-6 py-4">C${prod.precio}</td>
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
                        onClick={() => eliminarProducto(prod.id)}
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

      {/* Modal */}
      <Dialog open={modalAbierto} onOpenChange={setModalAbierto}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {modoEdicion ? "Editar Producto" : "Agregar Producto"}
            </DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={guardarProducto}>
            <div>
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                name="nombre"
                defaultValue={productoActual?.nombre}
                required
                className="rounded-lg border-blue-200 focus:border-blue-400 focus:ring-blue-300"
              />
            </div>

            <div>
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                name="descripcion"
                defaultValue={productoActual?.descripcion}
                required
                className="rounded-lg border-blue-200 focus:border-blue-400 focus:ring-blue-300"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="categoria">Categoría</Label>
                <div className="flex items-center gap-2">
                  <Select
                    name="categoria"
                    defaultValue={productoActual?.categoriaId?.toString() || ""}
                  >
                    <SelectTrigger className="flex-1 rounded-lg border-blue-200 focus:border-blue-400 focus:ring-blue-300">
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map((cat) => (
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
                  >
                    <Plus size={18} />
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="proveedor">Proveedor</Label>
                <div>
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="precio">Precio</Label>
                <Input
                  id="precio"
                  name="precio"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={productoActual?.precio}
                  required
                  className="rounded-lg border-blue-200 focus:border-blue-400 focus:ring-blue-300"
                />
              </div>
              <div>
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  name="stock"
                  type="number"
                  min="0"
                  defaultValue={productoActual?.stock}
                  required
                  className="rounded-lg border-blue-200 focus:border-blue-400 focus:ring-blue-300"
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

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md">
              {modoEdicion ? "Guardar cambios" : "Agregar producto"}
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
