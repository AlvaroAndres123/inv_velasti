'use client';


import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Pencil, Trash2, ImagePlus } from 'lucide-react';

interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  categoria: string;
  precio: number;
  stock: number;
  imagen?: string;
}

export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [productoActual, setProductoActual] = useState<Producto | null>(null);
  const [imagenPreview, setImagenPreview] = useState<string | null>(null);

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

  const guardarProducto = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;

    const nuevoProducto: Producto = {
      id: productoActual?.id || Date.now(),
      nombre: (form.nombre as any).value,
      descripcion: (form.descripcion as any).value,
      categoria: (form.categoria as any).value,
      precio: parseFloat((form.precio as any).value),
      stock: parseInt((form.stock as any).value),
      imagen: imagenPreview || undefined,
    };

    if (modoEdicion) {
      setProductos(productos.map(p => (p.id === nuevoProducto.id ? nuevoProducto : p)));
    } else {
      setProductos([...productos, nuevoProducto]);
    }

    setModalAbierto(false);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Productos</h2>
        <Button onClick={abrirModalAgregar} className="flex gap-2">
          <Plus size={18} /> Agregar producto
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl shadow">
        <table className="min-w-full text-sm text-left text-gray-700 bg-white">
          <thead className="bg-gray-100 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-6 py-4">Nombre</th>
              <th className="px-6 py-4">Categoría</th>
              <th className="px-6 py-4">Precio</th>
              <th className="px-6 py-4">Stock</th>
              <th className="px-6 py-4">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((prod) => (
              <tr key={prod.id} className="border-t hover:bg-gray-50">
                <td className="px-6 py-4 font-medium">{prod.nombre}</td>
                <td className="px-6 py-4">{prod.categoria}</td>
                <td className="px-6 py-4">C${prod.precio}</td>
                <td className="px-6 py-4">{prod.stock}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => abrirModalEditar(prod)}>
                      <Pencil size={16} />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-500">
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
            <DialogTitle>{modoEdicion ? 'Editar Producto' : 'Agregar Producto'}</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={guardarProducto}>
            <div>
              <Label htmlFor="nombre">Nombre</Label>
              <Input id="nombre" name="nombre" defaultValue={productoActual?.nombre} required />
            </div>

            <div>
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea id="descripcion" name="descripcion" defaultValue={productoActual?.descripcion} required />
            </div>

            <div>
              <Label htmlFor="categoria">Categoría</Label>
              <Select name="categoria" defaultValue={productoActual?.categoria || ''}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Maquillaje">Maquillaje</SelectItem>
                  <SelectItem value="Cuidado Facial">Cuidado Facial</SelectItem>
                  <SelectItem value="Uñas">Uñas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="precio">Precio</Label>
                <Input type="number" id="precio" name="precio" defaultValue={productoActual?.precio} required />
              </div>
              <div>
                <Label htmlFor="stock">Stock</Label>
                <Input type="number" id="stock" name="stock" defaultValue={productoActual?.stock} required />
              </div>
            </div>

            <div>
              <Label htmlFor="imagen">Imagen</Label>
              <Input type="file" id="imagen" name="imagen" accept="image/*" onChange={handleImagenChange} />
              {imagenPreview && (
                <img src={imagenPreview} alt="preview" className="mt-2 w-full h-40 object-cover rounded" />
              )}
            </div>

            <Button type="submit" className="w-full">
              {modoEdicion ? 'Actualizar' : 'Guardar'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
