'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';

export interface AutoCompleteProductoProps {
  productos: string[];
  valor: string;
  onSeleccion: (producto: string) => void;
}

export default function AutoCompleteProducto({
  productos,
  valor,
  onSeleccion,
}: AutoCompleteProductoProps) {
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);

  const filtrados = productos.filter((p) =>
    p.toLowerCase().includes(valor.toLowerCase())
  );

  return (
    <div className="relative">
      <Input
        name="producto"
        value={valor}
        onChange={(e) => {
          onSeleccion(e.target.value);
          setMostrarSugerencias(true);
        }}
        onBlur={() => setTimeout(() => setMostrarSugerencias(false), 100)}
        placeholder="Buscar producto..."
        required
        autoComplete="off"
      />

      {valor && mostrarSugerencias && (
        <ul className="absolute z-10 bg-white border rounded mt-1 w-full max-h-40 overflow-y-auto text-sm shadow">
          {filtrados.length > 0 ? (
            filtrados.map((p, i) => (
              <li
                key={i}
                className="px-3 py-2 hover:bg-blue-100 cursor-pointer"
                onMouseDown={() => onSeleccion(p)}
              >
                {p}
              </li>
            ))
          ) : (
            <li className="px-3 py-2 text-gray-500">Sin coincidencias</li>
          )}
        </ul>
      )}
    </div>
  );
}
