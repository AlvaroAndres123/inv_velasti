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
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { List } from "lucide-react";
import AutoCompleteProveedor from "@/components/AutoCompleteProveedor";
import ModalSeleccionarProveedor from "@/components/modales/ModalSeleccionarProveedor";

interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  categoriaId: number;
  proveedor: string;
  precio: number;
  stock: number;
  imagen?: string;
  categoria?: { nombre: string };
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

  useEffect(() => {
    const user = localStorage.getItem("usuario");
    if (!user) {
      router.replace("/login");
      return;
    }

    fetch("/api/productos")
      .then((res) => res.json())
      .then(setProductos)
      .catch(console.error);
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

    const productoData = {
      nombre: formData.get("nombre") as string,
      descripcion: formData.get("descripcion") as string,
      categoriaId: parseInt(formData.get("categoria") as string),
      proveedorId: parseInt(formData.get("proveedor") as string),
      precio: parseFloat(formData.get("precio") as string),
      stock: parseInt(formData.get("stock") as string),
      imagen: imagenPreview ?? "",
    };

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
      console.error("Error al guardar producto");
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

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Productos</h2>
        <Button
          onClick={abrirModalAgregar}
          className="flex gap-2 whitespace-nowrap"
        >
          <Plus size={18} /> Agregar producto
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Input
          placeholder="Buscar por nombre o categoría"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <Select onValueChange={setCategoriaFiltro} value={categoriaFiltro}>
          <SelectTrigger>
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
        />
        <Input
          type="number"
          placeholder="Precio máximo"
          value={precioMax}
          onChange={(e) => setPrecioMax(e.target.value)}
        />
      </div>

      <div className="flex items-center mb-4 gap-2">
        <input
          type="checkbox"
          id="stockBajo"
          checked={stockBajo}
          onChange={() => setStockBajo(!stockBajo)}
        />
        <label htmlFor="stockBajo" className="text-sm text-gray-700">
          Mostrar solo productos con stock bajo (≤ 10)
        </label>
      </div>

      <div className="overflow-x-auto rounded-xl shadow">
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
            {productosFiltrados.map((prod) => (
              <tr key={prod.id} className="border-t hover:bg-gray-50">
                <td className="px-6 py-4">
                  {prod.imagen ? (
                    <img
                      src={prod.imagen}
                      alt={prod.nombre}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded-md" />
                  )}
                </td>
                <td className="px-6 py-4 font-medium">{prod.nombre}</td>
                <td className="px-6 py-4">
                  {prod.categoria?.nombre || "Sin categoría"}
                </td>
                <td className="px-6 py-4">{prod.proveedor}</td>
                <td className="px-6 py-4">C${prod.precio}</td>
                <td className="px-6 py-4">{prod.stock}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => abrirModalEditar(prod)}
                    >
                      <Pencil size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500"
                      onClick={() => eliminarProducto(prod.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <Dialog open={modalAbierto} onOpenChange={setModalAbierto}>
        <DialogContent>
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
              />
            </div>

            <div>
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                name="descripcion"
                defaultValue={productoActual?.descripcion}
                required
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
                    <SelectTrigger className="flex-1">
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
                  <div className="flex items-start gap-2">
                    <div className="flex-1">
                      <Select
                        name="proveedor"
                        defaultValue={
                          productoActual?.proveedor?.toString() || ""
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar proveedor" />
                        </SelectTrigger>
                        <SelectContent>
                          {proveedores.map((prov) => (
                            <SelectItem
                              key={prov.id}
                              value={prov.id.toString()}
                            >
                              {prov.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setModalProveedor(true)}
                      className="px-2"
                    >
                      <List size={20} />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="precio">Precio</Label>
                <Input
                  type="number"
                  id="precio"
                  name="precio"
                  defaultValue={productoActual?.precio}
                  required
                />
              </div>
              <div>
                <Label htmlFor="stock">Stock</Label>
                <Input
                  type="number"
                  id="stock"
                  name="stock"
                  defaultValue={productoActual?.stock}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="imagen">Imagen</Label>
              <Input
                type="file"
                id="imagen"
                name="imagen"
                accept="image/*"
                onChange={handleImagenChange}
              />
              {imagenPreview && (
                <img
                  src={imagenPreview}
                  alt="preview"
                  className="mt-2 w-full h-40 object-cover rounded"
                />
              )}
            </div>

            <Button type="submit" className="w-full">
              {modoEdicion ? "Actualizar" : "Guardar"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/*Modal para agregar nueva categoria*/}
      <Dialog open={modalCategoria} onOpenChange={setModalCategoria}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva Categoría</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              value={nuevaCategoria}
              onChange={(e) => setNuevaCategoria(e.target.value)}
              placeholder="Nombre de la categoría"
            />
            {categorias.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  Categorías existentes
                </h4>
                {errorCategoria && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-3">
                    {errorCategoria}
                  </div>
                )}

                <ul className="divide-y divide-gray-200 max-h-48 overflow-y-auto">
                  {categorias.map((cat) => (
                    <li
                      key={cat.id}
                      className="flex justify-between items-center py-1 px-2 hover:bg-gray-50 rounded"
                    >
                      <span>{cat.nombre}</span>
                      <button
                        type="button"
                        className="text-red-500 text-sm hover:underline"
                        onClick={async () => {
                          const confirmar = confirm(
                            `¿Estás seguro de eliminar "${cat.nombre}"?`
                          );
                          if (!confirmar) return;

                          try {
                            const res = await fetch(
                              `/api/categorias/${cat.id}`,
                              {
                                method: "DELETE",
                              }
                            );
                            if (res.ok) {
                              setCategorias((prev) =>
                                prev.filter((c) => c.id !== cat.id)
                              );
                            } else {
                              const data = await res.json();
                              alert(data.error || "No se pudo eliminar");
                            }
                          } catch (err) {
                            console.error("Error al eliminar:", err);
                            alert("Error al eliminar categoría");
                          }
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <Button onClick={agregarCategoria}>Agregar</Button>
          </div>
        </DialogContent>
      </Dialog>

      <ModalSeleccionarProveedor
        abierto={modalProveedor}
        onClose={() => setModalProveedor(false)}
        proveedores={proveedores}
        onSeleccionar={(proveedor) =>
          setForm((prev) => ({ ...prev, proveedor }))
        }
      />
    </div>
  );
}
