'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Pencil, Trash2 } from 'lucide-react';

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
  const [productos, setProductos] = useState<Producto[]>([
    {
      id: 1,
      nombre: 'Base HD Luminosa',
      descripcion: 'Base líquida de cobertura media con acabado natural.',
      categoria: 'Maquillaje',
      precio: 220,
      stock: 15,
      imagen: 'https://static.mujerhoy.com/www/multimedia/202210/26/media/cortadas/bases-de-maquillaje-luminosas-309891308_167580719198570maquillaje-serum-skin-illusion-velvet-krHB--624x624@MujerHoy.jpg',
    },
    {
      id: 2,
      nombre: 'Crema Hidratante con Ácido Hialurónico',
      descripcion: 'Hidrata profundamente y mejora la elasticidad de la piel.',
      categoria: 'Cuidado Facial',
      precio: 180,
      stock: 10,
      imagen: 'https://th.bing.com/th/id/OIP.UHxFL3bGYwZvoj8Z5vpLkwHaIp?cb=iwp2&rs=1&pid=ImgDetMain',
    },
    {
      id: 3,
      nombre: 'Esmalte Gel Rojo Rubí',
      descripcion: 'Color intenso con larga duración y acabado profesional.',
      categoria: 'Uñas',
      precio: 75,
      stock: 35,
      imagen: 'https://th.bing.com/th/id/OIP.CP9Fi_9UADvQbjQW_4UIYAHaKU?cb=iwp2&rs=1&pid=ImgDetMain',
    },
  ]);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [productoActual, setProductoActual] = useState<Producto | null>(null);
  const [imagenPreview, setImagenPreview] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');

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

  const productosFiltrados = productos.filter(prod =>
    prod.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    prod.categoria.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Productos</h2>
        <div className="flex gap-4 w-full md:w-auto">
          <Input
            placeholder="Buscar producto..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full md:w-64"
          />
          <Button onClick={abrirModalAgregar} className="flex gap-2 whitespace-nowrap">
            <Plus size={18} /> Agregar producto
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl shadow">
        <table className="min-w-full text-sm text-left text-gray-700 bg-white">
          <thead className="bg-gray-100 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-6 py-4">Imagen</th>
              <th className="px-6 py-4">Nombre</th>
              <th className="px-6 py-4">Categoría</th>
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
                    <img src={prod.imagen} alt={prod.nombre} className="w-16 h-16 object-cover rounded-md" />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded-md" />
                  )}
                </td>
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