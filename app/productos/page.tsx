'use client';

import { useState } from 'react';

const productos = [
  { id: 1, nombre: 'Labial Matte', stock: 35, precio: 120, categoria: 'Maquillaje' },
  { id: 2, nombre: 'Crema Facial', stock: 12, precio: 180, categoria: 'Cuidado Facial' },
  { id: 3, nombre: 'Esmalte Rojo', stock: 50, precio: 60, categoria: 'Uñas' },
];

export default function ProductosPage() {
  const [modalAbierto, setModalAbierto] = useState(false);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Productos</h2>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          onClick={() => setModalAbierto(true)}
        >
          + Agregar producto
        </button>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded shadow">
          <thead>
            <tr className="bg-gray-100 text-left text-sm uppercase text-gray-600">
              <th className="px-6 py-3">Nombre</th>
              <th className="px-6 py-3">Categoría</th>
              <th className="px-6 py-3">Stock</th>
              <th className="px-6 py-3">Precio</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((prod) => (
              <tr key={prod.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4">{prod.nombre}</td>
                <td className="px-6 py-4">{prod.categoria}</td>
                <td className="px-6 py-4">{prod.stock}</td>
                <td className="px-6 py-4">C${prod.precio}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md relative">
            <button
              onClick={() => setModalAbierto(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
            >
              ✕
            </button>
            <h3 className="text-xl font-bold mb-4">Agregar nuevo producto</h3>
            <form className="space-y-4">
              <input
                type="text"
                placeholder="Nombre del producto"
                className="w-full border p-2 rounded"
              />
              <input
                type="text"
                placeholder="Categoría"
                className="w-full border p-2 rounded"
              />
              <input
                type="number"
                placeholder="Stock"
                className="w-full border p-2 rounded"
              />
              <input
                type="number"
                placeholder="Precio"
                className="w-full border p-2 rounded"
              />
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                Guardar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
