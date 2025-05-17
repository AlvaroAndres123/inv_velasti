'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';

interface Movimiento {
  id: number;
  tipo: 'entrada' | 'salida';
  producto: string;
  cantidad: number;
  motivo: string;
  fecha: string;
}

export default function MovimientosPage() {
  const [tipoMovimiento, setTipoMovimiento] = useState<'entrada' | 'salida'>('entrada');
  const [form, setForm] = useState({ producto: '', cantidad: '', motivo: '' });
  const [movimientos, setMovimientos] = useState<Movimiento[]>([
    {
      id: 1,
      tipo: 'entrada',
      producto: 'Shampoo Hidratante',
      cantidad: 20,
      motivo: 'Compra a proveedor',
      fecha: '2025-05-15',
    },
    {
      id: 2,
      tipo: 'salida',
      producto: 'Labial Mate Rojo',
      cantidad: 5,
      motivo: 'Venta en mostrador',
      fecha: '2025-05-14',
    },
    {
      id: 3,
      tipo: 'entrada',
      producto: 'Crema Facial',
      cantidad: 15,
      motivo: 'Promoción de temporada',
      fecha: '2025-05-13',
    },
  ]);
  const [modalAbierto, setModalAbierto] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const nuevoMovimiento: Movimiento = {
      id: movimientos.length + 1,
      tipo: tipoMovimiento,
      producto: form.producto,
      cantidad: parseInt(form.cantidad),
      motivo: form.motivo || 'Sin especificar',
      fecha: new Date().toISOString().split('T')[0],
    };

    setMovimientos([nuevoMovimiento, ...movimientos]);
    setForm({ producto: '', cantidad: '', motivo: '' });
    setModalAbierto(false);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Movimientos de inventario</h2>
        <Button onClick={() => setModalAbierto(true)} className="flex gap-2">
          <Plus size={18} /> Nuevo movimiento
        </Button>
      </div>

      {/* Historial */}
      <h3 className="text-2xl font-semibold mb-4 text-gray-800">Historial</h3>
      <div className="overflow-x-auto rounded-xl shadow">
        <table className="min-w-full text-sm text-left text-gray-700 bg-white">
          <thead className="bg-gray-100 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-6 py-4">Fecha</th>
              <th className="px-6 py-4">Tipo</th>
              <th className="px-6 py-4">Producto</th>
              <th className="px-6 py-4">Cantidad</th>
              <th className="px-6 py-4">Motivo</th>
            </tr>
          </thead>
          <tbody>
            {movimientos.map((mov) => (
              <tr key={mov.id} className="border-t hover:bg-gray-50">
                <td className="px-6 py-4">{mov.fecha}</td>
                <td className={`px-6 py-4 font-semibold ${mov.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'}`}>
                  {mov.tipo.charAt(0).toUpperCase() + mov.tipo.slice(1)}
                </td>
                <td className="px-6 py-4">{mov.producto}</td>
                <td className="px-6 py-4">{mov.cantidad}</td>
                <td className="px-6 py-4">{mov.motivo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <Dialog open={modalAbierto} onOpenChange={setModalAbierto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar movimiento</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <Label>Tipo de movimiento</Label>
              <Select value={tipoMovimiento} onValueChange={(value) => setTipoMovimiento(value as 'entrada' | 'salida')}>
                <SelectTrigger>
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
              <Input
                id="producto"
                name="producto"
                value={form.producto}
                onChange={handleChange}
                placeholder="Nombre del producto"
                required
              />
            </div>

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
              />
            </div>

            <div>
              <Label htmlFor="motivo">Motivo (opcional)</Label>
              <Textarea
                id="motivo"
                name="motivo"
                value={form.motivo}
                onChange={handleChange}
                placeholder="Ej: Nueva compra, corrección de stock, venta..."
              />
            </div>

            <Button type="submit" className="w-full">
              Registrar {tipoMovimiento}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
