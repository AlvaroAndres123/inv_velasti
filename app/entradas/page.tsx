'use client';

import { useState } from 'react';

interface Entrada {
  id: number;
  producto: string;
  cantidad: number;
  motivo: string;
  fecha: string;
}

export default function EntradasPage() {
  const [form, setForm] = useState({ producto: '', cantidad: '', motivo: '' });
  const [entradas, setEntradas] = useState<Entrada[]>([
    {
      id: 1,
      producto: 'Crema Facial',
      cantidad: 10,
      motivo: 'Reposición mensual',
      fecha: '2025-05-07',
    },
    {
      id: 2,
      producto: 'Esmalte Rojo',
      cantidad: 25,
      motivo: 'Nueva compra',
      fecha: '2025-05-05',
    },
  ]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const nuevaEntrada: Entrada = {
      id: entradas.length + 1,
      producto: form.producto,
      cantidad: parseInt(form.cantidad),
      motivo: form.motivo || 'Sin especificar',
      fecha: new Date().toISOString().split('T')[0],
    };

    setEntradas([nuevaEntrada, ...entradas]);
    setForm({ producto: '', cantidad: '', motivo: '' });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Registrar entrada de producto</h2>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="bg-white shadow rounded p-6 max-w-lg space-y-4 mb-10">
        <div>
          <label className="block text-sm font-medium mb-1">Producto</label>
          <input
            type="text"
            name="producto"
            value={form.producto}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            placeholder="Nombre del producto"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Cantidad</label>
          <input
            type="number"
            name="cantidad"
            value={form.cantidad}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            min="1"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Motivo (opcional)</label>
          <textarea
            name="motivo"
            value={form.motivo}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            placeholder="Ej: Nueva compra, corrección de stock..."
          />
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Registrar entrada
        </button>
      </form>

      {/* Historial */}
      <h3 className="text-xl font-semibold mb-4">Historial de entradas</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded shadow">
          <thead>
            <tr className="bg-gray-100 text-left text-sm uppercase text-gray-600">
              <th className="px-6 py-3">Fecha</th>
              <th className="px-6 py-3">Producto</th>
              <th className="px-6 py-3">Cantidad</th>
              <th className="px-6 py-3">Motivo</th>
            </tr>
          </thead>
          <tbody>
            {entradas.map((entrada) => (
              <tr key={entrada.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4">{entrada.fecha}</td>
                <td className="px-6 py-4">{entrada.producto}</td>
                <td className="px-6 py-4">{entrada.cantidad}</td>
                <td className="px-6 py-4">{entrada.motivo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
